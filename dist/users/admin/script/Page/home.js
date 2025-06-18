import { Navbar } from "../components/Navbar.js";
import { showSpinner } from "../components/spinner.js";
import { supabase } from "../../../../assets/function/Data/db.js";
import { showNotificationToastr } from "../../../../assets/function/Util/notification.js";

/**
 * Format date for display
 */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Fetch Supabase analytics (page views, etc.)
 * You must have enabled Supabase Analytics extension for this to work.
 */
async function fetchSupabaseAnalytics() {
  // Example: Replace with your actual analytics table/query if you have one
  // This is a demo for page_views and unique_visitors
  let analytics = { page_views: 0, unique_visitors: 0 };
  try {
    const { data } = await supabase
      .from("analytics")
      .select("page_views, unique_visitors")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (data) {
      analytics = data;
    }
  } catch (e) {
    // If analytics table doesn't exist, ignore
  }
  return analytics;
}

export default async function adminHome(renderPageHTML) {
  // --- 1. Check admin session ---
  if (!sessionStorage.getItem("admin_logged_in")) {
    showNotificationToastr("Please login as admin.", "error");
    window.loadPage("loginAdmin");
    return;
  }

  // --- 2. Render navbar and main section ---
  document.body.innerHTML = `
    ${Navbar("dashboard")}
    <div class="w-full md:pl-64 pt-8 pb-16 min-h-screen bg-gray-50 font-poppins">
      <main id="main-section" class="max-w-7xl mx-auto px-4"></main>
    </div>
  `;

  const mainSection = document.getElementById("main-section");
  await showSpinner(mainSection, 900);

  // --- 3. Fetch stats from Supabase ---
  let [users, products, orders, payments, activities, analytics] = await Promise.all([
    supabase.from("users").select("id"),
    supabase.from("products").select("id, stock"),
    supabase.from("orders").select("id, status, paid_at"),
    supabase.from("admin_payments").select("id, amount, status, created_at"),
    supabase.from("admin").select("*").order("created_at", { ascending: false }).limit(6),
    fetchSupabaseAnalytics()
  ]);

  // Quick stats
  const totalUsers = users.data?.length || 0;
  const totalProducts = products.data?.length || 0;
  const totalOrders = orders.data?.length || 0;
  const totalPayments = payments.data?.length || 0;
  const activeProducts = products.data?.filter(p => p.stock > 0).length || 0;
  const recentTransfers = payments.data?.slice(0, 5) || [];

  // Recent activity
  const activityFeed = (activities.data || []).map(ev => {
    let icon = "fa-bell";
    let color = "text-primary";
    let msg = "";
    switch (ev.event_type) {
      case "user_signup":
        icon = "fa-user-plus"; color = "text-green-500";
        msg = `New user registered`;
        break;
      case "purchase":
        icon = "fa-shopping-cart"; color = "text-pink-600";
        msg = `New purchase made`;
        break;
      case "new_review":
        icon = "fa-star"; color = "text-yellow-500";
        msg = `New product review`;
        break;
      default:
        msg = ev.event_type.replace(/_/g, " ");
    }
    return `
      <li class="flex items-center gap-3 py-2 border-b last:border-b-0 animate-fade-in">
        <i class="fas ${icon} ${color} text-lg"></i>
        <span class="flex-1">${msg}</span>
        <span class="text-xs text-gray-400">${formatDate(ev.created_at)}</span>
      </li>
    `;
  }).join("") || `<li class="text-gray-400 py-4 text-center">No recent activity.</li>`;

  // Notifications/Alerts (demo)
  const notifications = [
    { icon: "fa-exclamation-triangle", color: "text-yellow-500", text: "Server maintenance scheduled for Sunday 2AM." },
    { icon: "fa-tasks", color: "text-blue-500", text: "3 orders pending review." },
  ];

  // System Health (demo)
  const systemHealth = [
    { label: "API", status: "Online", color: "bg-green-500" },
    { label: "Database", status: "Online", color: "bg-green-500" },
    { label: "Storage", status: "Online", color: "bg-green-500" },
    { label: "Email", status: "Degraded", color: "bg-yellow-400" },
  ];

  // Quick Links
  const quickLinks = [
    { icon: "fa-users", label: "Users", page: "adminUsersManagement", color: "bg-primary text-white" },
    { icon: "fa-box", label: "Products", page: "adminManagement", color: "bg-pink-600 text-white" },
    { icon: "fa-shopping-cart", label: "Orders", page: "adminAnalytics", color: "bg-green-500 text-white" },
    { icon: "fa-cog", label: "Settings", page: "adminSettings", color: "bg-indigo-500 text-white" },
  ];

  // Recent Transfers
  const transferFeed = recentTransfers.map(t => `
    <li class="flex items-center gap-3 py-2 border-b last:border-b-0 animate-fade-in">
      <i class="fas fa-credit-card text-indigo-500 text-lg"></i>
      <span class="flex-1">₦${Number(t.amount).toLocaleString()} <span class="text-xs text-gray-400">(${t.status})</span></span>
      <span class="text-xs text-gray-400">${formatDate(t.created_at)}</span>
    </li>
  `).join("") || `<li class="text-gray-400 py-4 text-center">No recent transfers.</li>`;

  // --- 4. Render dashboard ---
  mainSection.innerHTML = `
    <div>
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-secondary mb-1 animate-fade-in">Admin Dashboard</h1>
          <p class="text-gray-500">Welcome back! Here’s what’s happening today.</p>
        </div>
        <div class="flex gap-2">
          <button id="add-product-btn" class="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-700 transition">
            <i class="fas fa-plus mr-2"></i> Add Product
          </button>
          <button id="add-user-btn" class="bg-white border border-primary text-primary px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-50 transition">
            <i class="fas fa-user-plus mr-2"></i> Add User
          </button>
        </div>
      </div>
      <!-- Quick Stats -->
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center animate-fade-in">
          <i class="fas fa-users text-2xl text-primary mb-2"></i>
          <div class="text-2xl font-bold">${totalUsers}</div>
          <div class="text-gray-500 text-sm">Total Users</div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center animate-fade-in">
          <i class="fas fa-box text-2xl text-pink-600 mb-2"></i>
          <div class="text-2xl font-bold">${totalProducts}</div>
          <div class="text-gray-500 text-sm">Products</div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center animate-fade-in">
          <i class="fas fa-box-open text-2xl text-green-500 mb-2"></i>
          <div class="text-2xl font-bold">${activeProducts}</div>
          <div class="text-gray-500 text-sm">Active Items</div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center animate-fade-in">
          <i class="fas fa-shopping-cart text-2xl text-green-500 mb-2"></i>
          <div class="text-2xl font-bold">${totalOrders}</div>
          <div class="text-gray-500 text-sm">Orders</div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center animate-fade-in">
          <i class="fas fa-credit-card text-2xl text-indigo-500 mb-2"></i>
          <div class="text-2xl font-bold">${totalPayments}</div>
          <div class="text-gray-500 text-sm">Payments</div>
        </div>
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center animate-fade-in">
          <i class="fas fa-chart-bar text-2xl text-blue-500 mb-2"></i>
          <div class="text-2xl font-bold">${analytics.page_views || 0}</div>
          <div class="text-gray-500 text-sm">Page Views</div>
          <div class="text-xs text-gray-400">${analytics.unique_visitors ? analytics.unique_visitors + " unique" : ""}</div>
        </div>
      </div>
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Recent Activity Feed -->
        <section class="md:col-span-2 bg-white rounded-xl shadow p-6 animate-fade-in">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="fas fa-history text-primary"></i> Recent Activity
          </h2>
          <ul class="divide-y">${activityFeed}</ul>
        </section>
        <!-- Notifications & System Health -->
        <section class="bg-white rounded-xl shadow p-6 flex flex-col gap-6 animate-fade-in">
          <div>
            <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
              <i class="fas fa-bell text-yellow-500"></i> Notifications
            </h2>
            <ul class="space-y-2">
              ${notifications.map(n => `
                <li class="flex items-center gap-2 text-sm">
                  <i class="fas ${n.icon} ${n.color}"></i>
                  <span>${n.text}</span>
                </li>
              `).join("")}
            </ul>
          </div>
          <div>
            <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
              <i class="fas fa-server text-indigo-500"></i> System Health
            </h2>
            <ul class="space-y-2">
              ${systemHealth.map(s => `
                <li class="flex items-center gap-2 text-sm">
                  <span class="inline-block w-2 h-2 rounded-full ${s.color}"></span>
                  <span>${s.label}: <span class="font-semibold">${s.status}</span></span>
                </li>
              `).join("")}
            </ul>
          </div>
        </section>
      </div>
      <!-- Quick Links & Recent Transfers -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <section class="bg-white rounded-xl shadow p-6 animate-fade-in">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="fas fa-link text-primary"></i> Quick Links
          </h2>
          <div class="flex flex-wrap gap-3">
            ${quickLinks.map(link => `
              <button data-page="${link.page}" class="quick-link-btn flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow ${link.color} hover:opacity-80 transition">
                <i class="fas ${link.icon}"></i> <span>${link.label}</span>
              </button>
            `).join("")}
          </div>
        </section>
        <section class="bg-white rounded-xl shadow p-6 animate-fade-in">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="fas fa-exchange-alt text-indigo-500"></i> Recent Transfers
          </h2>
          <ul class="divide-y">${transferFeed}</ul>
        </section>
      </div>
    </div>
  `;

  // --- 5. SPA navigation for quick links and buttons ---
  mainSection.querySelectorAll(".quick-link-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const page = btn.getAttribute("data-page");
      showNotificationToastr(`Navigating to ${page.replace("admin", "")}...`, "info");
      window.loadPage(page);
    });
  });

  mainSection.querySelector("#add-product-btn")?.addEventListener("click", () => {
    showNotificationToastr("Add Product clicked!", "info");
    window.loadPage("adminManagement");
  });
  mainSection.querySelector("#add-user-btn")?.addEventListener("click", () => {
    showNotificationToastr("Add User clicked!", "info");
    window.loadPage("adminUsersManagement");
  });
}