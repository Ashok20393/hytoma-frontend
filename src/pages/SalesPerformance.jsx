import { useEffect, useState } from "react";
import { getLeads } from "../services/api";

export default function SalesPerformance() {
  const [leads, setLeads] = useState([]);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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

  // ✅ Group revenue by month and person
  const monthlyData = {};
  leads.forEach((lead) => {
    if (!lead.createdAt) return;
    const month = getMonthKey(lead.createdAt);
    const person = (lead.salesPerson || "").toLowerCase().trim();
    if (!monthlyData[month]) monthlyData[month] = {};
    if (!monthlyData[month][person]) monthlyData[month][person] = { revenue: 0 };
    monthlyData[month][person].revenue += Number(lead.advancePaid) || 0;
  });

  // ✅ Calculate all months with carry forward
const finalData = {};
const carryForward = {};

const today = new Date();

const allLeadDates = leads
  .filter((l) => l.createdAt)
  .map((l) => new Date(l.createdAt));

const firstLeadDate =
  allLeadDates.length > 0
    ? new Date(Math.min(...allLeadDates))
    : new Date();

const startYear = firstLeadDate.getFullYear();
const startMonth = firstLeadDate.getMonth();

years.forEach((year) => {
  for (let m = 0; m < 12; m++) {
    const key = `${year}-${m}`;
    finalData[key] = {};

    if (
      year < startYear ||
      (year === startYear && m < startMonth)
    ) {
      Object.keys(targets).forEach((person) => {
        finalData[key][person] = {
          achieved: 0,
          target: 0,
          pending: 0,
          percentage: 0,
        };
      });
      continue;
    }

    Object.keys(targets).forEach((person) => {
      const baseTarget = targets[person];

      const achieved =
        monthlyData[key]?.[person]?.revenue || 0;

      const prevCarry = carryForward[person] || 0;

      const target = baseTarget + prevCarry;

      const pending = Math.max(target - achieved, 0);

      const percentage =
        target > 0
          ? Math.min((achieved / target) * 100, 100).toFixed(1)
          : 0;

      finalData[key][person] = {
        achieved,
        target,
        pending,
        percentage,
      };


      const isPastOrCurrent =
        year < today.getFullYear() ||
        (year === today.getFullYear() &&
          m <= today.getMonth());

      if (isPastOrCurrent) {
        carryForward[person] = pending;
      }
    });
  }
});


const selectedMonthData = finalData[selectedKey] || {};

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold">Sales Performance</h1>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border px-3 py-2 rounded-lg text-sm flex-1 md:flex-none"
          >
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border px-3 py-2 rounded-lg text-sm flex-1 md:flex-none"
          >
            {monthsList.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow mb-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Sales Person</th>
              <th className="p-4 text-left">Leads</th>
              <th className="p-4 text-left">Converted</th>
              <th className="p-4 text-left">Revenue</th>
              <th className="p-4 text-left">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(targets).map((person, i) => {
              const personLeads = leads.filter(
                (l) =>
                  l.salesPerson?.toLowerCase() === person &&
                  l.createdAt &&
                  getMonthKey(l.createdAt) === selectedKey
              );
              const total = personLeads.length;
              const converted = personLeads.filter(
                (l) => Number(l.advancePaid || 0) > 0
              ).length;
              const conversion = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;
              const revenue = selectedMonthData[person]?.achieved || 0;

              return (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-4 capitalize font-medium">{person}</td>
                  <td className="p-4">{total}</td>
                  <td className="p-4">{converted}</td>
                  <td className="p-4 text-green-600 font-semibold">₹{revenue.toLocaleString()}</td>
                  <td className="p-4">{conversion}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3 mb-6">
        {Object.keys(targets).map((person, i) => {
          const personLeads = leads.filter(
            (l) =>
              l.salesPerson?.toLowerCase() === person &&
              l.createdAt &&
              getMonthKey(l.createdAt) === selectedKey
          );
          const total = personLeads.length;
          const converted = personLeads.filter(
            (l) => Number(l.advancePaid || 0) > 0
          ).length;
          const conversion = total > 0 ? ((converted / total) * 100).toFixed(1) : 0;
          const revenue = selectedMonthData[person]?.achieved || 0;

          return (
            <div key={i} className="bg-white rounded-xl shadow p-4">
              <p className="font-bold capitalize text-gray-800 mb-3">{person}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-500 text-xs">Leads</p>
                  <p className="font-semibold">{total}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-500 text-xs">Converted</p>
                  <p className="font-semibold">{converted}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-500 text-xs">Revenue</p>
                  <p className="font-semibold text-green-600">₹{revenue.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-500 text-xs">Conversion</p>
                  <p className="font-semibold">{conversion}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Target vs Achieved */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="font-semibold mb-4">Target vs Achieved</h2>
        {Object.entries(selectedMonthData).map(([name, p], i) => (
          <div key={i} className="mb-5">
            <div className="flex justify-between mb-2">
              <span className="capitalize font-medium">{name}</span>
              <span className="text-sm text-gray-600">
                ₹{p.achieved.toLocaleString()} / ₹{p.target.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  p.achieved >= p.target ? "bg-green-500" : "bg-orange-500"
                }`}
                style={{ width: `${p.percentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                {p.achieved >= p.target
                  ? "✅ Target achieved!"
                  : `Pending ₹${p.pending.toLocaleString()}`}
              </span>
              <span className="text-xs text-gray-500">{p.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold mb-4">🏆 Leaderboard</h2>
        {Object.entries(selectedMonthData)
          .sort((a, b) => b[1].achieved - a[1].achieved)
          .map(([name, p], i) => (
            <div key={i} className="flex justify-between items-center border-b py-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium w-5">{i + 1}.</span>
                <span className="text-lg">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}
                </span>
                <span className="capitalize font-medium">{name}</span>
              </div>
              <div className="text-right">
                <p className="text-green-600 font-semibold">₹{p.achieved.toLocaleString()}</p>
                {p.achieved >= p.target && (
                  <p className="text-xs text-green-500">Target hit! 🎉</p>
                )}
              </div>
            </div>
          ))}
      </div>

    </div>
  );
}