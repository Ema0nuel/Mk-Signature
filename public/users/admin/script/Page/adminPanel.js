import { supabase } from "/assets/function/Data/db.js";
import { formatMoneyAmount } from "/assets/function/Util/format.js";

export default async function renderAdminPanel(renderPageHTML, goTo) {
  // Fetch products, orders, users
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  renderPageHTML.innerHTML = `
    <section class="min-h-screen bg-gray-50">
      <nav class="flex justify-between items-center bg-white shadow px-8 py-4">
        <h1 class="text-2xl font-bold text-pink-700">Admin Panel</h1>
        <button id="admin-logout-btn" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Logout</button>
      </nav>
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="flex gap-4 mb-8">
          <button class="admin-tab-btn bg-pink-600 text-white px-4 py-2 rounded" data-tab="dashboard">Dashboard</button>
          <button class="admin-tab-btn bg-gray-200 text-gray-700 px-4 py-2 rounded" data-tab="products">Products</button>
          <button class="admin-tab-btn bg-gray-200 text-gray-700 px-4 py-2 rounded" data-tab="orders">Orders</button>
          <button class="admin-tab-btn bg-gray-200 text-gray-700 px-4 py-2 rounded" data-tab="users">Users</button>
        </div>
        <div id="admin-tab-dashboard" class="admin-tab-content">
          <h2 class="text-xl font-bold mb-4">Overview</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded shadow p-6 text-center">
              <div class="text-3xl font-bold text-pink-600">${
                products.length
              }</div>
              <div class="text-gray-500 mt-2">Products</div>
            </div>
            <div class="bg-white rounded shadow p-6 text-center">
              <div class="text-3xl font-bold text-indigo-600">${
                orders.length
              }</div>
              <div class="text-gray-500 mt-2">Orders</div>
            </div>
            <div class="bg-white rounded shadow p-6 text-center">
              <div class="text-3xl font-bold text-green-600">${
                users.length
              }</div>
              <div class="text-gray-500 mt-2">Users</div>
            </div>
          </div>
        </div>
        <div id="admin-tab-products" class="admin-tab-content hidden">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Products</h2>
            <button id="add-product-btn" class="bg-pink-600 text-white px-4 py-2 rounded">Add Product</button>
          </div>
          <div id="admin-product-list">
            ${
              products.length === 0
                ? `<div class="text-gray-500">No products found.</div>`
                : `
              <table class="w-full text-left border">
                <thead>
                  <tr>
                    <th class="p-2 border-b">Name</th>
                    <th class="p-2 border-b">Price</th>
                    <th class="p-2 border-b">Stock</th>
                    <th class="p-2 border-b">Image</th>
                    <th class="p-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${products
                    .map(
                      (p) => `
                    <tr>
                      <td class="p-2 border-b">${p.name}</td>
                      <td class="p-2 border-b"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
                        p.price
                      )}</td>
                      <td class="p-2 border-b">${p.stock || 0}</td>
                      <td class="p-2 border-b">${
                        p.image_url
                          ? `<img src="${p.image_url}" class="w-12 h-12 object-cover rounded" />`
                          : "No image"
                      }</td>
                      <td class="p-2 border-b">
                        <button class="edit-product-btn text-blue-600" data-id="${
                          p.id
                        }">Edit</button>
                        <button class="delete-product-btn text-red-600 ml-2" data-id="${
                          p.id
                        }">Delete</button>
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
            }
          </div>
          <div id="admin-product-form-modal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
              <button id="close-product-form" class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl">&times;</button>
              <h3 class="text-lg font-bold mb-4" id="product-form-title">Add Product</h3>
              <form id="admin-product-form" class="space-y-4">
                <div>
                  <label class="block font-semibold mb-1">Name</label>
                  <input type="text" name="name" required class="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Price</label>
                  <input type="number" name="price" required min="0" step="0.01" class="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Stock</label>
                  <input type="number" name="stock" required min="0" class="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Image</label>
                  <input type="file" name="image" accept="image/*" class="w-full border rounded px-3 py-2" />
                </div>
                <button type="submit" class="bg-pink-600 text-white px-6 py-2 rounded">Save</button>
              </form>
            </div>
          </div>
        </div>
        <div id="admin-tab-orders" class="admin-tab-content hidden">
          <h2 class="text-xl font-bold mb-4">Orders</h2>
          <div>
            ${
              orders.length === 0
                ? `<div class="text-gray-500">No orders found.</div>`
                : `
              <table class="w-full text-left border">
                <thead>
                  <tr>
                    <th class="p-2 border-b">Order ID</th>
                    <th class="p-2 border-b">User</th>
                    <th class="p-2 border-b">Total</th>
                    <th class="p-2 border-b">Status</th>
                    <th class="p-2 border-b">Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${orders
                    .map(
                      (o) => `
                    <tr>
                      <td class="p-2 border-b">${o.id.slice(0, 8)}</td>
                      <td class="p-2 border-b">${o.user_id}</td>
                      <td class="p-2 border-b"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
                        o.total
                      )}</td>
                      <td class="p-2 border-b">${o.status}</td>
                      <td class="p-2 border-b">${new Date(
                        o.created_at
                      ).toLocaleString()}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
            }
          </div>
        </div>
        <div id="admin-tab-users" class="admin-tab-content hidden">
          <h2 class="text-xl font-bold mb-4">Users</h2>
          <div>
            ${
              users.length === 0
                ? `<div class="text-gray-500">No users found.</div>`
                : `
              <table class="w-full text-left border">
                <thead>
                  <tr>
                    <th class="p-2 border-b">User ID</th>
                    <th class="p-2 border-b">Name</th>
                    <th class="p-2 border-b">Email</th>
                    <th class="p-2 border-b">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  ${users
                    .map(
                      (u) => `
                    <tr>
                      <td class="p-2 border-b">${u.id.slice(0, 8)}</td>
                      <td class="p-2 border-b">${u.full_name || ""}</td>
                      <td class="p-2 border-b">${u.email}</td>
                      <td class="p-2 border-b">${u.phone || ""}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            `
            }
          </div>
        </div>
      </div>
    </section>
  `;

  // Tab switching
  const tabBtns = renderPageHTML.querySelectorAll(".admin-tab-btn");
  const tabContents = renderPageHTML.querySelectorAll(".admin-tab-content");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("bg-pink-600", "text-white"));
      btn.classList.add("bg-pink-600", "text-white");
      tabContents.forEach((tab) => tab.classList.add("hidden"));
      const tabId = btn.dataset.tab;
      renderPageHTML
        .querySelector(`#admin-tab-${tabId}`)
        .classList.remove("hidden");
    });
  });
  tabBtns[0].click();

  // Logout
  renderPageHTML
    .querySelector("#admin-logout-btn")
    .addEventListener("click", () => {
      sessionStorage.removeItem("admin_logged_in");
      goTo("login");
    });

  // Add/Edit Product Modal
  const productModal = renderPageHTML.querySelector(
    "#admin-product-form-modal"
  );
  const addProductBtn = renderPageHTML.querySelector("#add-product-btn");
  const closeProductForm = renderPageHTML.querySelector("#close-product-form");
  const productForm = renderPageHTML.querySelector("#admin-product-form");
  let editingProductId = null;

  addProductBtn.addEventListener("click", () => {
    editingProductId = null;
    productForm.reset();
    renderPageHTML.querySelector("#product-form-title").textContent =
      "Add Product";
    productModal.classList.remove("hidden");
  });
  closeProductForm.addEventListener("click", () => {
    productModal.classList.add("hidden");
  });

  // Edit product
  renderPageHTML.querySelectorAll(".edit-product-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (product) {
        editingProductId = id;
        productForm.name.value = product.name;
        productForm.price.value = product.price;
        productForm.stock.value = product.stock || 0;
        renderPageHTML.querySelector("#product-form-title").textContent =
          "Edit Product";
        productModal.classList.remove("hidden");
      }
    });
  });

  // Delete product
  renderPageHTML.querySelectorAll(".delete-product-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (confirm("Delete this product?")) {
        await supabase.from("products").delete().eq("id", id);
        location.reload();
      }
    });
  });

  // Product form submit (add/edit)
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(productForm);
    const name = formData.get("name");
    const price = parseFloat(formData.get("price"));
    const stock = parseInt(formData.get("stock"));
    let image_url = null;

    // Handle image upload to bucket
    const imageFile = formData.get("image");
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile, { upsert: true });
      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        image_url = publicUrlData.publicUrl;
      }
    }

    const productObj = {
      name,
      price,
      stock,
    };
    if (image_url) productObj.image_url = image_url;

    if (editingProductId) {
      await supabase
        .from("products")
        .update(productObj)
        .eq("id", editingProductId);
    } else {
      await supabase.from("products").insert([productObj]);
    }
    productModal.classList.add("hidden");
    location.reload();
  });
}
