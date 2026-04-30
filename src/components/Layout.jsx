import { useState } from "react";
import { NavLink } from "react-router-dom";
import { logoutUser } from "../services/api";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`
        fixed z-30 top-0 left-0 h-full w-64 bg-white shadow-lg p-5 flex flex-col
        transform transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:z-auto
      `}>
        <h1 className="text-xl font-bold text-orange-500 mb-8">Hytoma CRM</h1>

        <nav className="flex flex-col gap-2">
          <NavItem to="/" label="Dashboard" onClick={() => setMenuOpen(false)} />
          <NavItem to="/leads" label="Leads" onClick={() => setMenuOpen(false)} />
          <NavItem to="/add-lead" label="Add Lead" onClick={() => setMenuOpen(false)} />
          <NavItem to="/sales" label="Sales Performance" onClick={() => setMenuOpen(false)} />
          <NavItem to="/inventory" label="Inventory" onClick={() => setMenuOpen(false)} />
          <NavItem to="/sales-report" label="Sales Report" onClick={() => setMenuOpen(false)} />
          <NavItem to="/complaints" label="Complaints" onClick={() => setMenuOpen(false)} />
          <NavItem to="/productmovement" label="Product Movement" onClick={() => setMenuOpen(false)} />
        </nav>

        <button
          onClick={logoutUser}
          className="mt-auto px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 text-left transition font-medium"
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-auto">

        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm">
          <h1 className="text-lg font-bold text-orange-500">Hytoma CRM</h1>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-gray-600 text-2xl"
          >
            ☰
          </button>
        </div>

        <div className="flex-1 bg-gray-50 p-4 md:p-6">
          {children}
        </div>
      </div>

    </div>
  );
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `px-4 py-3 rounded-lg transition ${isActive
          ? "bg-orange-100 text-orange-600 font-medium"
          : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {label}
    </NavLink>
  );
}