import { Navbar } from "../components/Navbar.js";
import { supabase } from "../../../../assets/function/Data/db.js";
import { showNotificationToastr } from "../../../../assets/function/Util/notification.js";
import { showSpinner } from "../components/spinner.js";

// Helper: Format date
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// Helper: Modal with animation, colored border, proper overflow, disables scroll, closes on overlay click
function showModal(html) {
  // Remove any existing modal
  let modal = document.getElementById("admin-modal");
  if (modal) modal.remove();

  // Create overlay/modal
  modal = document.createElement("div");
  modal.id = "admin-modal";
  modal.className = "fixed inset-0 z-[9999] bg-black bg-opacity-40 flex items-center justify-center";
  modal.style.backdropFilter = "blur(2px)";
  modal.innerHTML = `
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in overflow-y-auto max-h-[90vh] border-4 border-pink-300" style="box-shadow:0 8px 32px 0 rgba(200,100,150,0.13);">
      ${html}
    </div>
  `;
  document.body.appendChild(modal);

  // Disable scroll on body
  document.body.style.overflow = "hidden";

  // Close modal with close button or overlay click
  function closeModal() {
    modal.remove();
    document.body.style.overflow = "";
  }
  modal.querySelectorAll(".close-modal").forEach(btn => btn.onclick = closeModal);
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Focus first close button for accessibility
  const closeBtn = modal.querySelector(".close-modal");
  if (closeBtn) closeBtn.focus();

  return modal;
}

// Helper: Spinner HTML
function spinnerHTML(size = 6) {
  return `<span class="inline-block align-middle ml-2">
    <svg class="animate-spin h-${size} w-${size} text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
  </span>`;
}

// Helper: Money format
function formatMoney(amount) {
  return `<span class="text-pink-700 font-bold"><i class="fa-solid fa-naira-sign"></i>${Number(amount).toLocaleString()}</span>`;
}

// Helper: Fetch product details for order
async function fetchProductsByIds(ids) {
  if (!ids?.length) return {};
  const { data } = await supabase.from("products").select("*").in("id", ids);
  const map = {};
  (data || []).forEach(p => { map[p.id] = p; });
  return map;
}

