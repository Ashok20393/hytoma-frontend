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

  const monthlyData = {};
  leads.forEach((lead) => {
    if (!lead.createdAt) return;
    const month = getMonthKey(lead.createdAt);
    const rawName = (lead.salesPerson || "").toLowerCase();
    const nameMap = { kk: "revathi", anusha: "manoj", jhjgj: "suresh" };
    const person = nameMap[rawName] || rawName;
    if (!monthlyData[month]) monthlyData[month] = {};
    if (!monthlyData[month][person]) monthlyData[month][person] = { revenue: 0 };
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
        const achieved = monthlyData[key]?.[person]?.revenue || 0;
        const prevCarry = carryForward[person] || 0;
        const target = baseTarget + prevCarry;
        const pending = target - achieved;
        finalData[key][person] = {
          achieved,
          target,
          pending,
          percentage: target > 0 ? ((achieved / target) * 100).toFixed(1) : 0,
        };
        if (monthlyData[key]?.[person]) {
          carryForward[person] = pending > 0 ? pending : 0;
        }
      });
    }
  });

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* ✅ Header — stacks on mobile */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <h1 className="text-2xl font-bold">Sales Performance</h1>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border px-3 py-2 rounded-lg text-sm flex-1 md:flex-none"
          >
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border px-3 py-2 rounded-lg text-sm flex-1 md:flex-none"
          >
            {monthsList.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ Desktop Table — hidden on mobile */}
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
              const revenue = finalData[selectedKey]?.[person]?.achieved || 0;

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

      {/* ✅ Mobile Cards — shown only on mobile */}
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
          const revenue = finalData[selectedKey]?.[person]?.achieved || 0;

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
                  <p className="font-semibold text-green-600">₹{revenue}</p>
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
        {Object.entries(finalData[selectedKey] || {}).map(([name, p], i) => (
          <div key={i} className="mb-5">
            <div className="flex justify-between mb-2">
              <span className="capitalize font-medium">{name}</span>
              {/* ✅ smaller text on mobile */}
              <span className="text-sm text-gray-600">₹{p.achieved} / ₹{p.target}</span>
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
        ))}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold mb-4">🏆 Leaderboard</h2>
        {Object.entries(finalData[selectedKey] || {})
          .sort((a, b) => b[1].achieved - a[1].achieved)
          .map(([name, p], i) => (
            <div key={i} className="flex justify-between items-center border-b py-3">
              <div className="flex items-center gap-2">
                {/* ✅ Show both number and medal */}
                <span className="text-gray-500 font-medium w-5">{i + 1}.</span>
                <span className="text-lg">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}
                </span>
                <span className="capitalize font-medium">{name}</span>
              </div>
              <span className="text-green-600 font-semibold">₹{p.achieved}</span>
            </div>
          ))}
      </div>

    </div>
  );
}