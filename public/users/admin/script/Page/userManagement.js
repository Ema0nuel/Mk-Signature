import { Navbar } from "../components/Navbar.js";
import { supabase } from "../../../../assets/function/Data/db.js";
import { showNotificationToastr } from "../../../../assets/function/Util/notification.js";
import { showSpinner } from "../components/spinner.js";

// Helper: Format date
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// Helper: Get last 24 hours ISO string
function getLast24HoursISO() {
  const d = new Date();
  d.setHours(d.getHours() - 24);
  return d.toISOString();
}

export default async function adminUserManagement(renderPageHTML, userId = null) {
  document.body.innerHTML = `
    ${Navbar("users")}
    <div class="w-full md:pl-64 pt-8 pb-16 min-h-screen bg-gray-50 font-poppins">
      <main id="main-section" class="max-w-7xl mx-auto px-4"></main>
    </div>
  `;

  const mainSection = document.getElementById("main-section");

  // Show spinner initially
  await showSpinner(mainSection, 600);

  // If a userId is provided, show user profile page
  if (userId) {
    // Show spinner while loading user details
    mainSection.innerHTML = `<div class="flex justify-center items-center min-h-[40vh]"><div id="spinner"></div></div>`;
    await showSpinner(document.getElementById("spinner"), 400);

    // Fetch user details
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single();
    if (userError || !user) {
      mainSection.innerHTML = `<div class="text-red-600">User not found.</div>`;
      return;
    }

    // Fetch orders, payments, and activity logs for this user (recent = last 24h)
    const last24h = getLast24HoursISO();
    const [
      { data: orders = [] },
      { data: payments = [] },
      { data: logs = [] },
      { data: recentOrders = [] },
      { data: recentPayments = [] }
    ] = await Promise.all([
      supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("admin_payments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("admin").select("*").eq("event_data->>user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("orders").select("*").eq("user_id", userId).gte("created_at", last24h).order("created_at", { ascending: false }).limit(2),
      supabase.from("admin_payments").select("*").eq("user_id", userId).gte("created_at", last24h).order("created_at", { ascending: false }).limit(2)
    ]);

    // Compose recent activity: 2 recent orders, 2 recent payments, 2 recent admin logs (all from last 24h)
    const recentActivity = [
      ...recentOrders.map(o => ({
        type: "Order",
        icon: "fa-shopping-cart text-green-500",
        desc: `Order #${o.id.slice(0, 8)} placed for ₦${Number(o.total).toLocaleString()}`,
        date: o.created_at
      })),
      ...recentPayments.map(p => ({
        type: "Payment",
        icon: "fa-credit-card text-indigo-500",
        desc: `Payment of ₦${Number(p.amount).toLocaleString()} (${p.status})`,
        date: p.created_at
      })),
      ...logs.filter(l => new Date(l.created_at) >= new Date(last24h)).slice(0, 2).map(l => ({
        type: "Activity",
        icon: "fa-history text-primary",
        desc: l.event_type.replace(/_/g, " "),
        date: l.created_at
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

    // Render user profile page
    mainSection.innerHTML = `
      <div class="mb-6 flex items-center gap-4">
        <button id="back-to-users" class="text-primary hover:underline flex items-center gap-1"><i class="fas fa-arrow-left"></i> Back to Users</button>
        <h1 class="text-2xl font-bold text-secondary">User Profile</h1>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- User Details -->
        <section class="bg-white rounded-xl shadow p-6 flex flex-col gap-3 md:col-span-1">
          <div class="flex items-center gap-4">
            <img src="${user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.full_name || user.email)}" class="w-20 h-20 rounded-full border object-cover" alt="Avatar" />
            <div>
              <div class="font-bold text-lg">${user.full_name || "-"}</div>
              <div class="text-gray-500 text-sm">${user.email}</div>
              <div class="text-xs text-gray-400">Joined: ${formatDate(user.created_at)}</div>
            </div>
          </div>
          <div>
            <div class="font-semibold">Phone:</div>
            <div>${user.phone || "-"}</div>
          </div>
          <div>
            <div class="font-semibold">Address:</div>
            <div>
              ${user.address?.street || ""} ${user.address?.city || ""} ${user.address?.zip || ""} ${user.address?.country || ""}
            </div>
          </div>
          <div>
            <div class="font-semibold">Status:</div>
            <span class="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Active</span>
          </div>
          <div class="flex gap-2 mt-4">
            <button id="delete-user-btn" class="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-red-700 transition">
              <i class="fas fa-trash mr-2"></i> Delete User
            </button>
          </div>
        </section>
        <!-- User Activity, Orders, Transfers -->
        <section class="md:col-span-2 flex flex-col gap-8">
          <div class="bg-white rounded-xl shadow p-6">
            <h2 class="text-lg font-semibold mb-3 flex items-center gap-2"><i class="fas fa-bolt text-yellow-500"></i> Recent Activity (24h)</h2>
            <ul class="divide-y">
              ${recentActivity.length
        ? recentActivity.map(a => `
                  <li class="py-2 flex items-center gap-2">
                    <i class="fas ${a.icon}"></i>
                    <span class="flex-1">${a.desc}</span>
                    <span class="text-xs text-gray-400">${formatDate(a.date)}</span>
                  </li>
                `).join("")
        : `<li class="text-gray-400 py-4 text-center">No recent activity in last 24 hours.</li>`
      }
            </ul>
          </div>
          <div class="bg-white rounded-xl shadow p-6">
            <h2 class="text-lg font-semibold mb-3 flex items-center gap-2"><i class="fas fa-exchange-alt text-indigo-500"></i> Transfers</h2>
            <ul class="divide-y">
              ${(payments && payments.length)
        ? payments.map(p => `<li class="py-2 flex items-center gap-2">
                    <i class="fas fa-credit-card text-indigo-500"></i>
                    <span class="flex-1">₦${Number(p.amount).toLocaleString()} <span class="text-xs text-gray-400">(${p.status})</span></span>
                    <span class="text-xs text-gray-400">${formatDate(p.created_at)}</span>
                  </li>`).join("")
        : `<li class="text-gray-400 py-4 text-center">No transfers found.</li>`
      }
            </ul>
          </div>
          <div class="bg-white rounded-xl shadow p-6">
            <h2 class="text-lg font-semibold mb-3 flex items-center gap-2"><i class="fas fa-shopping-cart text-green-500"></i> Orders</h2>
            <ul class="divide-y">
              ${(orders && orders.length)
        ? orders.map(o => `
                  <li class="py-2 flex flex-col md:flex-row md:items-center gap-2">
                    <span class="flex-1 font-semibold">Order #${o.id.slice(0, 8)} - ₦${Number(o.total).toLocaleString()}</span>
                    <span class="text-xs text-gray-500">Status: 
                      <span class="inline-block px-2 py-1 rounded text-xs font-semibold 
                        ${o.status === "delivered" ? "bg-green-100 text-green-700" :
            o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
              o.status === "paid" ? "bg-blue-100 text-blue-700" :
                o.status === "shipped" ? "bg-indigo-100 text-indigo-700" :
                  "bg-gray-100 text-gray-700"}">${o.status}</span>
                    </span>
                    <span class="text-xs text-gray-400">${formatDate(o.created_at)}</span>
                    ${o.status === "paid" && o.tracking_info?.status !== "received"
            ? `<button class="mark-delivered-btn bg-green-500 text-white px-2 py-1 rounded text-xs" data-id="${o.id}">Mark as Delivered</button>
                         <span class="text-xs text-gray-400">${o.tracking_info?.status ? "Tracking: " + o.tracking_info.status : ""}</span>`
            : o.status === "shipped" && o.tracking_info?.status !== "received"
              ? `<button class="mark-delivered-btn bg-green-500 text-white px-2 py-1 rounded text-xs" data-id="${o.id}">Mark as Delivered</button>
                           <span class="text-xs text-gray-400">${o.tracking_info?.status ? "Tracking: " + o.tracking_info.status : ""}</span>`
              : o.tracking_info?.status
                ? `<span class="text-xs text-gray-400">Tracking: ${o.tracking_info.status}</span>`
                : ""
          }
                  </li>
                `).join("")
        : `<li class="text-gray-400 py-4 text-center">No orders found.</li>`
      }
            </ul>
          </div>
        </section>
      </div>
    `;

    // Back to users list
    mainSection.querySelector("#back-to-users").onclick = () => window.loadPage("adminUsersManagement");

    // Delete user
    mainSection.querySelector("#delete-user-btn").onclick = async () => {
      if (confirm("Delete this user? This cannot be undone.")) {
        const { error } = await supabase.from("users").delete().eq("id", userId);
        if (!error) {
          showNotificationToastr("User deleted!", "success");
          window.loadPage("adminUsersManagement");
        } else {
          showNotificationToastr("Delete failed!", "error");
        }
      }
    };

    // Mark order as delivered (only for paid or shipped, not pending)
    mainSection.querySelectorAll(".mark-delivered-btn").forEach(btn => {
      btn.onclick = async () => {
        const orderId = btn.dataset.id;
        const order = orders.find(o => o.id === orderId);
        const tracking = order?.tracking_info || {};
        const { error } = await supabase.from("orders").update({
          status: "delivered",
          tracking_info: { ...tracking, status: "received" }
        }).eq("id", orderId);
        if (!error) {
          showNotificationToastr("Order marked as delivered and tracking updated!", "success");
          window.loadPage("adminUsersManagement", userId);
        } else {
          showNotificationToastr("Failed to update order.", "error");
        }
      };
    });

    return;
  }

  // --- User List Page ---
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
      <h1 class="text-2xl font-bold text-secondary">User Management</h1>
      <div class="flex gap-2">
        <input id="search-input" type="text" placeholder="Search users..." class="border px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring w-48" />
      </div>
    </div>
    <div class="overflow-x-auto bg-white rounded-xl shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody id="users-tbody" class="bg-white divide-y divide-gray-100">
          ${users.map((u, i) => `
            <tr>
              <td class="px-4 py-3">${i + 1}</td>
              <td class="px-4 py-3 font-semibold">${u.full_name || "-"}</td>
              <td class="px-4 py-3">${u.email}</td>
              <td class="px-4 py-3">${u.phone || "-"}</td>
              <td class="px-4 py-3 text-xs">${u.address?.street || ""} ${u.address?.city || ""} ${u.address?.zip || ""} ${u.address?.country || ""}</td>
              <td class="px-4 py-3">
                <span class="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Active</span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-500">${formatDate(u.created_at)}</td>
              <td class="px-4 py-3 flex gap-2">
                <button class="profile-btn text-blue-600 hover:underline" data-id="${u.id}"><i class="fas fa-user"></i></button>
                <button class="delete-btn text-red-600 hover:underline" data-id="${u.id}"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
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
        <td class="px-4 py-3 font-semibold">${u.full_name || "-"}</td>
        <td class="px-4 py-3">${u.email}</td>
        <td class="px-4 py-3">${u.phone || "-"}</td>
        <td class="px-4 py-3 text-xs">${u.address?.street || ""} ${u.address?.city || ""} ${u.address?.zip || ""} ${u.address?.country || ""}</td>
        <td class="px-4 py-3">
          <span class="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Active</span>
        </td>
        <td class="px-4 py-3 text-xs text-gray-500">${formatDate(u.created_at)}</td>
        <td class="px-4 py-3 flex gap-2">
          <button class="profile-btn text-blue-600 hover:underline" data-id="${u.id}"><i class="fas fa-user"></i></button>
          <button class="delete-btn text-red-600 hover:underline" data-id="${u.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join("");
    attachRowEvents();
  }

  // --- Attach profile/delete events ---
  function attachRowEvents() {
    mainSection.querySelectorAll(".profile-btn").forEach(btn => {
      btn.onclick = () => window.loadPage("adminUsersManagement", btn.dataset.id);
    });
    mainSection.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = async () => {
        if (confirm("Delete this user? This cannot be undone.")) {
          const { error } = await supabase.from("users").delete().eq("id", btn.dataset.id);
          if (!error) {
            showNotificationToastr("User deleted!", "success");
            window.loadPage("adminUsersManagement");
          } else {
            showNotificationToastr("Delete failed!", "error");
          }
        }
      };
    });
  }

  // Attach row events for initial render
  attachRowEvents();
}