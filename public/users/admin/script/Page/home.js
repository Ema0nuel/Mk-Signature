import { Navbar } from "../components/Navbar.js";
import { showSpinner } from "../components/spinner.js";
import { supabase } from "../../../../assets/function/Data/db.js";
import { showNotificationToastr } from "../../../../assets/function/Util/notification.js";

// Helper: Format date for display
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// Helper: Format money with icon
function formatMoney(amount) {
  return `<span class="text-green-600 font-bold"><i class="fa-solid fa-naira-sign"></i>${Number(amount).toLocaleString()}</span>`;
}

// Helper: Payment status badge (fix icon logic)
function paymentStatusBadge(status) {
  const s = (status || "").toLowerCase();
  if (["success", "completed", "paid"].includes(s))
    return `<span class="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 font-semibold animate-fade-in"><i class="fas fa-check-circle mr-1"></i>Paid</span>`;
  if (["pending", "processing"].includes(s))
    return `<span class="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold animate-fade-in"><i class="fas fa-clock mr-1"></i>Pending</span>`;
  if (["failed", "cancelled", "canceled"].includes(s))
    return `<span class="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700 font-semibold animate-fade-in"><i class="fas fa-times-circle mr-1"></i>Failed</span>`;
  return `<span class="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 font-semibold animate-fade-in"><i class="fas fa-question-circle mr-1"></i>${status}</span>`;
}

