import { useEffect, useState } from "react";
import { getInventory, addProduct, updateProduct, deleteProduct, getImports, addImport, deleteImport } from "../services/api";

const CATEGORIES = [
  "Smart Door Lock", "Smart Touch Switchboard", "Curtain Motor",
  "Gate Motor", "Sensor", "Video Door Bell", "Pergola Automation", "Other",
];

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [imports, setImports] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [showForm, setShowForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteImportId, setDeleteImportId] = useState(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const role = localStorage.getItem("role");

  const [form, setForm] = useState({
    name: "", category: "", stock: "", price: "", description: "",
  });

  const [importForm, setImportForm] = useState({
    productId: "", productName: "", quantity: "", cost: "",
    supplier: "", shipment_date: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchImports();
  }, []);

  const fetchProducts = async () => {
    const data = await getInventory();
    console.log("Products from API:", data);
    setProducts(Array.isArray(data) ? data : []);
  };

  const fetchImports = async () => {
    const data = await getImports();
    setImports(Array.isArray(data) ? data : []);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleOpenAdd = () => {
    setForm({ name: "", category: "", stock: "", price: "", description: "" });
    setEditProduct(null);
    setShowForm(true);
  };

  const handleOpenEdit = (product) => {
    setForm({
      name: product.name, category: product.category,
      stock: product.stock, price: product.price,
      description: product.description || "",
    });
    setEditProduct(product);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || form.stock === "") {
      showToast("❌ Please fill name, category and stock");
      return;
    }
    try {
      if (editProduct) {
        await updateProduct(editProduct._id, form);
        showToast("✅ Product updated");
      } else {
        await addProduct(form);
        showToast("✅ Product added");
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      showToast("❌ Error saving product");
    }
  };

  const handleDelete = async () => {
    await deleteProduct(deleteId);
    setDeleteId(null);
    fetchProducts();
    showToast("✅ Product deleted");
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importForm.productId || !importForm.quantity || !importForm.shipment_date) {
      showToast("❌ Please fill product, quantity and shipment date");
      return;
    }
    try {
      await addImport({
        ...importForm,
        quantity: Number(importForm.quantity),
        cost: Number(importForm.cost),
      });
      showToast("✅ Import logged");
      setShowImportForm(false);
      setImportForm({ productId: "", productName: "", quantity: "", cost: "", supplier: "", shipment_date: "" });
      fetchImports();
      fetchProducts();
    } catch (err) {
      showToast("❌ Error logging import");
    }
  };

  const handleDeleteImport = async () => {
    await deleteImport(deleteImportId);
    setDeleteImportId(null);
    fetchImports();
    fetchProducts();
    showToast("✅ Import deleted");
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = (p.name?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const leaderboard = [...products].sort((a, b) => (a.stock || 0) - (b.stock || 0));

  const categoryStats = CATEGORIES.map((cat) => ({
    name: cat,
    count: products.filter((p) => p.category === cat).length,
    totalStock: products.filter((p) => p.category === cat).reduce((sum, p) => sum + (Number(p.stock) || 0), 0),
  })).filter((c) => c.count > 0);

  // ✅ Import stats
  const totalImportedValue = imports.reduce((sum, i) => sum + (Number(i.cost) || 0), 0);
  const totalImportedQty = imports.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const uniqueSuppliers = [...new Set(imports.map(i => i.supplier).filter(Boolean))].length;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Inventory</h1>
        <button
          onClick={activeTab === "inventory" ? handleOpenAdd : () => setShowImportForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          {activeTab === "inventory" ? "+ Add Product" : "+ Log Import"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
            activeTab === "inventory" ? "bg-orange-500 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
          }`}
        >
          📦 Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("imports")}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
            activeTab === "imports" ? "bg-orange-500 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
          }`}
        >
          🚢 China Imports ({imports.length})
        </button>
      </div>

      {/* ── INVENTORY TAB ── */}
      {activeTab === "inventory" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-gray-500 text-xs">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{products.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-gray-500 text-xs">Total Stock</p>
              <p className="text-2xl font-bold text-gray-800">
                {products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-gray-500 text-xs">Low Stock</p>
              <p className="text-2xl font-bold text-red-500">
                {products.filter((p) => Number(p.stock) <= 5).length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-gray-500 text-xs">Total Imported</p>
              <p className="text-2xl font-bold text-blue-600">{totalImportedQty} units</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm mb-5 flex flex-col md:flex-row gap-3">
            <input
              type="text" placeholder="Search product..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full md:w-64"
            />
            <select
              value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full md:w-auto"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto mb-6">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Product Name</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Stock</th>
                  <th className="p-4 text-left">Total Imported</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-400">No products found</td></tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{product.name}</td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">{product.category}</span>
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${Number(product.stock) <= 5 ? "text-red-500" : "text-gray-800"}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-blue-600 font-semibold">{product.totalImported || 0}</span>
                      </td>
                      <td className="p-4">₹{product.price || "—"}</td>
                      <td className="p-4">
                        {Number(product.stock) === 0 ? (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">Out of Stock</span>
                        ) : Number(product.stock) <= 5 ? (
                          <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">Low Stock</span>
                        ) : (
                          <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">In Stock</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleOpenEdit(product)} className="px-3 py-1 border rounded mr-2 text-sm">Edit</button>
                        {(role === "admin" || role === "inventory_manager") && (
                          <button onClick={() => setDeleteId(product._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3 mb-6">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No products found</p>
            ) : (
              filteredProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-800">{product.name}</p>
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">{product.category}</span>
                    </div>
                    {Number(product.stock) === 0 ? (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">Out of Stock</span>
                    ) : Number(product.stock) <= 5 ? (
                      <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">Low Stock</span>
                    ) : (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">In Stock</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm mt-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500 text-xs">Stock</p>
                      <p className={`font-semibold ${Number(product.stock) <= 5 ? "text-red-500" : ""}`}>{product.stock}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-gray-500 text-xs">Imported</p>
                      <p className="font-semibold text-blue-600">{product.totalImported || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500 text-xs">Price</p>
                      <p className="font-semibold">₹{product.price || "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleOpenEdit(product)} className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-600">Edit</button>
                    {(role === "admin" || role === "inventory_manager") && (
                      <button onClick={() => setDeleteId(product._id)} className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm">Delete</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h2 className="font-semibold mb-4">🏆 Product Leaderboard — Most Sold</h2>
            {leaderboard.length === 0 ? (
              <p className="text-gray-400 text-sm">No products yet</p>
            ) : (
              leaderboard.slice(0, 5).map((product, i) => (
                <div key={product._id} className="flex items-center justify-between border-b py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}</span>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${Number(product.stock) <= 5 ? "text-red-500" : "text-gray-700"}`}>
                    {product.stock} left
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Stock by Category */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h2 className="font-semibold mb-4">📦 Stock by Category</h2>
            {categoryStats.length === 0 ? (
              <p className="text-gray-400 text-sm">No products yet</p>
            ) : (
              categoryStats.map((cat, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <span className="text-sm text-gray-500">{cat.totalStock} units</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${Math.min((cat.totalStock / Math.max(...categoryStats.map(c => c.totalStock))) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── CHINA IMPORTS TAB ── */}
      {activeTab === "imports" && (
        <>
          {/* Import Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-blue-600 text-xs font-medium">Total Imported</p>
              <p className="text-2xl font-bold text-blue-600">{totalImportedQty} units</p>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-orange-600 text-xs font-medium">Total Cost</p>
              <p className="text-2xl font-bold text-orange-600">₹{totalImportedValue.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 col-span-2 md:col-span-1">
              <p className="text-green-600 text-xs font-medium">Suppliers</p>
              <p className="text-2xl font-bold text-green-600">{uniqueSuppliers}</p>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Quantity</th>
                  <th className="p-4 text-left">Cost</th>
                  <th className="p-4 text-left">Supplier</th>
                  <th className="p-4 text-left">Shipment Date</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {imports.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400">No imports logged yet</td></tr>
                ) : (
                  imports.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{item.productName}</td>
                      <td className="p-4">
                        <span className="text-blue-600 font-semibold">{item.quantity}</span>
                      </td>
                      <td className="p-4 text-green-600 font-semibold">₹{Number(item.cost).toLocaleString()}</td>
                      <td className="p-4">{item.supplier || "—"}</td>
                      <td className="p-4">{item.shipment_date || "—"}</td>
                      <td className="p-4">
                        {(role === "admin" || role === "inventory_manager") && (
                          <button onClick={() => setDeleteImportId(item._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-3">
            {imports.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No imports logged yet</p>
            ) : (
              imports.map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-bold text-gray-800">{item.productName}</p>
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">{item.quantity} units</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Cost:</span> <span className="text-green-600">₹{Number(item.cost).toLocaleString()}</span></p>
                    <p><span className="font-medium">Supplier:</span> {item.supplier || "—"}</p>
                    <p><span className="font-medium">Shipment Date:</span> {item.shipment_date || "—"}</p>
                  </div>
                  {(role === "admin" || role === "inventory_manager") && (
                    <button onClick={() => setDeleteImportId(item._id)} className="mt-3 w-full bg-red-500 text-white px-3 py-2 rounded-lg text-sm">Delete</button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editProduct ? "Edit Product" : "Add New Product"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Product Name" value={form.name} required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full" />
              <select value={form.category} required
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full">
                <option value="" disabled>Select Category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Stock Quantity" value={form.stock} required
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="border px-3 py-2 rounded-lg w-full" />
                <input type="number" placeholder="Price (₹)" value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="border px-3 py-2 rounded-lg w-full" />
              </div>
              <input placeholder="Description (optional)" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
                  {editProduct ? "Update" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Add Import Modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🚢 Log China Import</h3>
            <form onSubmit={handleImportSubmit} className="space-y-3">

              {/* Product dropdown */}
              <select
                value={importForm.productId} required
                onChange={(e) => {
                  const selected = products.find(p => p._id === e.target.value);
                  setImportForm({
                    ...importForm,
                    productId: e.target.value,
                    productName: selected?.name || ""
                  });
                }}
                className="border px-3 py-2 rounded-lg w-full"
              >
                {/* <option value="" disabled>Select Product</option> */}
                {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Quantity" value={importForm.quantity} required
                  onChange={(e) => setImportForm({ ...importForm, quantity: e.target.value })}
                  className="border px-3 py-2 rounded-lg w-full" />
                <input type="number" placeholder="Cost (₹)" value={importForm.cost}
                  onChange={(e) => setImportForm({ ...importForm, cost: e.target.value })}
                  className="border px-3 py-2 rounded-lg w-full" />
              </div>

              <input placeholder="Supplier Name" value={importForm.supplier}
                onChange={(e) => setImportForm({ ...importForm, supplier: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full" />

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Shipment Date *</label>
                <input type="date" value={importForm.shipment_date} required
                  onChange={(e) => setImportForm({ ...importForm, shipment_date: e.target.value })}
                  className="border px-3 py-2 rounded-lg w-full" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => setShowImportForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
                  Log Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Product</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Import Modal */}
      {deleteImportId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Import</h3>
            <p className="text-gray-500 text-sm mb-6">This will also reduce the total imported count for the product.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteImportId(null)} className="flex-1 px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
              <button onClick={handleDeleteImport} className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

    </div>
  );
}