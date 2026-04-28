import { useEffect, useState } from "react";
import { getInventory, addProduct, updateProduct, deleteProduct } from "../services/api";

const CATEGORIES = [
  "Smart Door Lock",
  "Smart Touch Switchboard",
  "Curtain Motor",
  "Gate Motor",
  "Sensor",
  "Video Door Bell",
  "Pergola Automation",
  "Other",
];

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const role = localStorage.getItem("role");

  const [form, setForm] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await getInventory();
    setProducts(data);
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
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
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

  const filteredProducts = products.filter((p) => {
    const matchesSearch = (p.name?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 📊 Leaderboard — sort by stock sold (lowest stock = most sold)
  const leaderboard = [...products].sort((a, b) => (a.stock || 0) - (b.stock || 0));

  // 📊 Category stats
  const categoryStats = CATEGORIES.map((cat) => ({
    name: cat,
    count: products.filter((p) => p.category === cat).length,
    totalStock: products.filter((p) => p.category === cat).reduce((sum, p) => sum + (Number(p.stock) || 0), 0),
  })).filter((c) => c.count > 0);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Inventory</h1>
        <button
          onClick={handleOpenAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add Product
        </button>
      </div>

      {/* Stats Cards */}
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
          <p className="text-gray-500 text-xs">Categories</p>
          <p className="text-2xl font-bold text-gray-800">
            {new Set(products.map((p) => p.category)).size}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-5 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-auto"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto mb-6">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Product Name</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-semibold ${Number(product.stock) <= 5 ? "text-red-500" : "text-gray-800"}`}>
                      {product.stock}
                    </span>
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
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="px-3 py-1 border rounded mr-2 text-sm"
                    >
                      Edit
                    </button>
                    {role === "admin" && (
                      <button
                        onClick={() => setDeleteId(product._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
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
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                    {product.category}
                  </span>
                </div>
                {Number(product.stock) === 0 ? (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">Out of Stock</span>
                ) : Number(product.stock) <= 5 ? (
                  <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">Low Stock</span>
                ) : (
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">In Stock</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-500 text-xs">Stock</p>
                  <p className={`font-semibold ${Number(product.stock) <= 5 ? "text-red-500" : ""}`}>
                    {product.stock}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-500 text-xs">Price</p>
                  <p className="font-semibold">₹{product.price || "—"}</p>
                </div>
              </div>
              {product.description && (
                <p className="text-gray-500 text-xs mt-2">{product.description}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleOpenEdit(product)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-600"
                >
                  Edit
                </button>
                {role === "admin" && (
                  <button
                    onClick={() => setDeleteId(product._id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 📊 Product Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="font-semibold mb-4">🏆 Product Leaderboard — Most Sold</h2>
        {leaderboard.length === 0 ? (
          <p className="text-gray-400 text-sm">No products yet</p>
        ) : (
          leaderboard.slice(0, 5).map((product, i) => (
            <div key={product._id} className="flex items-center justify-between border-b py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"}
                </span>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${Number(product.stock) <= 5 ? "text-red-500" : "text-gray-700"}`}>
                  {product.stock} left
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 📊 Category Breakdown */}
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
                  style={{
                    width: `${Math.min((cat.totalStock / Math.max(...categoryStats.map(c => c.totalStock))) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editProduct ? "Edit Product" : "Add New Product"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Product Name"
                value={form.name}
                required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full"
                required
              >
                <option value="" disabled>Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={form.stock}
                  required
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  className="border px-3 py-2 rounded-lg w-full"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="border px-3 py-2 rounded-lg w-full"
                />
              </div>
              <input
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full"
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                >
                  {editProduct ? "Update" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Product</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete this product? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
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