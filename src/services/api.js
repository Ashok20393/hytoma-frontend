const API =  import.meta.env.VITE_API_URL;


export const getLeads = async () => {
  const res = await fetch(`${API}/leads`,{
    credentials:"include"
  });
  return res.json();
};

export const addLead = async (data) => {
  const res = await fetch(`${API}/leads`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateLead = async (id, data) => {
  const res = await fetch(`${API}/leads/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const logoutUser = async () => {
  await fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include",
  });
  localStorage.removeItem("role");
  window.location.href = "/login";
};

export const deleteLead = async (id) => {
  await fetch(`${API}/leads/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
};

export const getInventory = async () => {
  const res = await fetch(`${API}/inventory`, { credentials: "include" });
  return res.json();
};

export const addProduct = async (data) => {
  const res = await fetch(`${API}/inventory`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateProduct = async (id, data) => {
  const res = await fetch(`${API}/inventory/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteProduct = async (id) => {
  await fetch(`${API}/inventory/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
};