import { useState, useEffect, useCallback } from "react";

const API = `${import.meta.env.VITE_API_URL}/api/movements`;

const todayStr = () => new Date().toISOString().split("T")[0];
const nowTime  = () => new Date().toTimeString().slice(0, 5);
const fmtDisplay = (ds) => { const [y, m, d] = ds.split("-"); return `${d}/${m}/${y}`; };
const getDaysInMonth     = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const makeDateStr = (y, m, d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ value }) => {
  const map = {
    Out:          { bg: "#fff3eb", color: "#c2410c" },
    Returned:     { bg: "#ecfdf5", color: "#15803d" },
    Installed:    { bg: "#eff6ff", color: "#1d4ed8" },
    Demo:         { bg: "#f5f3ff", color: "#6d28d9" },
    Delivery:     { bg: "#fefce8", color: "#854d0e" },
    Installation: { bg: "#eff6ff", color: "#1d4ed8" },
  };
  const s = map[value] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 600,
      padding: "3px 9px", borderRadius: 20, display: "inline-block",
    }}>{value}</span>
  );
};

// ─── Action Dropdown ──────────────────────────────────────────────────────────
const ActionDropdown = ({ entry, onMark, onDelete, onEdit }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          height: 32, padding: "0 14px", background: "#f97316",
          color: "#fff", border: "none", borderRadius: 8,
          fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}
      >
        Actions ▾
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
          <div style={{
            position: "fixed", right: 20, top: 120, zIndex: 9999,
            background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            minWidth: 170, overflow: "hidden",
          }}>
            {/* ✅ Edit */}
            <button onClick={() => { onEdit(entry); setOpen(false); }} style={dropItemSt("#f97316")}>
              ✏️ Edit
            </button>
            <div style={{ height: 1, background: "#f0f0f0" }} />
            {entry.status === "Out" && (
              <>
                <button onClick={() => { onMark(entry.id, "Returned"); setOpen(false); }} style={dropItemSt("#16a34a")}>
                  ✅ Mark Returned
                </button>
                <button onClick={() => { onMark(entry.id, "Installed"); setOpen(false); }} style={dropItemSt("#2563eb")}>
                  🔧 Mark Installed
                </button>
                <div style={{ height: 1, background: "#f0f0f0" }} />
              </>
            )}
            <button onClick={() => { onDelete(entry.id); setOpen(false); }} style={dropItemSt("#dc2626")}>
              🗑️ Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const PERSONS = ["Revathi", "Suresh", "Manoj", "Naveen", "Venkatesh"];

const emptyForm = (date) => ({
  product: "", client: "", person: "", type: "Demo",
  quantity: 1, date, out_time: nowTime(), notes: "",
});

