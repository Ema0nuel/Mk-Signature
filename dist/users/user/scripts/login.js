import { supabase } from "/assets/function/Data/db.js"; // adjust path as needed
import { showNotificationToastr } from "/assets/function/Util/notification.js";

export default async function login(renderPageHTML) {
  window.scrollTo(0, 0);

  // Check for existing session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    window.location.href = "/user"; // Already logged in, redirect to home or dashboard
    return;
  }

  // Render login UI
  renderPageHTML.innerHTML = `
    <section class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fade-in-up">
        <div class="mb-6 text-center">
          <img src="/assets/images/favicon.ico" alt="Mk Signasures" class="mx-auto w-16 h-16 mb-2 rounded-full shadow">
          <h2 class="text-2xl font-bold text-pink-600 mb-1">Welcome Back</h2>
          <p class="text-gray-500">Login to your Mk Signasures account</p>
        </div>
        <form class="js-login space-y-4" autocomplete="off">
          <input name="email" type="email" placeholder="Email" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
          <input name="password" type="password" placeholder="Password" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
          <button id="login-btn" type="submit" class="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow flex items-center justify-center gap-2">
            <i class="fas fa-sign-in-alt"></i> Login
          </button>
        </form>
        <div class="mt-6 text-center text-gray-500">
          Don't have an account?
          <a id="reg" class="cursor-pointer text-pink-600 hover:underline font-semibold">Sign Up</a>
        </div>
      </div>
    </section>
  `;

  // Show login form
  const loginForm = document.querySelector(".js-login");
  const loginBtn = document.getElementById("login-btn");
  const regLink = document.getElementById("reg");

  // Redirect to signup page
  regLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.loadPage) {
      window.location.href = "/users/user/signup";
    } else {
      window.location.href = "/users/user/signup";
    }
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginBtn.disabled = true;
    loginBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Logging in...`;

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    // Validation
    if (!email || !password) {
      showNotificationToastr("Please fill in all fields.", "error");
      loginBtn.disabled = false;
      loginBtn.innerHTML = "Login";
      return;
    }

    // Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      showNotificationToastr("Error occurred\nTry again.", "error");
      loginBtn.disabled = false;
      loginBtn.innerHTML = "Login";
      return;
    }

    
    showNotificationToastr("Login successful! Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "/user"; // Redirect to home or dashboard
    }, 1200);
  });
}
