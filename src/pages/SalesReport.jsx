import { useEffect, useState } from "react";
import { getLeads } from "../services/api";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    CartesianGrid, LineChart, Line,
    PieChart, Pie, Cell, Legend,
    ResponsiveContainer
} from "recharts";

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function SalesReport() {
    const [leads, setLeads] = useState([]);
    const [filter, setFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const data = await getLeads();
        setLeads(Array.isArray(data) ? data : []);
    };

    const now = new Date();

    const filteredLeads = leads.filter((l) => {
        if (!l.createdAt) return filter === "all";
        const date = new Date(l.createdAt);
        if (filter === "today") return date.toDateString() === now.toDateString();
        if (filter === "thisMonth") {
            return date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear();
        }
        if (filter === "lastMonth") {
            const last = new Date(now.getFullYear(), now.getMonth() - 1);
            return date.getMonth() === last.getMonth() &&
                date.getFullYear() === last.getFullYear();
        }
        if (filter === "last3months") {
            const from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            return date >= from && date <= now;
        }
        if (filter === "thisYear") return date.getFullYear() === now.getFullYear();
        return true;
    });

    const typeFiltered = filteredLeads.filter((l) => {
        if (typeFilter === "all") return true;
        return l.leadType === typeFilter;
    });

    const b2bLeads = filteredLeads.filter((l) => l.leadType === "B2B");
    const b2cLeads = filteredLeads.filter((l) => l.leadType === "B2C");
    const untaggedLeads = filteredLeads.filter((l) => !l.leadType);

    const b2bRevenue = b2bLeads.reduce((sum, l) => sum + (Number(l.advancePaid) || 0), 0);
    const b2cRevenue = b2cLeads.reduce((sum, l) => sum + (Number(l.advancePaid) || 0), 0);

    const b2bConverted = b2bLeads.filter((l) => Number(l.advancePaid || 0) > 0).length;
    const b2cConverted = b2cLeads.filter((l) => Number(l.advancePaid || 0) > 0).length;
    const untaggedConverted = untaggedLeads.filter((l) => Number(l.advancePaid || 0) > 0).length;

    const sources = ["Social Media", "Referral", "Phone Call", "Walk-in", "WhatsApp", "Ads", "Other"];
    const sourceData = sources.map((source) => ({
        name: source,
        total: typeFiltered.filter((l) => l.leadSource === source).length,
        b2b: typeFiltered.filter((l) => l.leadSource === source && l.leadType === "B2B").length,
        b2c: typeFiltered.filter((l) => l.leadSource === source && l.leadType === "B2C").length,
    })).filter((s) => s.total > 0);

    const monthlyTrend = MONTHS.map((month, i) => ({
        month,
        B2B: filteredLeads.filter((l) => {
            if (!l.createdAt) return false;
            const d = new Date(l.createdAt);
            return d.getMonth() === i && d.getFullYear() === now.getFullYear() && l.leadType === "B2B";
        }).length,
        B2C: filteredLeads.filter((l) => {
            if (!l.createdAt) return false;
            const d = new Date(l.createdAt);
            return d.getMonth() === i && d.getFullYear() === now.getFullYear() && l.leadType === "B2C";
        }).length,
    }));

    const salesPersons = [...new Set(leads.map((l) => l.salesPerson).filter(Boolean))];
    const salesPersonData = salesPersons.map((person) => {
        const personLeads = typeFiltered.filter((l) => l.salesPerson === person);
        return {
            name: person,
            b2b: personLeads.filter((l) => l.leadType === "B2B").length,
            b2c: personLeads.filter((l) => l.leadType === "B2C").length,
            total: personLeads.length,
        };
    }).sort((a, b) => b.total - a.total);

    const pieData = [
        { name: "B2B", value: b2bLeads.length },
        { name: "B2C", value: b2cLeads.length },
        { name: "Untagged", value: untaggedLeads.length },
    ].filter((d) => d.value > 0);

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sales Report</h1>
                    <p className="text-gray-500 text-sm">B2B & B2C lead analysis</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border px-3 py-2 rounded-lg text-sm bg-white"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="last3months">Last 3 Months</option>
                        <option value="thisYear">This Year</option>
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="border px-3 py-2 rounded-lg text-sm bg-white"
                    >
                        <option value="all">All Types</option>
                        <option value="B2B">B2B Only</option>
                        <option value="B2C">B2C Only</option>
                    </select>
                </div>
            </div>

            {/* ✅ Summary Cards — 5 cards including untagged */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <p className="text-orange-600 text-xs font-medium">B2B Leads</p>
                    <p className="text-2xl font-bold text-orange-600">{b2bLeads.length}</p>
                    <p className="text-xs text-gray-500 mt-1">{b2bConverted} converted</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-blue-600 text-xs font-medium">B2C Leads</p>
                    <p className="text-2xl font-bold text-blue-600">{b2cLeads.length}</p>
                    <p className="text-xs text-gray-500 mt-1">{b2cConverted} converted</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <p className="text-orange-600 text-xs font-medium">B2B Revenue</p>
                    <p className="text-2xl font-bold text-orange-600">₹{b2bRevenue}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-blue-600 text-xs font-medium">B2C Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">₹{b2cRevenue}</p>
                </div>
                {/* ✅ Untagged card */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 col-span-2 md:col-span-1">
                    <p className="text-gray-500 text-xs font-medium">⚠️ Untagged Leads</p>
                    <p className="text-2xl font-bold text-gray-600">{untaggedLeads.length}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {untaggedConverted} converted — assign B2B/B2C
                    </p>
                </div>
            </div>

            {/* Pie Chart + Source Chart */}
            <div className="grid md:grid-cols-2 gap-5 mb-6">

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <h3 className="font-semibold text-gray-700 mb-4">B2B vs B2C Split</h3>
                    {pieData.length === 0 ? (
                        <p className="text-gray-400 text-sm">No data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    <Cell fill="#f97316" />
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#9ca3af" />
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <h3 className="font-semibold text-gray-700 mb-4">Leads by Source</h3>
                    {sourceData.length === 0 ? (
                        <p className="text-gray-400 text-sm">No source data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={sourceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="b2b" name="B2B" fill="#f97316" />
                                <Bar dataKey="b2c" name="B2C" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                    Monthly Trend — B2B vs B2C ({now.getFullYear()})
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="B2B" stroke="#f97316" strokeWidth={2} />
                        <Line type="monotone" dataKey="B2C" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Salesperson Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                    Salesperson — B2B vs B2C Breakdown
                </h3>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Sales Person</th>
                                <th className="p-3 text-left">Total Leads</th>
                                <th className="p-3 text-left">B2B</th>
                                <th className="p-3 text-left">B2C</th>
                                <th className="p-3 text-left">B2B %</th>
                                <th className="p-3 text-left">B2C %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesPersonData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-gray-400">No data</td>
                                </tr>
                            ) : (
                                salesPersonData.map((person, i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium capitalize">{person.name}</td>
                                        <td className="p-3">{person.total}</td>
                                        <td className="p-3">
                                            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                                                {person.b2b}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                                                {person.b2c}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            {person.total > 0 ? ((person.b2b / person.total) * 100).toFixed(0) : 0}%
                                        </td>
                                        <td className="p-3">
                                            {person.total > 0 ? ((person.b2c / person.total) * 100).toFixed(0) : 0}%
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col gap-3">
                    {salesPersonData.map((person, i) => (
                        <div key={i} className="border rounded-xl p-4">
                            <p className="font-bold capitalize mb-3">{person.name}</p>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="bg-gray-50 rounded-lg p-2 text-center">
                                    <p className="text-gray-500 text-xs">Total</p>
                                    <p className="font-semibold">{person.total}</p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-2 text-center">
                                    <p className="text-orange-500 text-xs">B2B</p>
                                    <p className="font-semibold text-orange-600">{person.b2b}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-2 text-center">
                                    <p className="text-blue-500 text-xs">B2C</p>
                                    <p className="font-semibold text-blue-600">{person.b2c}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Source Detail */}
            <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Source Detail</h3>
                {sourceData.length === 0 ? (
                    <p className="text-gray-400 text-sm">No source data yet</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {sourceData.sort((a, b) => b.total - a.total).map((source, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-24 text-sm font-medium text-gray-700 shrink-0">
                                    {source.name}
                                </div>
                                <div className="flex-1">
                                    <div className="flex gap-1 mb-1">
                                        <span className="text-xs text-orange-600">B2B: {source.b2b}</span>
                                        <span className="text-xs text-gray-400 mx-1">|</span>
                                        <span className="text-xs text-blue-600">B2C: {source.b2c}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 flex overflow-hidden">
                                        {source.b2b > 0 && (
                                            <div
                                                className="bg-orange-500 h-2"
                                                style={{ width: `${(source.b2b / source.total) * 100}%` }}
                                            />
                                        )}
                                        {source.b2c > 0 && (
                                            <div
                                                className="bg-blue-500 h-2"
                                                style={{ width: `${(source.b2c / source.total) * 100}%` }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm font-semibold text-gray-700 w-8 text-right">
                                    {source.total}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}