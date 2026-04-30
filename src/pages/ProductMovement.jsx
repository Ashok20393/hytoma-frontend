import { useState, useEffect, useCallback } from "react";

const API = `${import.meta.env.VITE_API_URL}/api/movements`;

const todayStr = () => new Date().toISOString().split("T")[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);
const fmtDisplay = (ds) => {
  const [y, m, d] = ds.split("-");
  return `${d}/${m}/${y}`;
};

// Badge
const Badge = ({ value }) => {
  const map = {
    Out: { bg: "#fff3eb", color: "#c2410c" },
    Returned: { bg: "#ecfdf5", color: "#15803d" },
    Installed: { bg: "#eff6ff", color: "#1d4ed8" },
    Demo: { bg: "#f5f3ff", color: "#6d28d9" },
    Delivery: { bg: "#fefce8", color: "#854d0e" },
    Installation: { bg: "#eff6ff", color: "#1d4ed8" },
  };
  const s = map[value] || { bg: "#eee", color: "#333" };
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: "3px 8px",
      borderRadius: 20,
      fontSize: 11
    }}>
      {value}
    </span>
  );
};

// Dropdown
const ActionDropdown = ({ entry, onMark, onDelete, onEdit }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  return (
    <div>
      <button
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos({
            top: rect.bottom + 5,
            left: rect.right - 170,
          });
          setOpen(!open);
        }}
        style={{
          background: "#f97316",
          color: "#fff",
          border: "none",
          padding: "6px 10px",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Actions ▾
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0 }} />
          <div style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 10,
            zIndex: 9999,
            minWidth: 150
          }}>
            <button onClick={() => onEdit(entry)}>Edit</button>
            <button onClick={() => onDelete(entry.id)}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
};

export default function ProductMovement() {

  // ✅ mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`${API}?date=${selectedDate}`);
    const data = await res.json();
    setEntries(data || []);
  }, [selectedDate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return (
    <div style={{ padding: 20 }}>

      <h2>Product Movement</h2>

      {/* 📱 MOBILE CARDS */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {entries.map((e) => (
            <div key={e.id} style={{
              background: "#fff",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #eee"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{e.product}</strong>
                <Badge value={e.status} />
              </div>

              <div style={{ fontSize: 13, marginTop: 8 }}>
                <p><b>Qty:</b> {e.quantity}</p>
                <p><b>Client:</b> {e.client}</p>
                <p><b>Person:</b> {e.person}</p>
                <p><b>Type:</b> {e.type}</p>
                <p><b>Out:</b> {e.out_time}</p>
                <p><b>Return:</b> {e.return_time || "-"}</p>
              </div>

              <ActionDropdown
                entry={e}
                onDelete={(id) => console.log(id)}
                onEdit={(e) => console.log(e)}
              />
            </div>
          ))}
        </div>
      ) : (

        // 💻 DESKTOP TABLE
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Client</th>
                <th>Person</th>
                <th>Type</th>
                <th>Out</th>
                <th>Return</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.product}</td>
                  <td>{e.quantity}</td>
                  <td>{e.client}</td>
                  <td>{e.person}</td>
                  <td>{e.type}</td>
                  <td>{e.out_time}</td>
                  <td>{e.return_time || "-"}</td>
                  <td><Badge value={e.status} /></td>
                  <td>
                    <ActionDropdown entry={e} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      )}

    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const fieldWrap = { marginBottom: 12 };
const labelSt = { display: "block", fontSize: 12, color: "#666", marginBottom: 4, fontWeight: 500 };
const inputSt = { width: "100%", height: 36, fontSize: 13, padding: "0 10px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9fafb", color: "#111", outline: "none" };
const selectSt = { height: 34, fontSize: 13, padding: "0 10px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#333", cursor: "pointer" };
const orangeBtn = { height: 36, padding: "0 18px", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const cancelBtn = { height: 36, padding: "0 16px", background: "transparent", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#555" };
const navBtn = { width: 28, height: 28, border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 16, color: "#555" };
const tdSt = { padding: "11px 14px", verticalAlign: "middle", color: "#444" };
const dropItemSt = (color) => ({ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, fontWeight: 500, color, background: "transparent", border: "none", cursor: "pointer" });