// Helper: Delete user from Supabase Auth and role
async function deleteUserCompletely(userId, userEmail, adminKey) {
  await supabase.from("users").delete().eq("id", userId);
  await supabase.from("roles").delete().eq("user_id", userId);
  const res = await fetch("https://rddjqmqgndhtbrbcqmsf.supabase.co/auth/v1/admin/users/by_email", {
    method: "DELETE",
    headers: {
      "apikey": adminKey,
      "Authorization": `Bearer ${adminKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: userEmail })
  });
  return res.ok;
}

// Animation keyframes for modal
const style = document.createElement("style");
style.innerHTML = `
@keyframes fade-in { 0% {opacity:0; transform:scale(0.97);} 100% {opacity:1; transform:scale(1);} }
.animate-fade-in { animation: fade-in 0.22s cubic-bezier(.4,0,.2,1); }
body.modal-open { overflow: hidden !important; }
`;
document.head.appendChild(style);

export default async function adminUserManagement(renderPageHTML, userId = null) {
  document.body.innerHTML = `
    ${Navbar("users")}
    <div class="w-full md:pl-64 pt-8 pb-16 min-h-screen bg-gradient-to-br from-pink-50 via-white to-gray-50 font-poppins">
      <main id="main-section" class="max-w-7xl mx-auto px-4"></main>
    </div>
  `;

  const mainSection = document.getElementById("main-section");
  await showSpinner(mainSection, 600);

  // --- USER PROFILE PAGE ---
  if (userId) {
    mainSection.innerHTML = `<div class="flex justify-center items-center min-h-[40vh]"><div id="spinner"></div></div>`;
    await showSpinner(document.getElementById("spinner"), 400);

    // Fetch user details
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single();
    if (userError || !user) {
      mainSection.innerHTML = `<div class="text-red-600">User not found.</div>`;
      return;
    }

    // Fetch orders and payments for this user
    const [
      { data: orders = [] },
      { data: payments = [] }
    ] = await Promise.all([
      supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("admin_payments").select("*").eq("user_id", userId).order("created_at", { ascending: false })
    ]);

    mainSection.innerHTML = `
      <div class="mb-6 flex items-center gap-4">
        <button id="back-to-users" class="text-pink-700 hover:underline flex items-center gap-1 font-semibold"><i class="fas fa-arrow-left"></i> Back to Users</button>
        <h1 class="text-2xl font-bold text-secondary">User Profile</h1>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- User Details -->
        <section class="bg-white rounded-xl shadow p-6 flex flex-col gap-3 md:col-span-1 border-2 border-pink-200">
          <div class="flex items-center gap-4">
            <img src="${user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.full_name || user.email)}" class="w-20 h-20 rounded-full border-4 border-pink-200 object-cover" alt="Avatar" />
            <div>
              <div class="font-bold text-lg text-pink-700">${user.full_name || "-"}</div>
              <div class="text-gray-500 text-sm">${user.email}</div>
              <div class="text-xs text-gray-400">Joined: ${formatDate(user.created_at)}</div>
            </div>
          </div>
          <div>
            <div class="font-semibold text-pink-700">Phone:</div>
            <div>${user.phone || "-"}</div>
          </div>
          <div>
            <div class="font-semibold text-pink-700">Address:</div>
            <div>
              ${user.address?.street || ""} ${user.address?.city || ""} ${user.address?.zip || ""} ${user.address?.country || ""}
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <button id="delete-user-btn" class="bg-gradient-to-r from-pink-500 to-pink-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-pink-600 hover:to-pink-800 transition flex items-center gap-2">
              <i class="fas fa-user-slash"></i> Delete User
            </button>
          </div>
        </section>
        <!-- Transfers and Orders -->
        <section class="md:col-span-2 flex flex-col gap-8">
          <div class="bg-white rounded-xl shadow p-6 border-2 border-pink-100">
            <h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-700"><i class="fas fa-exchange-alt"></i> Transfers</h2>
            <ul class="divide-y" id="transfers-list">
              ${(payments && payments.length)
        ? payments.map(p => `<li class="py-2 flex items-center gap-2">
                    <button class="view-transfer-btn flex items-center gap-2 bg-pink-50 text-pink-800 hover:bg-pink-100 px-3 py-1 rounded transition font-semibold" data-id="${p.id}">
                      <i class="fas fa-credit-card"></i>
                      <span>₦${Number(p.amount).toLocaleString()} <span class="text-xs text-gray-400">(${p.status})</span></span>
                      <span class="text-xs text-gray-400">${formatDate(p.created_at)}</span>
                      <span class="ml-2 text-xs font-bold bg-pink-100 px-2 py-1 rounded">View</span>
                    </button>
                  </li>`).join("")
        : `<li class="text-gray-400 py-4 text-center">No transfers found.</li>`
      }
            </ul>
          </div>
          <div class="bg-white rounded-xl shadow p-6 border-2 border-pink-100">
            <h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-700"><i class="fas fa-shopping-cart"></i> Orders</h2>
            <ul class="divide-y" id="orders-list">
              ${(orders && orders.length)
        ? orders.map(o => `
                  <li class="py-2 flex flex-col md:flex-row md:items-center gap-2">
                    <button class="view-order-btn flex-1 flex items-center gap-2 bg-pink-50 text-pink-800 hover:bg-pink-100 px-3 py-1 rounded transition font-semibold" data-id="${o.id}">
                      <i class="fas fa-box"></i>
                      <span>Order #${o.id.slice(0, 8)} - ₦${Number(o.total).toLocaleString()}</span>
                      <span class="text-xs text-gray-500">Status: 
                        <span class="inline-block px-2 py-1 rounded text-xs font-semibold 
                          ${o.status === "delivered" ? "bg-green-100 text-green-700" :
            o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
              o.status === "paid" ? "bg-pink-100 text-pink-700" :
                o.status === "shipped" ? "bg-gray-200 text-gray-700" :
                  "bg-gray-100 text-gray-700"}">${o.status}</span>
                      </span>
                      <span class="text-xs text-gray-400">${formatDate(o.created_at)}</span>
                      <span class="ml-2 text-xs font-bold bg-pink-100 px-2 py-1 rounded">View</span>
                    </button>
                    ${o.status === "paid"
            ? `<button class="mark-delivered-btn bg-gradient-to-r from-green-500 to-green-700 text-white px-3 py-1 rounded text-xs font-semibold shadow hover:from-green-600 hover:to-green-800 transition flex items-center gap-1" data-id="${o.id}">
                          <i class="fas fa-check"></i> Mark as Delivered
                        </button>`
            : ""}
                  </li>
                `).join("")
        : `<li class="text-gray-400 py-4 text-center">No orders found.</li>`
      }
            </ul>
          </div>
        </section>
      </div>
      <div id="admin-modal" class="hidden"></div>
    `;

    // Back to users list
    mainSection.querySelector("#back-to-users").onclick = () => window.loadPage("adminUsersManagement");

    // Delete user (from users, roles, and auth)
    mainSection.querySelector("#delete-user-btn").onclick = async () => {
      if (confirm("Delete this user from all records and auth? This cannot be undone.")) {
        const adminKey = prompt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZGpxbXFnbmRodGJyYmNxbXNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk4Nzk5OCwiZXhwIjoyMDY1NTYzOTk4fQ.qsiNHU9x5wES4o0-JbOMjqaWD6AnLLCntS7bklpBI0M");
        if (!adminKey) return showNotificationToastr("No key provided.", "error");
        await showSpinner(mainSection, 600);
        const ok = await deleteUserCompletely(user.id, user.email, adminKey);
        if (ok) {
          showNotificationToastr("User deleted from all records!", "success");
          window.loadPage("adminUsersManagement");
        } else {
          showNotificationToastr("Delete failed!", "error");
        }
      }
    };

    // View transfer details in modal
    mainSection.querySelectorAll(".view-transfer-btn").forEach(btn => {
      btn.onclick = async () => {
        showModal(`<div class="flex justify-center items-center min-h-[30vh]">${spinnerHTML(8)}</div>`);
        const { data: payment } = await supabase.from("admin_payments").select("*").eq("id", btn.dataset.id).single();
        showModal(`
          <button class="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl close-modal z-10" aria-label="Close">&times;</button>
          <div class="p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-pink-700"><i class="fas fa-credit-card"></i> Transfer Details</h2>
            <div class="mb-2"><span class="font-semibold text-gray-700">Amount:</span> ${formatMoney(payment.amount)}</div>
            <div class="mb-2"><span class="font-semibold text-gray-700">Status:</span> <span class="capitalize">${payment.status}</span></div>
            <div class="mb-2"><span class="font-semibold text-gray-700">Date:</span> ${formatDate(payment.created_at)}</div>
            <div class="mb-2"><span class="font-semibold text-gray-700">Mk-Reference:</span> ${payment.reference || "-"}</div>
          </div>
        `);
      };
    });

    // View order details in modal
    mainSection.querySelectorAll(".view-order-btn").forEach(btn => {
      btn.onclick = async () => {
        showModal(`<div class="flex justify-center items-center min-h-[30vh]">${spinnerHTML(8)}</div>`);
        const { data: order } = await supabase.from("orders").select("*").eq("id", btn.dataset.id).single();
        let itemsArr = Array.isArray(order.items) && order.items.length ? order.items : (Array.isArray(order.products) ? order.products : []);
        const productIds = itemsArr.map(i => i.product_id || i.id).filter(Boolean);
        const productMap = await fetchProductsByIds(productIds);

        let itemsHTML = "";
        if (itemsArr.length) {
          itemsHTML = itemsArr.map(item => {
            const prod = productMap[item.product_id || item.id] || {};
            const img = Array.isArray(prod.images) && prod.images[0]?.url ? prod.images[0].url : "/assets/images/default.png";
            return `
              <div class="flex items-center gap-4 bg-pink-50 rounded-lg p-3 mb-3 shadow-sm animate-fade-in">
                <img src="${img}" class="w-16 h-16 object-cover rounded border-2 border-pink-200" alt="Product" />
                <div>
                  <div class="font-semibold text-pink-800">${prod.name || item.name || "Product"}</div>
                  <div class="text-sm text-gray-600">Qty: <span class="font-bold">${item.quantity || 1}</span></div>
                  <div class="text-sm text-gray-600">Price: ${formatMoney(item.price || prod.price || 0)}</div>
                  ${item.variant ? `<div class="text-xs text-gray-400">Variant: ${item.variant}</div>` : ""}
                  ${item.variants ? `<div class="text-xs text-gray-400">Variants: ${JSON.stringify(item.variants)}</div>` : ""}
                </div>
              </div>
            `;
          }).join("");
        } else {
          itemsHTML = `<div class="text-gray-400">No items found for this order.</div>`;
        }

        showModal(`
          <button class="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl close-modal z-10" aria-label="Close">&times;</button>
          <div class="p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-pink-700"><i class="fas fa-box"></i> Order Details</h2>
            <div class="mb-2"><span class="font-semibold text-gray-700">Order ID:</span> ${order.id}</div>
            <div class="mb-2"><span class="font-semibold text-gray-700">Date:</span> ${formatDate(order.created_at)}</div>
            <div class="mb-2"><span class="font-semibold text-gray-700">Status:</span> <span class="capitalize">${order.status}</span></div>
            <div class="mb-2"><span class="font-semibold text-gray-700">Total:</span> ${formatMoney(order.total)}</div>
            <div class="mt-6">
              <h3 class="font-semibold text-lg mb-2 flex items-center gap-2 text-pink-700"><i class="fas fa-boxes-stacked"></i> Items Ordered</h3>
              <div>
                ${itemsHTML}
              </div>
            </div>
          </div>
        `);
      };
    });

    // Mark order as delivered (for paid orders)
    mainSection.querySelectorAll(".mark-delivered-btn").forEach(btn => {
      btn.onclick = async () => {
        const orderId = btn.dataset.id;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Marking...`;
        const { error } = await supabase.from("orders").update({
          status: "delivered"
        }).eq("id", orderId);
        if (!error) {
          showNotificationToastr("Order marked as delivered!", "success");
          window.loadPage("adminUsersManagement", userId);
        } else {
          showNotificationToastr("Failed to update order.", "error");
          btn.innerHTML = `<i class="fas fa-check"></i> Mark as Delivered`;
        }
      };
    });

    return;
  }

  // --- USER LIST PAGE ---
  let { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    mainSection.innerHTML = `<div class="text-red-600">Failed to load users.</div>`;
    return;
  }

  mainSection.innerHTML = `
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
      <h1 class="text-2xl font-bold text-pink-700">User Management</h1>
      <div class="flex gap-2">
        <input id="search-input" type="text" placeholder="Search users..." class="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring w-48" />
      </div>
    </div>
    <div class="overflow-x-auto bg-white rounded-xl shadow border-2 border-pink-100">
      <table class="min-w-full divide-y divide-pink-100">
        <thead class="bg-pink-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-pink-700 uppercase">#</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-pink-700 uppercase">Avatar</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-pink-700 uppercase">Name</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-pink-700 uppercase">Email</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-pink-700 uppercase">Phone</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-pink-700 uppercase">Created</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-pink-700 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody id="users-tbody" class="bg-white divide-y divide-pink-50">
          ${users.map((u, i) => `
            <tr>
              <td class="px-4 py-3">${i + 1}</td>
              <td class="px-4 py-3">
                <img src="${u.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.full_name || u.email)}" class="w-10 h-10 rounded-full border-2 border-pink-200 object-cover shadow" alt="Avatar" />
              </td>
              <td class="px-4 py-3 font-semibold text-pink-700">${u.full_name || "-"}</td>
              <td class="px-4 py-3">${u.email}</td>
              <td class="px-4 py-3">${u.phone || "-"}</td>
              <td class="px-4 py-3 text-xs text-gray-500">${formatDate(u.created_at)}</td>
              <td class="px-4 py-3 flex gap-2">
                <button class="profile-btn bg-gradient-to-r from-pink-500 to-pink-700 text-white px-3 py-1 rounded shadow hover:from-pink-600 hover:to-pink-800 transition flex items-center gap-1" data-id="${u.id}">
                  <i class="fas fa-user"></i> Details
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <div id="admin-modal" class="hidden"></div>
  `;

  // --- Search functionality ---
  const searchInput = mainSection.querySelector("#search-input");
  searchInput.addEventListener("input", () => {
    const val = searchInput.value.toLowerCase();
    const filtered = users.filter(u =>
      (u.full_name || "").toLowerCase().includes(val) ||
      (u.email || "").toLowerCase().includes(val) ||
      (u.phone || "").toLowerCase().includes(val)
    );
    renderTable(filtered);
  });

  // --- Render table function ---
  function renderTable(list) {
    const tbody = mainSection.querySelector("#users-tbody");
    tbody.innerHTML = list.map((u, i) => `
      <tr>
        <td class="px-4 py-3">${i + 1}</td>
        <td class="px-4 py-3">
          <img src="${u.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.full_name || u.email)}" class="w-10 h-10 rounded-full border-2 border-pink-200 object-cover shadow" alt="Avatar" />
        </td>
        <td class="px-4 py-3 font-semibold text-pink-700">${u.full_name || "-"}</td>
        <td class="px-4 py-3">${u.email}</td>
        <td class="px-4 py-3">${u.phone || "-"}</td>
        <td class="px-4 py-3 text-xs text-gray-500">${formatDate(u.created_at)}</td>
        <td class="px-4 py-3 flex gap-2">
          <button class="profile-btn bg-gradient-to-r from-pink-500 to-pink-700 text-white px-3 py-1 rounded shadow hover:from-pink-600 hover:to-pink-800 transition flex items-center gap-1" data-id="${u.id}">
            <i class="fas fa-user"></i> Details
          </button>
        </td>
      </tr>
    `).join("");
    attachRowEvents();
  }

  // --- Attach profile events ---
  function attachRowEvents() {
    mainSection.querySelectorAll(".profile-btn").forEach(btn => {
      btn.onclick = () => window.loadPage("adminUsersManagement", btn.dataset.id);
    });
  }

  attachRowEvents();
}