const Modal = ({ open, onClose, onSave, selectedDate, dbPersons, editEntry }) => {
  const allPersons = [...new Set([...PERSONS, ...dbPersons])];
  const [form, setForm] = useState(emptyForm(selectedDate));

  useEffect(() => {
    if (open) {
      if (editEntry) {
        setForm({
          product:  editEntry.product  || "",
          client:   editEntry.client   || "",
          person:   editEntry.person   || "",
          type:     editEntry.type     || "Demo",
          quantity: editEntry.quantity || 1,
          date:     editEntry.date     || selectedDate,
          out_time: editEntry.out_time || nowTime(),
          notes:    editEntry.notes    || "",
        });
      } else {
        setForm(emptyForm(selectedDate));
      }
    }
  }, [open, selectedDate, editEntry]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.product.trim() || !form.client.trim() || !form.person.trim()) {
      alert("Product, client and sales person are required.");
      return;
    }
    onSave(form);
  };

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 14, padding: "1.75rem",
        width: 440, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: "1.25rem", color: "#111" }}>
          {editEntry ? "Edit movement" : "Log product out"}
        </h3>

        <div style={fieldWrap}>
          <label style={labelSt}>Product name *</label>
          <input value={form.product} onChange={e => set("product", e.target.value)}
            placeholder="e.g. Video Door Bell" style={inputSt} />
        </div>

        {/* ✅ Quantity */}
        <div style={fieldWrap}>
          <label style={labelSt}>Quantity *</label>
          <input type="number" min="1" value={form.quantity}
            onChange={e => set("quantity", Number(e.target.value))}
            style={inputSt} />
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>
            e.g. enter 2 if two video door bells are taken out
          </div>
        </div>

        <div style={fieldWrap}>
          <label style={labelSt}>Client name *</label>
          <input value={form.client} onChange={e => set("client", e.target.value)}
            placeholder="e.g. Kurapati Ashok" style={inputSt} />
        </div>

        <div style={fieldWrap}>
          <label style={labelSt}>Sales person / technician *</label>
          <select value={form.person} onChange={e => set("person", e.target.value)} style={inputSt}>
            <option value="">Select person</option>
            {allPersons.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div style={fieldWrap}>
          <label style={labelSt}>Movement type</label>
          <select value={form.type} onChange={e => set("type", e.target.value)} style={inputSt}>
            <option value="Demo">Demo — will come back</option>
            <option value="Delivery">Delivery — permanent to client</option>
            <option value="Installation">Installation — fitting at site</option>
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={labelSt}>Date</label>
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>Out time</label>
            <input type="time" value={form.out_time} onChange={e => set("out_time", e.target.value)} style={inputSt} />
          </div>
        </div>

        <div style={fieldWrap}>
          <label style={labelSt}>Notes (optional)</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
            placeholder="Any details..." rows={2}
            style={{ ...inputSt, height: 60, resize: "none", paddingTop: 8 }} />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.25rem" }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleSave} style={orangeBtn}>
            {editEntry ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductMovement() {
  const now = new Date();
  const [viewYear,     setViewYear]     = useState(now.getFullYear());
  const [viewMonth,    setViewMonth]    = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [entries,      setEntries]      = useState([]);
  const [stats,        setStats]        = useState({ Total: 0, Out: 0, Returned: 0, Installed: 0 });
  const [calDots,      setCalDots]      = useState({});
  const [filters,      setFilters]      = useState({ status: "", person: "", type: "" });
  const [dbPersons,    setDbPersons]    = useState([]);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editEntry,    setEditEntry]    = useState(null);
  const [loading,      setLoading]      = useState(false);

  const fetchMonthDots = useCallback(async () => {
    const from = makeDateStr(viewYear, viewMonth, 1);
    const to   = makeDateStr(viewYear, viewMonth, getDaysInMonth(viewYear, viewMonth));
    try {
      const res  = await fetch(`${API}?from_date=${from}&to_date=${to}`, { credentials: "include" });
      const data = await res.json();
      const dots = {};
      (Array.isArray(data) ? data : []).forEach(e => { dots[e.date] = true; });
      setCalDots(dots);
    } catch (e) { console.error(e); }
  }, [viewYear, viewMonth]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date: selectedDate });
      if (filters.status) params.append("status", filters.status);
      if (filters.person) params.append("person", filters.person);
      if (filters.type)   params.append("type",   filters.type);
      const res  = await fetch(`${API}?${params}`, { credentials: "include" });
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedDate, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/stats/summary?date=${selectedDate}`, { credentials: "include" });
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error(e); }
  }, [selectedDate]);

  const fetchPersons = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/meta/persons`, { credentials: "include" });
      const data = await res.json();
      setDbPersons(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchMonthDots(); }, [fetchMonthDots]);
  useEffect(() => { fetchEntries(); fetchStats(); }, [fetchEntries, fetchStats]);
  useEffect(() => { fetchPersons(); }, [fetchPersons]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (ds) => {
    setSelectedDate(ds);
    const [y, m] = ds.split("-").map(Number);
    setViewYear(y); setViewMonth(m - 1);
  };

  const handleSave = async (form) => {
    try {
      if (editEntry) {
        // ✅ Edit existing
        const res = await fetch(`${API}/${editEntry.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed");
      } else {
        // ✅ Create new
        const res = await fetch(API, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed");
      }
      setModalOpen(false);
      setEditEntry(null);
      fetchEntries(); fetchStats(); fetchMonthDots(); fetchPersons();
    } catch (e) { alert("Failed to save."); }
  };

  const markStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, return_time: nowTime() }),
      });
      if (!res.ok) throw new Error("Failed");
      fetchEntries(); fetchStats();
    } catch (e) { alert("Failed to update status."); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
      fetchEntries(); fetchStats(); fetchMonthDots();
    } catch (e) { alert("Failed to delete."); }
  };

  const handleEdit = (entry) => {
    setEditEntry(entry);
    setModalOpen(true);
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const daysInMonth  = getDaysInMonth(viewYear, viewMonth);
  const firstWeekDay = getFirstDayOfMonth(viewYear, viewMonth);
  const calCells     = [];
  for (let i = 0; i < firstWeekDay; i++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(makeDateStr(viewYear, viewMonth, d));

  const todayFull  = todayStr();
  const allPersons = [...new Set(["Revathi", "Suresh", "Manoj", "Naveen", ...dbPersons])];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f6", padding: "1.25rem 1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>Product Movement Log</h1>
          <p style={{ fontSize: 13, color: "#888", marginTop: 3 }}>Track products going out, returned, and installed</p>
        </div>
        <button onClick={() => { setEditEntry(null); setModalOpen(true); }} style={orangeBtn}>
          + Log product out
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: "1.5rem" }}
           className="md:grid-cols-4">
        {[
          { label: "Total out today", val: stats.Total,     color: "#111"    },
          { label: "Not returned",    val: stats.Out,       color: "#dc2626" },
          { label: "Returned",        val: stats.Returned,  color: "#16a34a" },
          { label: "Installed",       val: stats.Installed, color: "#2563eb" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color }}>{val ?? 0}</div>
          </div>
        ))}
      </div>

      {/* ✅ Responsive layout — stacks on mobile */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Calendar — full width on mobile, 300px on desktop */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: "1rem", minWidth: 280, flex: "0 0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <button onClick={prevMonth} style={navBtn}>‹</button>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} style={navBtn}>›</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4 }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#aaa", fontWeight: 600, padding: "2px 0" }}>{d}</div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
              {calCells.map((ds, i) => {
                if (!ds) return <div key={`empty-${i}`} />;
                const isSelected = ds === selectedDate;
                const isToday    = ds === todayFull;
                const hasDot     = calDots[ds];
                return (
                  <div key={ds} onClick={() => handleDayClick(ds)} style={{
                    borderRadius: 8, padding: "6px 2px", textAlign: "center", cursor: "pointer",
                    background: isSelected ? "#f97316" : isToday ? "#fff7ed" : "transparent",
                    border: isToday && !isSelected ? "1px solid #f97316" : "1px solid transparent",
                  }}>
                    <div style={{ fontSize: 12, fontWeight: isSelected || isToday ? 700 : 400, color: isSelected ? "#fff" : isToday ? "#f97316" : "#333" }}>
                      {Number(ds.split("-")[2])}
                    </div>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: hasDot ? (isSelected ? "#fff" : "#f97316") : "transparent", margin: "2px auto 0" }} />
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #f5f5f5", display: "flex", gap: 12 }}>
              {[{ color: "#f97316", label: "Selected", dot: false }, { color: "#f97316", label: "Has data", dot: true }].map(({ color, label, dot }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#888" }}>
                  {dot ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} /> : <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />}
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Table section */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 10, fontSize: 13, fontWeight: 600, color: "#555" }}>
              Showing: {fmtDisplay(selectedDate)}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>
              <select value={filters.status} onChange={e => setFilter("status", e.target.value)} style={selectSt}>
                <option value="">All status</option>
                <option value="Out">Out</option>
                <option value="Returned">Returned</option>
                <option value="Installed">Installed</option>
              </select>
              <select value={filters.type} onChange={e => setFilter("type", e.target.value)} style={selectSt}>
                <option value="">All types</option>
                <option value="Demo">Demo</option>
                <option value="Delivery">Delivery</option>
                <option value="Installation">Installation</option>
              </select>
              <select value={filters.person} onChange={e => setFilter("person", e.target.value)} style={selectSt}>
                <option value="">All persons</option>
                {allPersons.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* ✅ Desktop Table */}
            <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 12, overflow: "visibe" }}>
              {loading ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "#aaa" }}>Loading...</div>
              ) : entries.length === 0 ? (
                <div style={{ padding: "2.5rem", textAlign: "center", color: "#bbb" }}>No movements for {fmtDisplay(selectedDate)}</div>
              ) : (
                <div style={{ overflowX: "auto", overflowY: "visible"  }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#fafafa" }}>
                        {["Product", "Qty", "Client", "Sales person", "Type", "Out time", "Return time", "Status", "Actions"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, color: "#999", fontWeight: 600, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e, i) => (
                        <tr key={e.id} style={{ borderBottom: i < entries.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          <td style={tdSt}>
                            <span style={{ fontWeight: 500, color: "#111" }}>{e.product}</span>
                            {e.notes && <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{e.notes}</div>}
                          </td>
                          <td style={tdSt}>
                            <span style={{ fontWeight: 600, color: "#f97316" }}>{e.quantity || 1}</span>
                          </td>
                          <td style={tdSt}>{e.client}</td>
                          <td style={tdSt}>{e.person}</td>
                          <td style={tdSt}><Badge value={e.type} /></td>
                          <td style={{ ...tdSt, color: "#666" }}>{e.out_time || "—"}</td>
                          <td style={{ ...tdSt, color: "#666" }}>{e.return_time || "—"}</td>
                          <td style={tdSt}><Badge value={e.status} /></td>
                          <td style={tdSt}>
                            <ActionDropdown entry={e} onMark={markStatus} onDelete={handleDelete} onEdit={handleEdit} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditEntry(null); }}
        onSave={handleSave}
        selectedDate={selectedDate}
        dbPersons={dbPersons}
        editEntry={editEntry}
      />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const fieldWrap  = { marginBottom: 12 };
const labelSt    = { display: "block", fontSize: 12, color: "#666", marginBottom: 4, fontWeight: 500 };
const inputSt    = { width: "100%", height: 36, fontSize: 13, padding: "0 10px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9fafb", color: "#111", outline: "none" };
const selectSt   = { height: 34, fontSize: 13, padding: "0 10px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", color: "#333", cursor: "pointer" };
const orangeBtn  = { height: 36, padding: "0 18px", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const cancelBtn  = { height: 36, padding: "0 16px", background: "transparent", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#555" };
const navBtn     = { width: 28, height: 28, border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 16, color: "#555" };
const tdSt       = { padding: "11px 14px", verticalAlign: "middle", color: "#444" };
const dropItemSt = (color) => ({ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, fontWeight: 500, color, background: "transparent", border: "none", cursor: "pointer" });