// Helper: User avatar
function userAvatar(user) {
  const url = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.email || "User")}`;
  return `<img src="${url}" class="w-8 h-8 rounded-full border object-cover mr-2" alt="Avatar" />`;
}

// Fetch analytics (page views, etc.)
async function fetchSupabaseAnalytics() {
  let analytics = { page_views: 0, unique_visitors: 0 };
  try {
    const { data } = await supabase
      .from("analytics")
      .select("page_views, unique_visitors")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (data) analytics = data;
  } catch (e) { }
  return analytics;
}

// Fetch recent orders (last 48h, up to 5) - fetch all columns to avoid 400 error
async function fetchRecentOrders() {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error || !data) return [];
  return data;
}

// Fetch recent payments (last 48h, up to 5)
async function fetchRecentPayments() {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("admin_payments")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error || !data) return [];
  return data;
}

// Fetch user by id
async function fetchUserById(userId) {
  if (!userId) return null;
  const { data } = await supabase.from("users").select("*").eq("id", userId).single();
  return data;
}

// Fetch order by id
async function fetchOrderById(orderId) {
  if (!orderId) return null;
  const { data } = await supabase.from("orders").select("*").eq("id", orderId).single();
  return data;
}

// Fetch payment by id
async function fetchPaymentById(paymentId) {
  if (!paymentId) return null;
  const { data } = await supabase.from("admin_payments").select("*").eq("id", paymentId).single();
  return data;
}

// Fetch products by ids (returns a map of id -> product)
async function fetchProductsByIds(ids) {
  if (!ids?.length) return {};
  const { data } = await supabase.from("products").select("*").in("id", ids);
  const map = {};
  (data || []).forEach(p => { map[p.id] = p; });
  return map;
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

  // --- 3. Fetch stats and data ---
  let [
    users,
    products,
    orders,
    payments,
    analytics,
    recentOrders,
    recentPayments
  ] = await Promise.all([
    supabase.from("users").select("id, full_name, email, avatar_url"),
    supabase.from("products").select("id, name, images"),
    supabase.from("orders").select("*"),
    supabase.from("admin_payments").select("*"),
    fetchSupabaseAnalytics(),
    fetchRecentOrders(),
    fetchRecentPayments()
  ]);

  // Quick stats
  const totalUsers = users.data?.length || 0;
  const totalProducts = products.data?.length || 0;
  const totalOrders = orders.data?.length || 0;
  const totalPayments = payments.data?.length || 0;
  const activeProducts = products.data?.length || 0;

  // --- 4. Render dashboard (wait until all data is ready, then remove spinner) ---
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
        <!-- Recent Orders Feed -->
        <section class="md:col-span-2 bg-white rounded-xl shadow p-6 animate-fade-in">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="fas fa-history text-primary"></i> Recent Orders
          </h2>
          <ul class="divide-y" id="order-feed">
            ${recentOrders.length
      ? recentOrders.map(order => `
                  <li class="flex items-center gap-3 py-2 border-b last:border-b-0 animate-fade-in order-detail-btn cursor-pointer hover:bg-gray-50 transition" data-order-id="${order.id}">
                    <i class="fas fa-shopping-cart text-pink-600 text-lg"></i>
                    <span class="flex-1">Order #${order.id.slice(0, 8)} - ${formatMoney(order.total)}</span>
                    <span class="text-xs text-gray-500">${order.status}</span>
                    <span class="text-xs text-gray-400">${formatDate(order.created_at)}</span>
                    <span class="text-xs text-blue-500 underline ml-2">Details</span>
                  </li>
                `).join("")
      : `<li class="text-gray-400 py-4 text-center">No recent orders in last 48 hours.</li>`
    }
          </ul>
        </section>
        <!-- Notifications & System Health -->
        <section class="bg-white rounded-xl shadow p-6 flex flex-col gap-6 animate-fade-in">
          <div>
            <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
              <i class="fas fa-bell text-yellow-500"></i> Notifications
            </h2>
            <ul class="space-y-2">
              <li class="flex items-center gap-2 text-sm">
                <i class="fas fa-exclamation-triangle text-yellow-500"></i>
                <span>Server maintenance scheduled for Sunday 2AM.</span>
              </li>
              <li class="flex items-center gap-2 text-sm">
                <i class="fas fa-tasks text-blue-500"></i>
                <span>3 orders pending review.</span>
              </li>
            </ul>
          </div>
          <div>
            <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
              <i class="fas fa-server text-indigo-500"></i> System Health
            </h2>
            <ul class="space-y-2">
              <li class="flex items-center gap-2 text-sm">
                <span class="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span>API: <span class="font-semibold">Online</span></span>
              </li>
              <li class="flex items-center gap-2 text-sm">
                <span class="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span>Database: <span class="font-semibold">Online</span></span>
              </li>
              <li class="flex items-center gap-2 text-sm">
                <span class="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span>Storage: <span class="font-semibold">Online</span></span>
              </li>
              <li class="flex items-center gap-2 text-sm">
                <span class="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
                <span>Email: <span class="font-semibold">Degraded</span></span>
              </li>
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
            <button data-page="adminUsersManagement" class="quick-link-btn flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow bg-primary text-white hover:opacity-80 transition">
              <i class="fas fa-users"></i> <span>Users</span>
            </button>
            <button data-page="adminManagement" class="quick-link-btn flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow bg-pink-600 text-white hover:opacity-80 transition">
              <i class="fas fa-box"></i> <span>Products</span>
            </button>
            <button data-page="adminAnalytics" class="quick-link-btn flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow bg-green-500 text-white hover:opacity-80 transition">
              <i class="fas fa-shopping-cart"></i> <span>Orders</span>
            </button>
            <button data-page="adminSettings" class="quick-link-btn flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow bg-indigo-500 text-white hover:opacity-80 transition">
              <i class="fas fa-cog"></i> <span>Settings</span>
            </button>
          </div>
        </section>
        <section class="bg-white rounded-xl shadow p-6 animate-fade-in">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <i class="fas fa-exchange-alt text-indigo-500"></i> Recent Payments
          </h2>
          <ul class="divide-y" id="payment-feed">
            ${recentPayments.length
      ? recentPayments.map(t => `
                  <li class="flex items-center gap-3 py-2 border-b last:border-b-0 animate-fade-in payment-detail-btn cursor-pointer hover:bg-gray-50 transition" data-payment-id="${t.id}">
                    <i class="fas fa-credit-card text-indigo-500 text-lg"></i>
                    <span class="flex-1">${formatMoney(t.amount)} <span class="text-xs text-gray-400">(${t.status})</span></span>
                    <span class="text-xs text-gray-400">${formatDate(t.created_at)}</span>
                    <span class="text-xs text-blue-500 underline ml-2">Details</span>
                  </li>
                `).join("")
      : `<li class="text-gray-400 py-4 text-center">No recent payments in last 48 hours.</li>`
    }
          </ul>
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

  // --- 6. Details view for recent orders ---
  mainSection.querySelectorAll(".order-detail-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const orderId = btn.getAttribute("data-order-id");
      mainSection.innerHTML = `<div class="flex justify-center items-center min-h-[40vh]"><div id="spinner"></div></div>`;
      await showSpinner(document.getElementById("spinner"), 400);

      const order = await fetchOrderById(orderId);
      const user = order?.user_id ? await fetchUserById(order.user_id) : null;

      // Get all product IDs from items/products array
      let itemsArr = Array.isArray(order.items) && order.items.length ? order.items : (Array.isArray(order.products) ? order.products : []);
      const productIds = itemsArr.map(i => i.product_id || i.id).filter(Boolean);
      const productMap = await fetchProductsByIds(productIds);

      // Render items as cards with images and details
      let itemsHTML = "";
      if (itemsArr.length) {
        itemsHTML = itemsArr.map(item => {
          const prod = productMap[item.product_id || item.id] || {};
          const img = Array.isArray(prod.images) && prod.images[0]?.url ? prod.images[0].url : "/assets/images/default.png";
          return `
            <div class="flex items-center gap-4 bg-gray-50 rounded-lg p-3 mb-3 shadow-sm animate-fade-in">
              <img src="${img}" class="w-16 h-16 object-cover rounded border" alt="Product" />
              <div>
                <div class="font-semibold text-gray-800">${prod.name || item.name || "Product"}</div>
                <div class="text-sm text-gray-500">Qty: <span class="font-bold">${item.quantity || 1}</span></div>
                <div class="text-sm text-gray-500">Price: ${formatMoney(item.price || prod.price || 0)}</div>
                ${item.variant ? `<div class="text-xs text-gray-400">Variant: ${item.variant}</div>` : ""}
              </div>
            </div>
          `;
        }).join("");
      } else {
        itemsHTML = `<div class="text-gray-400">No items found for this order.</div>`;
      }

      mainSection.innerHTML = `
        <button id="back-to-dashboard" class="mb-6 text-primary hover:underline flex items-center gap-1"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
        <div class="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto animate-fade-in">
          <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i class="fas fa-shopping-cart text-pink-600"></i> Order Details</h2>
          <div class="mb-4 flex items-center gap-3">
            ${userAvatar(user)}
            <span class="font-semibold text-lg">${user ? user.full_name : "N/A"}</span>
            <span class="text-xs text-gray-400 ml-2">${user ? user.email : ""}</span>
          </div>
          <div class="mb-2"><span class="font-semibold">Order ID:</span> ${order.id}</div>
          <div class="mb-2"><span class="font-semibold">Date:</span> ${formatDate(order.created_at)}</div>
          <div class="mb-2"><span class="font-semibold">Status:</span> <span class="capitalize">${order.status}</span></div>
          <div class="mb-2"><span class="font-semibold">Total:</span> ${formatMoney(order.total)}</div>
          <div class="mt-6">
            <h3 class="font-semibold text-lg mb-2 flex items-center gap-2"><i class="fas fa-boxes-stacked text-indigo-500"></i> Items Ordered</h3>
            <div>
              ${itemsHTML}
            </div>
          </div>
        </div>
      `;
      mainSection.querySelector("#back-to-dashboard").onclick = () => window.loadPage("adminHome");
    });
  });

  // --- 7. Details view for recent payments ---
  mainSection.querySelectorAll(".payment-detail-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const paymentId = btn.getAttribute("data-payment-id");
      mainSection.innerHTML = `<div class="flex justify-center items-center min-h-[40vh]"><div id="spinner"></div></div>`;
      await showSpinner(document.getElementById("spinner"), 400);

      const payment = await fetchPaymentById(paymentId);
      let user = null, order = null;
      if (payment?.user_id) user = await fetchUserById(payment.user_id);
      if (payment?.order_id) order = await fetchOrderById(payment.order_id);

      mainSection.innerHTML = `
        <button id="back-to-dashboard" class="mb-6 text-primary hover:underline flex items-center gap-1"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>
        <div class="bg-white rounded-xl shadow p-8 max-w-2xl mx-auto animate-fade-in">
          <h2 class="text-2xl font-bold mb-4 flex items-center gap-2"><i class="fas fa-credit-card text-indigo-500"></i> Payment Details</h2>
          <div class="mb-4 flex items-center gap-3">
            ${userAvatar(user)}
            <span class="font-semibold text-lg">${user ? user.full_name : "N/A"}</span>
            <span class="text-xs text-gray-400 ml-2">${user ? user.email : ""}</span>
          </div>
          <div class="mb-2"><span class="font-semibold">Payment ID:</span> ${payment.id}</div>
          <div class="mb-2"><span class="font-semibold">Date:</span> ${formatDate(payment.created_at)}</div>
          <div class="mb-2"><span class="font-semibold">Status:</span> ${paymentStatusBadge(payment.status)}</div>
          <div class="mb-2"><span class="font-semibold">Amount:</span> ${formatMoney(payment.amount)}</div>
          <div class="mb-2"><span class="font-semibold">Order:</span> ${order ? order.id : "N/A"}</div>
        </div>
      `;
      mainSection.querySelector("#back-to-dashboard").onclick = () => window.loadPage("adminHome");
    });
  });
}