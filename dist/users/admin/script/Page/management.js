import { Navbar } from "../components/Navbar.js";
import { showSpinner } from "../components/spinner.js";
import { supabase } from "../../../../assets/function/Data/db.js";
import { showNotificationToastr } from "../../../../assets/function/Util/notification.js";

// Helper: Format date
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default async function adminManagement(renderPageHTML) {
  // Render navbar and main section
  document.body.innerHTML = `
    ${Navbar("admin")}
    <div class="w-full md:pl-64 pt-8 pb-16 min-h-screen bg-gray-50 font-poppins">
      <main id="main-section" class="max-w-7xl mx-auto px-4"></main>
    </div>
  `;

  const mainSection = document.getElementById("main-section");
  await showSpinner(mainSection, 900);

  // --- Fetch products from Supabase ---
  let { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    mainSection.innerHTML = `<div class="text-red-600">Failed to load products.</div>`;
    return;
  }

  // --- Search & Filter ---
  mainSection.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <h1 class="text-2xl font-bold text-secondary">Product Management</h1>
      <div class="flex gap-2">
        <input id="search-input" type="text" placeholder="Search products..." class="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring w-48" />
        <button id="add-product-btn" class="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-700 transition">
          <i class="fas fa-plus mr-2"></i> Add New Product
        </button>
      </div>
    </div>
    <div class="overflow-x-auto bg-white rounded-xl shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variants</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody id="products-tbody" class="bg-white divide-y divide-gray-100">
          ${products.map((p, i) => `
            <tr>
              <td class="px-4 py-3">${i + 1}</td>
              <td class="px-4 py-3 font-semibold">${p.name}</td>
              <td class="px-4 py-3">₦${Number(p.price).toLocaleString()}</td>
              <td class="px-4 py-3">${p.stock}</td>
              <td class="px-4 py-3 text-xs">${Array.isArray(p.variants) ? p.variants.map(v => v.color || v.size || v.name).join(", ") : ""}</td>
              <td class="px-4 py-3 text-xs">${Array.isArray(p.categories) ? p.categories.join(", ") : ""}</td>
              <td class="px-4 py-3 text-xs text-gray-500">${formatDate(p.created_at)}</td>
              <td class="px-4 py-3 flex gap-2">
                <button class="edit-btn text-blue-600 hover:underline" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn text-red-600 hover:underline" data-id="${p.id}"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <div id="pagination" class="mt-4 flex justify-end gap-2"></div>
    <div id="product-modal" class="hidden fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center overflow-y-auto"></div>
  `;

  // --- Search functionality ---
  const searchInput = mainSection.querySelector("#search-input");
  searchInput.addEventListener("input", () => {
    const val = searchInput.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(val));
    renderTable(filtered);
  });

  // --- Render table function ---
  function renderTable(list) {
    const tbody = mainSection.querySelector("#products-tbody");
    tbody.innerHTML = list.map((p, i) => `
      <tr>
        <td class="px-4 py-3">${i + 1}</td>
        <td class="px-4 py-3 font-semibold">${p.name}</td>
        <td class="px-4 py-3">₦${Number(p.price).toLocaleString()}</td>
        <td class="px-4 py-3">${p.stock}</td>
        <td class="px-4 py-3 text-xs">${Array.isArray(p.variants) ? p.variants.map(v => v.color || v.size || v.name).join(", ") : ""}</td>
        <td class="px-4 py-3 text-xs">${Array.isArray(p.categories) ? p.categories.join(", ") : ""}</td>
        <td class="px-4 py-3 text-xs text-gray-500">${formatDate(p.created_at)}</td>
        <td class="px-4 py-3 flex gap-2">
          <button class="edit-btn text-blue-600 hover:underline" data-id="${p.id}"><i class="fas fa-edit"></i></button>
          <button class="delete-btn text-red-600 hover:underline" data-id="${p.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join("");
    attachRowEvents();
  }

  // --- Attach edit/delete events ---
  function attachRowEvents() {
    mainSection.querySelectorAll(".edit-btn").forEach(btn => {
      btn.onclick = () => openProductModal(btn.dataset.id);
    });
    mainSection.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = async () => {
        if (confirm("Delete this product?")) {
          const { error } = await supabase.from("products").delete().eq("id", btn.dataset.id);
          if (!error) {
            showNotificationToastr("Product deleted!", "success");
            window.loadPage("adminManagement");
          } else {
            showNotificationToastr("Delete failed!", "error");
          }
        }
      };
    });
  }

  // --- Add New Product Modal ---
  mainSection.querySelector("#add-product-btn").onclick = () => openProductModal();

  // --- Product Modal (Create/Edit) ---
  async function openProductModal(productId) {
    let product = null;
    if (productId) {
      const { data } = await supabase.from("products").select("*").eq("id", productId).single();
      product = data;
    }
    const modal = mainSection.querySelector("#product-modal");
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl relative animate-fade-in overflow-y-auto max-h-[90vh]">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl" id="close-modal">&times;</button>
        <h2 class="text-xl font-bold mb-4">${product ? "Edit" : "Add"} Product</h2>
        <form id="product-form" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold mb-1">Name</label>
              <input type="text" name="name" required class="w-full border rounded px-3 py-2" value="${product?.name || ""}" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Brand</label>
              <input type="text" name="brand" class="w-full border rounded px-3 py-2" value="${product?.brand || ""}" />
            </div>
          </div>
          <div>
            <label class="block font-semibold mb-1">Description</label>
            <textarea name="description" required class="w-full border rounded px-3 py-2 min-h-[80px]">${product?.description || ""}</textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold mb-1">Price (₦)</label>
              <input type="number" name="price" required min="0" step="0.01" class="w-full border rounded px-3 py-2" value="${product?.price || ""}" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Stock</label>
              <input type="number" name="stock" required min="0" class="w-full border rounded px-3 py-2" value="${product?.stock || 0}" />
            </div>
          </div>
          <div>
            <label class="block font-semibold mb-1">SKU</label>
            <input type="text" name="sku" class="w-full border rounded px-3 py-2" value="${product?.sku || ""}" />
          </div>
          <div>
            <label class="block font-semibold mb-1">Categories (comma separated)</label>
            <input type="text" name="categories" class="w-full border rounded px-3 py-2" value="${product?.categories ? product.categories.join(", ") : ""}" />
          </div>
          <div>
            <label class="block font-semibold mb-1">Hash Tags (comma separated)</label>
            <input type="text" name="tags" class="w-full border rounded px-3 py-2" value="${product?.attributes?.tags ? product.attributes.tags.join(", ") : ""}" />
          </div>
          <div>
            <label class="block font-semibold mb-1">Attributes (JSON, e.g. {"material":"cotton"})</label>
            <input type="text" name="attributes" class="w-full border rounded px-3 py-2" value='${product?.attributes ? JSON.stringify(product.attributes) : ""}' />
          </div>
          <div>
            <label class="block font-semibold mb-1">Variants</label>
            <div id="variants-list" class="space-y-2">
              ${(product?.variants || []).map((v, idx) => `
                <div class="flex gap-2 items-center variant-row" data-idx="${idx}">
                  <input type="text" placeholder="Color" class="variant-color border rounded px-2 py-1 w-1/4" value="${v.color || ""}" />
                  <input type="text" placeholder="Size" class="variant-size border rounded px-2 py-1 w-1/4" value="${v.size || ""}" />
                  <input type="number" placeholder="Price" class="variant-price border rounded px-2 py-1 w-1/4" value="${v.price || ""}" />
                  <input type="number" placeholder="Stock" class="variant-stock border rounded px-2 py-1 w-1/4" value="${v.stock || ""}" />
                  <button type="button" class="remove-variant text-red-500"><i class="fas fa-times"></i></button>
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-variant-btn" class="mt-2 px-3 py-1 bg-pink-100 text-pink-700 rounded hover:bg-pink-200 transition"><i class="fas fa-plus"></i> Add Variant</button>
          </div>
          <div>
            <label class="block font-semibold mb-1">Images</label>
            <input type="file" name="images" id="product-images" multiple accept="image/*" class="w-full" />
            <div class="flex flex-wrap gap-2 mt-2" id="image-preview">
              ${(product?.images || []).map(img => `
                <img src="${img.url}" alt="${img.alt || ""}" class="h-16 w-16 object-cover rounded border" />
              `).join("")}
            </div>
          </div>
          <div class="flex gap-2 mt-6">
            <button type="submit" class="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-700 transition">${product ? "Update" : "Create"}</button>
            <button type="button" id="cancel-modal" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 transition">Cancel</button>
          </div>
        </form>
      </div>
    `;
    modal.classList.remove("hidden");

    // Modal close/cancel
    modal.querySelector("#close-modal").onclick = () => modal.classList.add("hidden");
    modal.querySelector("#cancel-modal").onclick = () => modal.classList.add("hidden");

    // Modal overflow fix
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    };

    // Image preview
    const imageInput = modal.querySelector("#product-images");
    const imagePreview = modal.querySelector("#image-preview");
    imageInput?.addEventListener("change", () => {
      imagePreview.innerHTML = "";
      Array.from(imageInput.files).forEach(file => {
        const url = URL.createObjectURL(file);
        imagePreview.innerHTML += `<img src="${url}" class="h-16 w-16 object-cover rounded border" />`;
      });
    });

    // Variants dynamic add/remove
    const variantsList = modal.querySelector("#variants-list");
    modal.querySelector("#add-variant-btn").onclick = () => {
      const idx = variantsList.children.length;
      const div = document.createElement("div");
      div.className = "flex gap-2 items-center variant-row";
      div.innerHTML = `
        <input type="text" placeholder="Color" class="variant-color border rounded px-2 py-1 w-1/4" />
        <input type="text" placeholder="Size" class="variant-size border rounded px-2 py-1 w-1/4" />
        <input type="number" placeholder="Price" class="variant-price border rounded px-2 py-1 w-1/4" />
        <input type="number" placeholder="Stock" class="variant-stock border rounded px-2 py-1 w-1/4" />
        <button type="button" class="remove-variant text-red-500"><i class="fas fa-times"></i></button>
      `;
      variantsList.appendChild(div);
      div.querySelector(".remove-variant").onclick = () => div.remove();
    };
    variantsList.querySelectorAll(".remove-variant").forEach(btn => {
      btn.onclick = () => btn.closest(".variant-row").remove();
    });

    // Form submit
    modal.querySelector("#product-form").onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const name = formData.get("name").trim();
      const description = formData.get("description").trim();
      const price = Number(formData.get("price"));
      const stock = Number(formData.get("stock"));
      const sku = formData.get("sku").trim();
      const brand = formData.get("brand").trim();
      const categories = formData.get("categories").split(",").map(s => s.trim()).filter(Boolean);
      const tags = formData.get("tags").split(",").map(s => s.trim()).filter(Boolean);
      let attributes = {};
      try {
        attributes = formData.get("attributes") ? JSON.parse(formData.get("attributes")) : {};
      } catch {
        showNotificationToastr("Invalid attributes JSON!", "error");
        return;
      }
      if (tags.length) attributes.tags = tags;

      // Variants
      const variants = [];
      modal.querySelectorAll(".variant-row").forEach(row => {
        const color = row.querySelector(".variant-color").value.trim();
        const size = row.querySelector(".variant-size").value.trim();
        const price = Number(row.querySelector(".variant-price").value);
        const stock = Number(row.querySelector(".variant-stock").value);
        if (color || size || price || stock) {
          variants.push({ color, size, price, stock });
        }
      });

      // Handle images upload to Supabase Storage
      let images = product?.images || [];
      const files = formData.getAll("images");
      if (files && files[0] && files[0].name) {
        images = [];
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
          const { error } = await supabase.storage.from("products").upload(fileName, file);
          if (!error) {
            const url = supabase.storage.from("products").getPublicUrl(fileName).data.publicUrl;
            images.push({ url, alt: name });
          }
        }
      }

      // Prepare product data
      const productData = {
        name, description, price, stock, sku, brand,
        categories,
        variants,
        images,
        attributes,
        updated_at: new Date().toISOString()
      };

      let result;
      if (product) {
        // Update
        result = await supabase.from("products").update(productData).eq("id", product.id);
      } else {
        // Create
        productData.created_at = new Date().toISOString();
        result = await supabase.from("products").insert([productData]);
      }

      if (!result.error) {
        showNotificationToastr(`Product ${product ? "updated" : "created"}!`, "success");
        modal.classList.add("hidden");
        window.loadPage("adminManagement");
      } else {
        showNotificationToastr("Save failed!", "error");
      }
    };
  }

  // Attach row events for initial render
  attachRowEvents();
}