import { useEffect, useState } from "react";
import { getLeads } from "../services/api";

export default function SalesPerformance() {
  const [leads, setLeads] = useState([]);

  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth()
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getLeads();
    setLeads(data);
  };

  const targets = {
    revathi: 300000,
    manoj: 600000,
    suresh: 400000,
    naveen: 300000,
  };

  const monthsList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = [];
  for (let i = currentYear - 2; i <= currentYear + 3; i++) {
    years.push(i);
  }

  const getMonthKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()}`;
  };

  const selectedKey = `${selectedYear}-${selectedMonth}`;

  // ✅ Revenue grouped by PAYMENT MONTH
  const monthlyData = {};

  leads.forEach((lead) => {
    const reportDate =
      lead.paymentDate || lead.followUpDate;

    if (!reportDate) return;


    const month = getMonthKey(reportDate);

    const person = (lead.salesPerson || "")
      .toLowerCase()
      .trim();

    if (!monthlyData[month]) {
      monthlyData[month] = {};
    }

    if (!monthlyData[month][person]) {
      monthlyData[month][person] = {
        revenue: 0,
      };
    }

    monthlyData[month][person].revenue +=
      Number(lead.advancePaid) || 0;
  });

  const finalData = {};

Object.keys(targets).forEach((person) => {
  let carry = 0;

  // ✅ Find first activity month of salesperson
  const personLeads = leads.filter(
    (l) =>
      l.salesPerson?.toLowerCase() === person &&
      (l.paymentDate || l.followUpDate)
  );

  const dates = personLeads.map(
    (l) =>
      new Date(
        l.paymentDate || l.followUpDate
      )
  );

  let startYear = currentYear;
  let startMonth = 0;

  if (dates.length > 0) {
    const firstDate = new Date(
      Math.min(...dates)
    );

    startYear = firstDate.getFullYear();
    startMonth = firstDate.getMonth();
  }

  years.forEach((year) => {
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${m}`;

      if (!finalData[key]) {
        finalData[key] = {};
      }

      // ✅ Skip months before joining
      if (
        year < startYear ||
        (year === startYear &&
          m < startMonth)
      ) {
        finalData[key][person] = {
          achieved: 0,
          target: 0,
          pending: 0,
          percentage: 0,
        };

        continue;
      }

      const achieved =
        monthlyData[key]?.[person]?.revenue || 0;

      const target =
        targets[person] + carry;

      const pending = Math.max(
        target - achieved,
        0
      );

      const percentage =
        target > 0
          ? Math.min(
              (achieved / target) * 100,
              100
            ).toFixed(1)
          : 0;

      finalData[key][person] = {
        achieved,
        target,
        pending,
        percentage,
      };

      // ✅ Carry only previous pending
      carry = pending;
    }
  });
});

const selectedMonthData =
  finalData[selectedKey] || {};

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold">
          Sales Performance
        </h1>

        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(
                Number(e.target.value)
              )
            }
            className="border px-3 py-2 rounded-lg text-sm flex-1 md:flex-none"
          >
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(
                Number(e.target.value)
              )
            }
            className="border px-3 py-2 rounded-lg text-sm flex-1 md:flex-none"
          >
            {monthsList.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow mb-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">
                Sales Person
              </th>
              <th className="p-4 text-left">
                Leads
              </th>
              <th className="p-4 text-left">
                Converted
              </th>
              <th className="p-4 text-left">
                Revenue
              </th>
              <th className="p-4 text-left">
                Conversion
              </th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(targets).map(
              (person, i) => {
                const personLeads =
                  leads.filter((l) => {
                    const reportDate =
                      l.paymentDate || l.followUpDate;

                    return (
                      l.salesPerson?.toLowerCase() === person &&
                      reportDate &&
                      getMonthKey(reportDate) === selectedKey
                    );
                  });

                const total =
                  personLeads.length;

                const converted =
                  personLeads.filter(
                    (l) =>
                      Number(
                        l.advancePaid || 0
                      ) > 0
                  ).length;

                const conversion =
                  total > 0
                    ? (
                      (converted / total) *
                      100
                    ).toFixed(1)
                    : 0;

                const revenue =
                  selectedMonthData[
                    person
                  ]?.achieved || 0;

                return (
                  <tr
                    key={i}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4 capitalize font-medium">
                      {person}
                    </td>

                    <td className="p-4">
                      {total}
                    </td>

                    <td className="p-4">
                      {converted}
                    </td>

                    <td className="p-4 text-green-600 font-semibold">
                      ₹
                      {revenue.toLocaleString()}
                    </td>

                    <td className="p-4">
                      {conversion}%
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {/* Target vs Achieved */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="font-semibold mb-4">
          Target vs Achieved
        </h2>

        {Object.entries(
          selectedMonthData
        ).map(([name, p], i) => (
          <div key={i} className="mb-5">
            <div className="flex justify-between mb-2">
              <span className="capitalize font-medium">
                {name}
              </span>

              <span className="text-sm text-gray-600">
                ₹
                {p.achieved.toLocaleString()} / ₹
                {p.target.toLocaleString()}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${p.achieved >= p.target
                  ? "bg-green-500"
                  : "bg-orange-500"
                  }`}
                style={{
                  width: `${p.percentage}%`,
                }}
              />
            </div>

            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                {p.achieved >= p.target
                  ? "✅ Target achieved!"
                  : `Pending ₹${p.pending.toLocaleString()}`}
              </span>

              <span className="text-xs text-gray-500">
                {p.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}