import { supabase } from "/assets/function/Data/db.js";
import { showNotificationToastr } from "/assets/function/Util/notification.js";
import { formatMoneyAmount } from "/assets/function/Util/format.js";

// Helper: Get current user
async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// Helper: Get user profile
async function getUserProfile(userId) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return data || null;
}

// Helper: Get user orders
async function getUserOrders(userId) {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function user(renderPageHTML) {
  window.scrollTo(0, 0);

  // 1. Check login
  const user = await getCurrentUser();
  if (!user) {
    renderPageHTML.innerHTML = `
      <section class="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
        <div class="bg-white rounded-xl shadow p-8 text-center">
          <i class="fas fa-user-lock text-5xl text-pink-500 mb-4"></i>
          <h2 class="text-2xl font-bold mb-2">Please Login</h2>
          <a href="/users/user/index.html" class="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition">Go to Login</a>
        </div>
      </section>
    `;
    return;
  }

  // 2. Get user profile and orders
  const userProfile = await getUserProfile(user.id);
  const orders = await getUserOrders(user.id);

  // 3. Render UI
  renderPageHTML.innerHTML = `
    <section class="py-10 bg-gray-50 min-h-screen animate-fade-in-up">
      <div class="max-w-5xl mx-auto px-4">
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Sidebar -->
          <aside class="md:w-1/4 w-full bg-white rounded-xl shadow p-6 flex flex-col gap-6">
            <div class="flex flex-col items-center">
              <img src="${
                userProfile?.avatar_url ||
                "/assets/images/users/default-avatar.png"
              }" alt="Avatar" class="w-24 h-24 rounded-full shadow mb-2 object-cover">
              <h2 class="text-xl font-bold text-gray-800">${
                userProfile?.full_name || user.email
              }</h2>
              <span class="text-gray-500 text-sm">${user.email}</span>
            </div>
            <nav class="flex flex-col gap-2 mt-6">
              <button class="user-tab-btn text-left px-3 py-2 rounded hover:bg-pink-50 font-semibold" data-tab="orders"><i class="fas fa-box mr-2"></i> Orders</button>
              <button class="user-tab-btn text-left px-3 py-2 rounded hover:bg-pink-50 font-semibold" data-tab="profile"><i class="fas fa-user mr-2"></i> Profile</button>
              <button class="user-tab-btn text-left px-3 py-2 rounded hover:bg-pink-50 font-semibold" data-tab="settings"><i class="fas fa-cog mr-2"></i> Settings</button>
              <button id="logout-btn" class="text-left px-3 py-2 rounded hover:bg-red-100 font-semibold text-red-600 mt-4"><i class="fas fa-sign-out-alt mr-2"></i> Logout</button>
            </nav>
          </aside>
          <!-- Main Content -->
          <main class="md:w-3/4 w-full bg-white rounded-xl shadow p-6 min-h-[400px]">
            <div id="user-tab-orders" class="user-tab-content">
              <h3 class="text-xl font-bold mb-4">Order History</h3>
              ${
                orders.length === 0
                  ? `<div class="text-gray-500 text-center py-8">No orders yet.</div>`
                  : orders
                      .map(
                        (order) => `
                  <div class="mb-6 border-b pb-4">
                    <div class="flex justify-between items-center mb-2">
                      <div>
                        <span class="font-semibold text-gray-700">Order #${order.id.slice(
                          0,
                          8
                        )}</span>
                        <span class="ml-2 text-xs px-2 py-1 rounded-full ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }">${
                          order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)
                        }</span>
                      </div>
                      <span class="text-indigo-700 font-bold"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
                        order.total
                      )}</span>
                    </div>
                    <div class="mb-2 text-sm text-gray-500">Placed: ${new Date(
                      order.created_at
                    ).toLocaleString()}</div>
                    <ul class="mb-2">
                      ${
                        Array.isArray(order.items)
                          ? order.items
                              .map(
                                (item) => `
                        <li class="flex justify-between items-center py-1">
                          <span>
                            ${item.name}
                            ${Object.entries(item.variants || {})
                              .map(
                                ([k, v]) =>
                                  `<span class="ml-2 text-xs text-gray-400">${k}: ${v}</span>`
                              )
                              .join("")}
                            <span class="ml-2 text-xs text-gray-400">x${
                              item.quantity
                            }</span>
                          </span>
                          <span class="text-green-700 font-semibold"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
                            item.price * item.quantity
                          )}</span>
                        </li>
                      `
                              )
                              .join("")
                          : ""
                      }
                    </ul>
                    <div class="flex items-center gap-4">
                      <span class="text-xs text-gray-500">Tracking:</span>
                      <span class="text-xs font-semibold ${
                        order.status === "paid"
                          ? "text-green-600"
                          : order.status === "pending"
                          ? "text-yellow-600"
                          : "text-gray-400"
                      }">
                        ${
                          order.status === "paid"
                            ? "Order confirmed, preparing for shipment"
                            : order.status === "pending"
                            ? "Awaiting payment"
                            : "Processing"
                        }
                      </span>
                    </div>
                  </div>
                `
                      )
                      .join("")
              }
            </div>
            <div id="user-tab-profile" class="user-tab-content hidden">
              <h3 class="text-xl font-bold mb-4">Profile</h3>
              <form id="profile-form" class="space-y-4 max-w-lg">
                <div>
                  <label class="block font-semibold mb-1">Full Name</label>
                  <input type="text" name="full_name" value="${
                    userProfile?.full_name || ""
                  }" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Phone</label>
                  <input type="tel" name="phone" value="${
                    userProfile?.phone || ""
                  }" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Email</label>
                  <input type="email" value="${
                    user.email
                  }" disabled class="w-full border rounded px-3 py-2 bg-gray-100" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Country</label>
                  <input type="text" name="country" value="${
                    userProfile?.address?.country || ""
                  }" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Region/Province</label>
                  <input type="text" name="region" value="${
                    userProfile?.address?.region || ""
                  }" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Street Address</label>
                  <input type="text" name="street" value="${
                    userProfile?.address?.street || ""
                  }" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Postal Code</label>
                  <input type="text" name="postal" value="${
                    userProfile?.address?.postal || ""
                  }" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
                </div>
                <button type="submit" class="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition">Update Profile</button>
              </form>
            </div>
            <div id="user-tab-settings" class="user-tab-content hidden">
              <h3 class="text-xl font-bold mb-4">Settings</h3>
              <form id="settings-form" class="space-y-4 max-w-lg">
                <div>
                  <label class="block font-semibold mb-1">Receive Order Notifications</label>
                  <select name="notify_orders" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500">
                    <option value="yes" ${
                      userProfile?.notify_orders !== "no" ? "selected" : ""
                    }>Yes</option>
                    <option value="no" ${
                      userProfile?.notify_orders === "no" ? "selected" : ""
                    }>No</option>
                  </select>
                </div>
                <div>
                  <label class="block font-semibold mb-1">Newsletter Subscription</label>
                  <select name="newsletter" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500">
                    <option value="yes" ${
                      userProfile?.newsletter !== "no" ? "selected" : ""
                    }>Yes</option>
                    <option value="no" ${
                      userProfile?.newsletter === "no" ? "selected" : ""
                    }>No</option>
                  </select>
                </div>
                <button type="submit" class="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition">Save Settings</button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </section>
  `;

  // Tab switching
  const tabBtns = renderPageHTML.querySelectorAll(".user-tab-btn");
  const tabContents = renderPageHTML.querySelectorAll(".user-tab-content");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) =>
        b.classList.remove("bg-pink-100", "text-pink-700")
      );
      btn.classList.add("bg-pink-100", "text-pink-700");
      tabContents.forEach((tab) => tab.classList.add("hidden"));
      const tabId = btn.dataset.tab;
      renderPageHTML
        .querySelector(`#user-tab-${tabId}`)
        .classList.remove("hidden");
    });
  });
  tabBtns[0].click();

  // Profile update
  const profileForm = renderPageHTML.querySelector("#profile-form");
  profileForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(profileForm);
    const updateObj = {
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
      address: {
        country: formData.get("country"),
        region: formData.get("region"),
        street: formData.get("street"),
        postal: formData.get("postal"),
      },
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("users")
      .update(updateObj)
      .eq("id", user.id);
    if (error) {
      showNotificationToastr("Profile update failed.", "error");
    } else {
      showNotificationToastr("Profile updated!", "success");
      setTimeout(() => window.location.reload(), 1200);
    }
  });

  // Settings update
  const settingsForm = renderPageHTML.querySelector("#settings-form");
  settingsForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(settingsForm);
    const updateObj = {
      notify_orders: formData.get("notify_orders"),
      newsletter: formData.get("newsletter"),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("users")
      .update(updateObj)
      .eq("id", user.id);
    if (error) {
      showNotificationToastr("Settings update failed.", "error");
    } else {
      showNotificationToastr("Settings updated!", "success");
      setTimeout(() => window.location.reload(), 1200);
    }
  });

  // Logout
  const logoutBtn = renderPageHTML.querySelector("#logout-btn");
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    showNotificationToastr("Logged out!", "success");
    setTimeout(() => {
      window.location.href = "/users/user/index.html";
    }, 1000);
  });
}
