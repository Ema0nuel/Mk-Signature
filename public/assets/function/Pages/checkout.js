import { getCart, clearCart, updateCartCount } from "../Shop/cart.js";
import { fetchAllProducts } from "../Shop/ShopFunction.js";
import { formatMoneyAmount } from "../Util/format.js";
import { showNotificationToastr } from "../Util/notification.js";
import { supabase } from "../Data/db.js";
import { payWithPaystack } from "../Shop/payment.js";

import { trackPageVisit } from "/assets/function/Util/analyticsLogger.js";

// Helper: Get current user
async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// Helper: Get user profile (for billing info)
async function getUserProfile(userId) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return data || null;
}

// Helper: Get latest pending order for user
async function getPendingOrder(userId) {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}

// Helper: Compare order items with cart items
function isOrderMatchingCart(orderItems, cartItems) {
  if (!Array.isArray(orderItems) || !Array.isArray(cartItems)) return false;
  if (orderItems.length !== cartItems.length) return false;
  for (let i = 0; i < orderItems.length; i++) {
    const o = orderItems[i];
    const c = cartItems[i];
    if (
      o.product_id !== c.productId ||
      o.quantity !== c.quantity ||
      JSON.stringify(o.variants || {}) !== JSON.stringify(c.variants || {})
    ) {
      return false;
    }
  }
  return true;
}

// Helper: Update order (only send valid fields)
async function updateOrder(orderId, updateObj) {
  return await supabase.from("orders").update(updateObj).eq("id", orderId);
}

