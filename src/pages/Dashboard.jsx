import { useEffect, useState } from "react";
import { getLeads } from "../services/api";
import { useNavigate } from "react-router-dom";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LineChart,
    Line,
} from "recharts";

export default function Dashboard() {
    const [leads, setLeads] = useState([]);
    const [filter, setFilter] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const data = await getLeads();
        setLeads(data);
    };

    const now = new Date();

    const filteredLeads = leads.filter((l) => {
        if (!l.createdAt) return filter === "all";
        const date = new Date(l.createdAt);
        const now = new Date();

        if (filter === "today") {
            return date.toDateString() === now.toDateString();
        }
        if (filter === "week") {
            const firstDay = new Date();
            firstDay.setDate(now.getDate() - now.getDay());
            firstDay.setHours(0, 0, 0, 0);
            return date >= firstDay && date <= now;
        }
        if (filter === "month") {
            return date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear();
        }
        if (filter === "lastMonth") {
            const last = new Date(now.getFullYear(), now.getMonth() - 1);
            return date.getMonth() === last.getMonth() &&
                date.getFullYear() === last.getFullYear();
        }
        if (filter === "last2months") {
            const from = new Date(now.getFullYear(), now.getMonth() - 2, 1); // ✅ use Date constructor, not setMonth
            return date >= from && date <= now;
        }
        if (filter === "last3months") {
            const from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            return date >= from && date <= now;
        }
        if (filter === "last6months") {
            const from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            return date >= from && date <= now;
        }
        if (filter === "thisYear") {
            return date.getFullYear() === now.getFullYear();
        }

        return true;
    });

    const totalLeads = filteredLeads.length;
    const newLeads = filteredLeads.filter((l) => l.isNew === true).length;
    const interested = filteredLeads.filter((l) => l.status === "Interested").length;
    const converted = filteredLeads.filter((l) => l.status === "Closed Won").length;

    const revenue = filteredLeads.reduce(
        (sum, l) => sum + (Number(l.advancePaid) || 0),
        0
    );

    const pendingFollowUps = filteredLeads.filter(
        (l) => l.status !== "Closed Won"
    ).length;

    const stats = [
        { title: "Total Leads", value: totalLeads, icon: "👤", color: "bg-blue-100 text-blue-500" },
        { title: "New Leads", value: newLeads, icon: "➕", color: "bg-orange-100 text-orange-500" },
        { title: "Interested", value: interested, icon: "⭐", color: "bg-yellow-100 text-yellow-500" },
        { title: "Converted", value: converted, icon: "✅", color: "bg-green-100 text-green-500" },
        { title: "Revenue", value: `₹${revenue}`, icon: "₹", color: "bg-green-100 text-green-600" },
        { title: "Pending Follow-ups", value: pendingFollowUps, icon: "📅", color: "bg-gray-200 text-gray-600" },
    ];

    const today = new Date().toISOString().split("T")[0];

    const todayFollowUps = filteredLeads.filter((l) => {
        if (!l.followUpDate) return false;
        return l.followUpDate.split("T")[0] === today;
    });

    const overdue = filteredLeads.filter((l) => {
        if (!l.followUpDate) return false;
        if (l.status === "Closed Won" || l.status === "Closed Lost") return false; // ✅ exclude closed
        return l.followUpDate.split("T")[0] < today;
    });

    const statusData = [
        { name: "New", value: newLeads },
        { name: "Interested", value: interested },
        { name: "Quotation", value: filteredLeads.filter((l) => l.quotationSent).length },
        { name: "Closed", value: converted },
    ];

    const dateMap = {};

    filteredLeads.forEach((lead) => {
        const date = lead.createdAt
            ? new Date(lead.createdAt).toLocaleDateString()
            : "No Date";

        if (!dateMap[date]) {
            dateMap[date] = 0;
        }

        dateMap[date]++;
    });

    const timeData = Object.keys(dateMap).map((date) => ({
        date,
        leads: dateMap[date],
    }));

    return (
        <div className="p-6 bg-gray-50 min-h-screen">


            <div className="flex justify-between items-center mb-6">

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 text-sm">
                        Overview of your sales pipeline
                    </p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border px-4 py-2 rounded-lg bg-white shadow-sm"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="last2months">Last 2 Months</option>
                        <option value="last3months">Last 3 Months</option>
                        <option value="last6months">Last 6 Months</option>
                        <option value="thisYear">This Year</option>
                    </select>

                    <button
                        onClick={() => navigate("/add-lead")}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                    >
                        + Add New Lead
                    </button>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
                {stats.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-gray-500 text-sm">{item.title}</p>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {item.value}
                            </h2>
                        </div>

                        <div className={`w-10 h-10 flex items-center justify-center rounded-full ${item.color}`}>
                            {item.icon}
                        </div>
                    </div>
                ))}
            </div>


            <div className="grid md:grid-cols-2 gap-5 mt-8">

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <h3 className="text-gray-700 font-semibold mb-4">
                        Leads by Status
                    </h3>

                    <BarChart width={400} height={250} data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#f97316" />
                    </BarChart>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <h3 className="text-gray-700 font-semibold mb-4">
                        Leads Over Time
                    </h3>

                    <LineChart width={400} height={250} data={timeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="leads" stroke="#f97316" />
                    </LineChart>
                </div>

            </div>

            <div className="bg-white p-5 rounded-xl shadow mt-6">
                <h3 className="font-semibold mb-4">📌 Key Insights</h3>

                <div className="grid grid-cols-2 gap-4">


                    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                        <strong className="text-red-500">❌ Common Rejection</strong>
                        <p className="text-sm text-gray-600 mt-1">
                            {leads.find(l => l.rejectionReason)?.rejectionReason || "No data"}
                        </p>
                    </div>


                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                        <strong className="text-green-500">✅ Common Acceptance</strong>
                        <p className="text-sm text-gray-600 mt-1">
                            {leads.find(l => l.acceptanceReason)?.acceptanceReason || "No data"}
                        </p>
                    </div>

                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5 mt-8">

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <h3 className="font-semibold text-gray-700 mb-4">
                        Today's Follow-ups
                    </h3>

                    {todayFollowUps.length === 0 ? (
                        <p className="text-gray-400">No follow-ups today</p>
                    ) : (
                        todayFollowUps.map((lead) => (
                            <div
                                key={lead._id}
                                className="flex justify-between items-center border rounded-lg p-3 mb-2"
                            >
                                <div>
                                    <p className="font-medium">{lead.name}</p>
                                    <p className="text-sm text-gray-500">{lead.phone}</p>
                                </div>

                                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                                    {lead.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <h3 className="text-red-600 font-semibold mb-4">
                        ⚠️ Urgent — Overdue ({overdue.length})
                    </h3>

                    {overdue.length === 0 ? (
                        <p className="text-gray-400">No overdue leads</p>
                    ) : (
                        overdue.map((lead) => (
                            <div
                                key={lead._id}
                                className="flex justify-between items-center bg-white rounded-lg p-3 mb-2"
                            >
                                <div>
                                    <p className="font-medium">{lead.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Due {new Date(lead.followUpDate).toDateString()}
                                    </p>
                                </div>

                                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                                    {lead.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>

            </div>

        </div>
    );
}