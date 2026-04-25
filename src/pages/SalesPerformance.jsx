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
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
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

  
  const monthlyData = {};

  leads.forEach((lead) => {
    if (!lead.createdAt) return;

    const month = getMonthKey(lead.createdAt);

    const rawName = (lead.salesPerson || "").toLowerCase();

    const nameMap = {
      kk: "revathi",
      anusha: "manoj",
      jhjgj: "suresh",
    };

    const person = nameMap[rawName] || rawName;

    if (!monthlyData[month]) monthlyData[month] = {};

    if (!monthlyData[month][person]) {
      monthlyData[month][person] = { revenue: 0 };
    }

    monthlyData[month][person].revenue += Number(lead.advancePaid) || 0;
  });

  
  const finalData = {};
  let carryForward = {};

  years.forEach((year) => {
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${m}`;
      finalData[key] = {};

      Object.keys(targets).forEach((person) => {
        const baseTarget = targets[person];

        const achieved =
          monthlyData[key]?.[person]?.revenue || 0;

        const prevCarry = carryForward[person] || 0;

        const target = baseTarget + prevCarry;
        const pending = target - achieved;

        finalData[key][person] = {
          achieved,
          target,
          pending,
          percentage:
            target > 0
              ? ((achieved / target) * 100).toFixed(1)
              : 0,
        };

        if (monthlyData[key]?.[person]) {
          carryForward[person] = pending > 0 ? pending : 0;
        }
      });
    }
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Performance</h1>

        <div className="flex gap-3">

          {/* YEAR */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border px-4 py-2 rounded-lg"
          >
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>

          {/* MONTH */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border px-4 py-2 rounded-lg"
          >
            {monthsList.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>

        </div>
      </div>

     
      <div className="bg-white rounded-xl shadow mb-6 overflow-hidden">
        <table className="w-full text-sm">
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
                (l) =>
                  Number(l.advancePaid || 0 )> 0
              ).length;

              const conversion =
                total > 0
                  ? ((converted / total) * 100).toFixed(1)
                  : 0;

              const revenue =
                finalData[selectedKey]?.[person]?.achieved || 0;

              return (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-4 capitalize font-medium">{person}</td>
                  <td className="p-4">{total}</td>
                  <td className="p-4">{converted}</td>
                  <td className="p-4 text-green-600 font-semibold">₹{revenue}</td>
                  <td className="p-4">{conversion}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* TARGET VS ACHIEVED */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="font-semibold mb-4">Target vs Achieved</h2>

        {Object.entries(finalData[selectedKey] || {}).map(
          ([name, p], i) => (
            <div key={i} className="mb-5">

              <div className="flex justify-between mb-2">
                <span className="capitalize font-medium">{name}</span>
                <span>₹{p.achieved} / ₹{p.target}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full"
                  style={{ width: `${p.percentage}%` }}
                ></div>
              </div>

              <div className="text-sm text-gray-500 mt-1">
                Pending ₹{p.pending}
              </div>

            </div>
          )
        )}
      </div>

      {/* LEADERBOARD */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold mb-4">🏆 Leaderboard</h2>

        {Object.entries(finalData[selectedKey] || {})
          .sort((a, b) => b[1].achieved - a[1].achieved)
          .map(([name, p], i) => (
            <div key={i} className="flex justify-between border-b py-2">
              <span>{i + 1}. {name}</span>
              <span className="text-green-600">₹{p.achieved}</span>
            </div>
          ))}
      </div>

    </div>
  );
}