export default async function checkout(renderPageHTML) {
  window.scrollTo(0, 0);
  trackPageVisit({ page: "checkout" });

  // 1. Check login
  const user = await getCurrentUser();
  if (!user) {
    renderPageHTML.innerHTML = `
      <section class="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
        <div class="bg-white rounded-xl shadow p-8 text-center">
          <i class="fas fa-user-lock text-5xl text-pink-500 mb-4"></i>
          <h2 class="text-2xl font-bold mb-2">Please Login to Checkout</h2>
          <p class="mb-6 text-gray-500">You must be logged in to complete your order.</p>
          <a href="/users/user/index.html" class="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition">Go to Login</a>
        </div>
      </section>
    `;
    return;
  }

  // 2. Get user profile for billing info
  const userProfile = await getUserProfile(user.id);

  // 3. Get cart and products
  const allProducts = await fetchAllProducts();
  const cartItems = getCart();
  if (!cartItems.length) {
    renderPageHTML.innerHTML = `
      <section class="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
        <div class="bg-white rounded-xl shadow p-8 text-center">
          <i class="fas fa-shopping-cart text-5xl text-gray-400 mb-4"></i>
          <h2 class="text-2xl font-bold mb-2">Your cart is empty</h2>
          <a href="/shop" class="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition">Go to Shop</a>
        </div>
      </section>
    `;
    return;
  }

  function getProduct(productId) {
    return allProducts.find((p) => p.id === productId);
  }

  // Prepare order items with variants
  const orderItems = cartItems.map((item) => {
    const product = getProduct(item.productId);
    return {
      product_id: item.productId,
      name: product?.name || "",
      price: product?.price || 0,
      quantity: item.quantity,
      variants: item.variants || {},
    };
  });

  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 4. Get or create pending order, and check if it matches cart
  let order = await getPendingOrder(user.id);
  let needNewOrder = false;
  if (order) {
    if (!isOrderMatchingCart(order.items, cartItems)) {
      needNewOrder = true;
    }
  } else {
    needNewOrder = true;
  }

  if (needNewOrder) {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          status: "pending",
          items: orderItems,
          total,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (orderError) {
      renderPageHTML.innerHTML = `
        <section class="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
          <div class="bg-white rounded-xl shadow p-8 text-center">
            <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
            <h2 class="text-2xl font-bold mb-2">Order Error</h2>
            <p class="mb-6 text-gray-500">Could not create your order. Please try again later.</p>
            <a href="/cart" class="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition">Back to Cart</a>
          </div>
        </section>
      `;
      return;
    }
    order = orderData;
  }

  // 5. Render checkout UI
  renderPageHTML.innerHTML = `
    <section class="py-10 bg-gray-50 min-h-screen animate-fade-in-up">
      <div class="max-w-5xl mx-auto px-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form id="checkout-form" class="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 class="text-xl font-bold mb-4">Billing Details</h2>
            <div>
              <label class="block font-semibold mb-1">First Name</label>
              <input type="text" name="firstName" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" value="${
                userProfile?.full_name?.split(" ")[0] || ""
              }" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Last Name</label>
              <input type="text" name="lastName" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" value="${
                userProfile?.full_name?.split(" ")[1] || ""
              }" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Email</label>
              <input type="email" name="email" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" value="${
                user.email
              }" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Phone</label>
              <input type="tel" name="phone" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" value="${
                userProfile?.phone || ""
              }" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Country</label>
              <input type="text" name="country" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" value="${
                userProfile?.address?.country || "Nigeria"
              }" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Region/Province</label>
              <input type="text" name="region" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" value="${
                userProfile?.address?.region || ""
              }" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Address</label>
              <input type="text" name="address" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" value="${
                userProfile?.address?.street || ""
              }" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Postal Code</label>
              <input type="text" name="postal" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" value="${
                userProfile?.address?.postal || ""
              }" />
            </div>
          </form>
          <div>
            <div class="bg-white rounded-xl shadow p-6 mb-6">
              <h2 class="text-xl font-bold mb-4">Order Summary</h2>
              <ul class="divide-y">
                ${orderItems
                  .map((item) => {
                    const variantStr = Object.entries(item.variants || {})
                      .map(
                        ([k, v]) =>
                          `<span class="text-xs text-gray-400 ml-2">${k}: ${v}</span>`
                      )
                      .join("");
                    return `
                      <li class="flex justify-between py-2">
                        <span>
                          ${item.name}
                          ${variantStr}
                          <span class="text-xs text-gray-400">x${
                            item.quantity
                          }</span>
                        </span>
                        <span class="text-green-700 font-bold"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
                          item.price * item.quantity
                        )}</span>
                      </li>
                    `;
                  })
                  .join("")}
              </ul>
              <div class="flex justify-between text-lg font-bold border-t pt-4 mt-4">
                <span>Total</span>
                <span class="text-indigo-700"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
                  total
                )}</span>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow p-6">
              <h2 class="text-xl font-bold mb-4">Payment</h2>
              <div class="text-gray-500 mb-2">Pay securely with Paystack</div>
              <button id="paystack-btn" class="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow flex items-center justify-center gap-2">
                <i class="fas fa-credit-card"></i> Pay with Paystack
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 6. Handle Paystack payment
  const payBtn = renderPageHTML.querySelector("#paystack-btn");
  payBtn.addEventListener("click", async () => {
    const form = renderPageHTML.querySelector("#checkout-form");
    const formData = new FormData(form);
    const billing = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      country: formData.get("country"),
      region: formData.get("region"),
      street: formData.get("address"),
      postal: formData.get("postal"),
      paid_at: new Date().toISOString(),
    };

    const reference =
      "MK-" + Date.now() + "-" + Math.floor(Math.random() * 100000);

    payWithPaystack({
      email: billing.email,
      amount: total,
      reference,
      onSuccess: async (response) => {
        // Only update fields that exist in your orders table!
        const updateObj = {
          status: "paid",
          total,
          paid_at: new Date().toISOString(),
        };
        // Only add if your table has these columns and they are jsonb!
        if (order.hasOwnProperty("billing_address"))
          updateObj.billing_address = billing;
        if (order.hasOwnProperty("tracking_info"))
          updateObj.tracking_info = { paystack_ref: response.reference };

        const { error: updateError } = await updateOrder(order.id, updateObj);
        
        if (updateError) {
          console.error("Order update error:", updateError, updateObj, order);
          showNotificationToastr(
            "Order update failed. Please contact support.",
            "error"
          );
          return;
        }

        await supabase.from("admin_payments").insert([
          {
            user_id: user.id,
            order_id: order.id,
            amount: total,
            paystack_ref: response.reference,
            status: "paid",
            created_at: new Date().toISOString(),
          },
        ]);

        await supabase
          .from("users")
          .update({
            full_name: `${billing.firstName} ${billing.lastName}`,
            phone: billing.phone,
            address: {
              country: billing.country,
              region: billing.region,
              street: billing.street,
              postal: billing.postal,
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        showNotificationToastr("Payment successful!", "success");
        clearCart();
        updateCartCount();
        setTimeout(() => {
          if (window.loadPage) {
            window.loadPage("user");
          } else {
            window.location.href = "/users/user/user.html";
          }
        }, 1500);
      },
      onCancel: () => {
        showNotificationToastr("Payment was cancelled.", "warning");
      },
    });
  });
}
