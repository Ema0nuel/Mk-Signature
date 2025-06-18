import { Navbar } from "../components/Navbar.js";
import { showSpinner } from "../components/spinner.js";
import { supabase } from "../../../../assets/function/Data/db.js";
import { showNotificationToastr } from "../../../../assets/function/Util/notification.js";

// Helper: Format date
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// Helper: Money format
function formatMoney(amount) {
  return `<span class="text-green-600 font-bold"><i class="fa-solid fa-naira-sign"></i>${Number(amount).toLocaleString()}</span>`;
}

// Helper: Spinner
function spinnerHTML(size = 6) {
  return `<span class="inline-block align-middle ml-2">
    <svg class="animate-spin h-${size} w-${size} text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
  </span>`;
}

// Helper: Modal with animation and proper centering
function showModal(html) {
  let modal = document.getElementById("admin-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "admin-modal";
    modal.className = "fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center";
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl p-0 w-full max-w-2xl relative animate-zoom-in overflow-hidden">
      ${html}
    </div>
  `;
  modal.onclick = (e) => { if (e.target === modal) modal.classList.add("hidden"); };
  modal.classList.remove("hidden");
  modal.querySelectorAll(".close-modal").forEach(btn => btn.onclick = () => modal.classList.add("hidden"));
  return modal;
}

// Helper: Image Modal with animation and proper centering
function showImageModal(url) {
  showModal(`
    <button class="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl close-modal z-10">&times;</button>
    <div class="flex flex-col items-center justify-center p-6">
      <img src="${url}" alt="Product Image" class="rounded-lg shadow-lg border-4 border-pink-200 transition-transform duration-300 transform hover:scale-105 max-h-[70vh] max-w-full animate-fade-in" style="background:#f9fafb;" />
    </div>
  `);
}

// Animation keyframes for modal
const style = document.createElement("style");
style.innerHTML = `
@keyframes zoom-in { 0% {transform:scale(0.8);opacity:0;} 100% {transform:scale(1);opacity:1;} }
.animate-zoom-in { animation: zoom-in 0.25s cubic-bezier(.4,0,.2,1); }
@keyframes fade-in { 0% {opacity:0;} 100% {opacity:1;} }
.animate-fade-in { animation: fade-in 0.3s cubic-bezier(.4,0,.2,1); }
`;
document.head.appendChild(style);

export default async function adminManagement(renderPageHTML) {
  window.scrollTo(0,0)
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

  renderProductList(products);

  function renderProductList(productsList) {
    mainSection.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 class="text-2xl font-bold text-secondary flex items-center gap-2"><i class="fas fa-boxes-stacked text-pink-600"></i> Product Management</h1>
        <div class="flex gap-2">
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <input id="search-input" type="text" placeholder="Search products..." class="border pl-10 pr-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring w-48" />
          </div>
          <button id="add-product-btn" class="bg-gradient-to-r from-pink-500 to-pink-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-pink-600 hover:to-pink-800 transition flex items-center gap-2">
            <i class="fas fa-plus"></i> Add New Product
          </button>
        </div>
      </div>
      <div class="overflow-x-auto bg-white rounded-xl shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody id="products-tbody" class="bg-white divide-y divide-gray-100">
            ${productsList.map((p, i) => `
              <tr>
                <td class="px-4 py-3">${i + 1}</td>
                <td class="px-4 py-3">
                  <img src="${(p.images && p.images[0]?.url) || "/assets/images/default.png"}"
                    alt="${p.name}"
                    class="h-12 w-12 object-cover rounded border-2 border-pink-200 shadow cursor-pointer product-img-thumb transition-transform duration-200 hover:scale-110"
                    data-url="${(p.images && p.images[0]?.url) || "/assets/images/default.png"}"
                  />
                </td>
                <td class="px-4 py-3 font-semibold">${p.name}</td>
                <td class="px-4 py-3">${formatMoney(p.price)}</td>
                <td class="px-4 py-3">${p.stock}</td>
                <td class="px-4 py-3 text-xs">${Array.isArray(p.categories) ? p.categories.join(", ") : ""}</td>
                <td class="px-4 py-3 text-xs text-gray-500">${formatDate(p.created_at)}</td>
                <td class="px-4 py-3">
                  <button class="edit-btn flex items-center gap-1 text-white bg-gradient-to-r from-blue-500 to-blue-700 px-3 py-1 rounded shadow hover:from-blue-600 hover:to-blue-800 transition" data-id="${p.id}">
                    <i class="fas fa-edit"></i> Edit
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div id="pagination" class="mt-4 flex justify-end gap-2"></div>
      <div id="admin-modal" class="hidden"></div>
    `;

    mainSection.querySelector("#search-input").addEventListener("input", function () {
      const val = this.value.toLowerCase();
      const filtered = products.filter(p => p.name.toLowerCase().includes(val));
      renderProductList(filtered);
    });

    mainSection.querySelector("#add-product-btn").onclick = async () => {
      await showSpinner(mainSection, 500);
      renderEditProductPage();
    };

    mainSection.querySelectorAll(".edit-btn").forEach(btn => {
      btn.onclick = async () => {
        await showSpinner(mainSection, 500);
        renderEditProductPage(btn.dataset.id);
      };
    });

    
  }

  // --- Render Edit/Create Product Page (in the same page) ---
  async function renderEditProductPage(productId) {
    // Spinner while loading product details
    await showSpinner(mainSection, 400);

    // Fetch product if editing
    let product = null;
    if (productId) {
      const { data } = await supabase.from("products").select("*").eq("id", productId).single();
      product = data;
    }

    // Fetch all categories and tags for suggestions
    const { data: allProducts } = await supabase.from("products").select("categories,attributes");
    const allCategories = Array.from(new Set((allProducts || []).flatMap(p => p.categories || [])));
    const allTags = Array.from(new Set((allProducts || []).flatMap(p => (p.attributes?.tags || []))));

    // Helper for dynamic fields
    function renderDynamicList(list, type, icon, placeholder, btnLabel) {
      return `
        <div class="flex flex-wrap gap-2 mb-2" id="${type}-list">
          ${list.map((val, idx) => `
            <span class="flex items-center bg-pink-50 text-pink-700 px-2 py-1 rounded text-sm font-semibold">
              <i class="fas ${icon} mr-1"></i>${val}
              <button type="button" class="ml-2 text-red-500 remove-${type}" data-idx="${idx}"><i class="fas fa-times"></i></button>
            </span>
          `).join("")}
        </div>
        <div class="flex gap-2 mb-2">
          <input type="text" id="add-${type}-input" class="border rounded px-2 py-1 flex-1" placeholder="${placeholder}" list="suggest-${type}" />
          <datalist id="suggest-${type}">
            ${(type === "category" ? allCategories : allTags).map(val => `<option value="${val}">`).join("")}
          </datalist>
          <button type="button" id="add-${type}-btn" class="bg-pink-100 text-pink-700 px-3 py-1 rounded hover:bg-pink-200 transition flex items-center gap-1"><i class="fas fa-plus"></i> ${btnLabel}</button>
        </div>
      `;
    }

    // Helper for attributes
    function renderAttributes(attrs) {
      return `
        <div id="attributes-list" class="space-y-2 mb-2">
          ${Object.entries(attrs || {}).filter(([k]) => k !== "tags").map(([key, value], idx) => `
            <div class="flex gap-2 items-center attribute-row" data-idx="${idx}">
              <input type="text" class="attr-key border rounded px-2 py-1 w-1/3" value="${key}" placeholder="Attribute Name" />
              <input type="text" class="attr-value border rounded px-2 py-1 w-1/2" value="${value}" placeholder="Value" />
              <button type="button" class="remove-attribute text-red-500"><i class="fas fa-times"></i></button>
            </div>
          `).join("")}
        </div>
        <button type="button" id="add-attribute-btn" class="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition flex items-center gap-1"><i class="fas fa-plus"></i> Add Attribute</button>
      `;
    }

    // Helper for variants
    function renderVariants(variants) {
      return `
        <div id="variants-list" class="space-y-2 mb-2">
          ${(variants || []).map((v, idx) => `
            <div class="flex gap-2 items-center variant-row" data-idx="${idx}">
              <input type="text" class="variant-type border rounded px-2 py-1 w-1/4" value="${v.type || ""}" placeholder="Type (e.g. Color, Size)" />
              <input type="text" class="variant-value border rounded px-2 py-1 w-1/4" value="${v.value || ""}" placeholder="Value" />
              <input type="number" class="variant-price border rounded px-2 py-1 w-1/4" value="${v.price || ""}" placeholder="Price" />
              <input type="number" class="variant-stock border rounded px-2 py-1 w-1/4" value="${v.stock || ""}" placeholder="Stock" />
              <button type="button" class="remove-variant text-red-500"><i class="fas fa-times"></i></button>
            </div>
          `).join("")}
        </div>
        <button type="button" id="add-variant-btn" class="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition flex items-center gap-1"><i class="fas fa-plus"></i> Add Variant</button>
      `;
    }

    // Helper for images
    function renderImages(images) {
      return `
        <div class="flex flex-wrap gap-2 mt-2" id="image-preview">
          ${(images || []).map((img, idx) => `
            <div class="relative group">
              <img src="${img.url}" alt="${img.alt || ""}" class="h-16 w-16 object-cover rounded border-2 border-pink-200 cursor-pointer product-img-thumb transition-transform duration-200 hover:scale-110" data-url="${img.url}" />
              <button type="button" class="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-500 remove-image opacity-0 group-hover:opacity-100 transition" data-idx="${idx}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          `).join("")}
        </div>
      `;
    }

    // --- Render Edit/Create Product Page ---
    mainSection.innerHTML = `
      <div class="max-w-3xl mx-auto bg-gradient-to-br from-pink-50 via-white to-blue-50 rounded-xl shadow-lg p-8 mt-8 animate-fade-in border-2 border-pink-200">
        <button class="mb-4 text-pink-700 hover:underline flex items-center gap-1 font-semibold" id="back-btn"><i class="fas fa-arrow-left"></i> Back to Products</button>
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-700"><i class="fas fa-box-open"></i> ${product ? "Edit" : "Create"} Product</h2>
        <form id="product-form" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold mb-1 flex items-center gap-2 text-blue-700"><i class="fas fa-tag"></i> Name</label>
              <input type="text" name="name" required class="w-full border-2 border-blue-200 rounded px-3 py-2 focus:ring focus:border-blue-400" value="${product?.name || ""}" />
            </div>
            <div>
              <label class="block font-semibold mb-1 flex items-center gap-2 text-blue-700"><i class="fas fa-industry"></i> Brand</label>
              <input type="text" name="brand" class="w-full border-2 border-blue-200 rounded px-3 py-2 focus:ring focus:border-blue-400" value="${product?.brand || ""}" />
            </div>
          </div>
          <div>
            <label class="block font-semibold mb-1 flex items-center gap-2 text-pink-700"><i class="fas fa-align-left"></i> Description</label>
            <textarea name="description" required class="w-full border-2 border-pink-200 rounded px-3 py-2 min-h-[80px] focus:ring focus:border-pink-400">${product?.description || ""}</textarea>
          </div>
          <div>
            <label class="block font-semibold mb-1 flex items-center gap-2 text-pink-700"><i class="fas fa-file-alt"></i> Full Description</label>
            <textarea name="full_description" class="w-full border-2 border-pink-200 rounded px-3 py-2 min-h-[80px] focus:ring focus:border-pink-400">${product?.full_description || ""}</textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold mb-1 flex items-center gap-2 text-green-700"><i class="fas fa-money-bill"></i> Price (₦)</label>
              <input type="number" name="price" required min="0" step="0.01" class="w-full border-2 border-green-200 rounded px-3 py-2 focus:ring focus:border-green-400" value="${product?.price || ""}" />
            </div>
            <div>
              <label class="block font-semibold mb-1 flex items-center gap-2 text-green-700"><i class="fas fa-boxes"></i> Stock</label>
              <input type="number" name="stock" required min="0" class="w-full border-2 border-green-200 rounded px-3 py-2 focus:ring focus:border-green-400" value="${product?.stock || 0}" />
            </div>
          </div>
          <div>
            <label class="block font-semibold mb-1 flex items-center gap-2 text-blue-700"><i class="fas fa-barcode"></i> SKU</label>
            <input type="text" name="sku" class="w-full border-2 border-blue-200 rounded px-3 py-2 focus:ring focus:border-blue-400" value="${product?.sku || ""}" />
          </div>
          <div>
            <label class="block font-semibold mb-1 flex items-center gap-2 text-pink-700"><i class="fas fa-list"></i> Categories</label>
            ${renderDynamicList(product?.categories || [], "category", "fa-list", "Add category...", "Add Category")}
          </div>
          <div>
            <label class="block font-semibold mb-1 flex items-center gap-2 text-pink-700"><i class="fas fa-hashtag"></i> Hash Tags</label>
            ${renderDynamicList((product?.attributes?.tags || []), "tag", "fa-hashtag", "Add tag...", "Add Tag")}
          </div>
          <div>
            <label class="block font-semibold mb-1 flex items-center gap-2 text-blue-700"><i class="fas fa-cogs"></i> Attributes</label>
            ${renderAttributes(product?.attributes || {})}
          </div>
          <div>
            <label class="block font-semibold mb-1 flex items-center gap-2 text-green-700"><i class="fas fa-layer-group"></i> Variants</label>
            ${renderVariants(product?.variants || [])}
          </div>
          <div>
            <label class="block font-semibold mb-1 flex items-center gap-2 text-pink-700"><i class="fas fa-image"></i> Images</label>
            <input type="file" name="images" id="product-images" multiple accept="image/*" class="w-full" />
            ${renderImages(product?.images || [])}
          </div>
          <div class="flex gap-2 mt-6">
            <button type="submit" class="bg-gradient-to-r from-pink-500 to-pink-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-pink-600 hover:to-pink-800 transition flex items-center gap-2"><i class="fas fa-save"></i> ${product ? "Update" : "Create"}</button>
            <button type="button" id="cancel-btn" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-200 transition flex items-center gap-2"><i class="fas fa-times"></i> Cancel</button>
            ${product ? `<button type="button" id="delete-product-btn" class="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-red-200 transition flex items-center gap-2"><i class="fas fa-trash"></i> Delete</button>` : ""}
          </div>
        </form>
      </div>
    `;

    mainSection.querySelector("#back-btn").onclick = () => renderProductList(products);
    mainSection.querySelector("#cancel-btn").onclick = () => renderProductList(products);

    setupDynamicFields();

    function setupDynamicFields() {
      // Categories
      const catList = mainSection.querySelector("#category-list");
      mainSection.querySelector("#add-category-btn").onclick = () => {
        const val = mainSection.querySelector("#add-category-input").value.trim();
        if (val && ![...catList.children].some(e => e.textContent.includes(val))) {
          catList.innerHTML += `<span class="flex items-center bg-pink-50 text-pink-700 px-2 py-1 rounded text-sm font-semibold"><i class="fas fa-list mr-1"></i>${val}<button type="button" class="ml-2 text-red-500 remove-category"><i class="fas fa-times"></i></button></span>`;
        }
        mainSection.querySelector("#add-category-input").value = "";
        attachRemoveBtns("category");
      };
      attachRemoveBtns("category");

      // Tags
      const tagList = mainSection.querySelector("#tag-list");
      mainSection.querySelector("#add-tag-btn").onclick = () => {
        const val = mainSection.querySelector("#add-tag-input").value.trim();
        if (val && ![...tagList.children].some(e => e.textContent.includes(val))) {
          tagList.innerHTML += `<span class="flex items-center bg-pink-50 text-pink-700 px-2 py-1 rounded text-sm font-semibold"><i class="fas fa-hashtag mr-1"></i>${val}<button type="button" class="ml-2 text-red-500 remove-tag"><i class="fas fa-times"></i></button></span>`;
        }
        mainSection.querySelector("#add-tag-input").value = "";
        attachRemoveBtns("tag");
      };
      attachRemoveBtns("tag");

      // Attributes
      mainSection.querySelector("#add-attribute-btn").onclick = () => {
        const list = mainSection.querySelector("#attributes-list");
        const div = document.createElement("div");
        div.className = "flex gap-2 items-center attribute-row";
        div.innerHTML = `
          <input type="text" class="attr-key border rounded px-2 py-1 w-1/3" placeholder="Attribute Name" />
          <input type="text" class="attr-value border rounded px-2 py-1 w-1/2" placeholder="Value" />
          <button type="button" class="remove-attribute text-red-500"><i class="fas fa-times"></i></button>
        `;
        list.appendChild(div);
        div.querySelector(".remove-attribute").onclick = () => div.remove();
      };
      mainSection.querySelectorAll(".remove-attribute").forEach(btn => btn.onclick = () => btn.closest(".attribute-row").remove());

      // Variants
      mainSection.querySelector("#add-variant-btn").onclick = () => {
        const list = mainSection.querySelector("#variants-list");
        const div = document.createElement("div");
        div.className = "flex gap-2 items-center variant-row";
        div.innerHTML = `
          <input type="text" class="variant-type border rounded px-2 py-1 w-1/4" placeholder="Type (e.g. Color, Size)" />
          <input type="text" class="variant-value border rounded px-2 py-1 w-1/4" placeholder="Value" />
          <input type="number" class="variant-price border rounded px-2 py-1 w-1/4" placeholder="Price" />
          <input type="number" class="variant-stock border rounded px-2 py-1 w-1/4" placeholder="Stock" />
          <button type="button" class="remove-variant text-red-500"><i class="fas fa-times"></i></button>
        `;
        list.appendChild(div);
        div.querySelector(".remove-variant").onclick = () => div.remove();
      };
      mainSection.querySelectorAll(".remove-variant").forEach(btn => btn.onclick = () => btn.closest(".variant-row").remove());

      function attachRemoveBtns(type) {
        mainSection.querySelectorAll(`.remove-${type}`).forEach(btn => {
          btn.onclick = () => btn.parentElement.remove();
        });
      }

      // Image preview and modal
      mainSection.querySelectorAll(".product-img-thumb").forEach(img => {
        img.onclick = () => showImageModal(img.dataset.url);
      });
      mainSection.querySelectorAll(".remove-image").forEach(btn => {
        btn.onclick = () => btn.closest(".relative").remove();
      });
    }

    mainSection.querySelector("#product-form").onsubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const name = formData.get("name").trim();
      const description = formData.get("description").trim();
      const full_description = formData.get("full_description").trim();
      const price = Number(formData.get("price"));
      const stock = Number(formData.get("stock"));
      const sku = formData.get("sku").trim();
      const brand = formData.get("brand").trim();

      const categories = [...mainSection.querySelectorAll("#category-list span")].map(s => s.textContent.replace(/×$/, "").trim());
      const tags = [...mainSection.querySelectorAll("#tag-list span")].map(s => s.textContent.replace(/×$/, "").trim());

      const attributes = {};
      mainSection.querySelectorAll(".attribute-row").forEach(row => {
        const key = row.querySelector(".attr-key").value.trim();
        const value = row.querySelector(".attr-value").value.trim();
        if (key) attributes[key] = value;
      });
      if (tags.length) attributes.tags = tags;

      const variants = [];
      mainSection.querySelectorAll(".variant-row").forEach(row => {
        const type = row.querySelector(".variant-type").value.trim();
        const value = row.querySelector(".variant-value").value.trim();
        const price = Number(row.querySelector(".variant-price").value);
        const stock = Number(row.querySelector(".variant-stock").value);
        if (type || value || price || stock) {
          variants.push({ type, value, price, stock });
        }
      });

      let images = product?.images ? [...product.images] : [];
      const previewImgs = [...mainSection.querySelectorAll("#image-preview img")].map(img => img.src);
      images = images.filter(img => previewImgs.includes(img.url));
      const files = formData.getAll("images");
      if (files && files[0] && files[0].name) {
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

      const productData = {
        name, description, full_description, price, stock, sku, brand,
        categories,
        variants,
        images,
        attributes,
        updated_at: new Date().toISOString()
      };

      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;

      let result;
      if (product) {
        result = await supabase.from("products").update(productData).eq("id", product.id);
      } else {
        productData.created_at = new Date().toISOString();
        result = await supabase.from("products").insert([productData]);
      }

      if (!result.error) {
        showNotificationToastr(`Product ${product ? "updated" : "created"}!`, "success");
        let { data: newProducts } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        renderProductList(newProducts);
      } else {
        showNotificationToastr("Save failed!", "error");
        submitBtn.innerHTML = `<i class="fas fa-save"></i> ${product ? "Update" : "Create"}`;
      }
    };

    if (product) {
      const deleteBtn = mainSection.querySelector("#delete-product-btn");
      if (deleteBtn) {
        deleteBtn.onclick = async () => {
          if (!confirm("Are you sure you want to delete this product?")) return;
          deleteBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Deleting...`;
          const { error } = await supabase.from("products").delete().eq("id", product.id);
          if (!error) {
            showNotificationToastr("Product deleted!", "success");
            let { data: newProducts } = await supabase.from("products").select("*").order("created_at", { ascending: false });
            renderProductList(newProducts);
          } else {
            showNotificationToastr("Delete failed!", "error");
            deleteBtn.innerHTML = `<i class="fas fa-trash"></i> Delete`;
          }
        };
      }
    }
  }
}