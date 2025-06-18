// Helper: Toastr notification
function showToastr(message, type = "success") {
  let toastr = document.createElement("div");
  toastr.className = `fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white font-semibold transition-all duration-300 ${
    type === "success" ? "bg-green-600" : "bg-red-600"
  }`;
  toastr.textContent = message;
  document.body.appendChild(toastr);
  setTimeout(() => {
    toastr.classList.add("opacity-0");
    setTimeout(() => toastr.remove(), 500);
  }, 2000);
}

export default function loginAdmin(renderPageHTML) {
  let body = document.querySelector("body");
  body.innerHTML = `
    <div class="animate-after-load">
      <section class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div class="w-full max-w-sm">
          <div class="flex justify-center mb-6">
            <a href="/" id="site-logo">
              <img src="/assets/images/MKSignature.png" alt="Website Logo" class="h-12 w-auto cursor-pointer" />
            </a>
          </div>
          <div class="bg-white rounded-xl shadow p-8">
            <h2 class="text-2xl font-bold mb-6 text-center">Admin Login</h2>
            <form id="admin-login-form" class="space-y-4" autocomplete="off">
              <div>
                <label class="block font-semibold mb-1">Username</label>
                <input type="text" name="username" required minlength="3" maxlength="32" class="w-full border rounded px-3 py-2" autocomplete="username" />
              </div>
              <div>
                <label class="block font-semibold mb-1">Password</label>
                <input type="password" name="password" required minlength="6" maxlength="32" class="w-full border rounded px-3 py-2" autocomplete="current-password" />
              </div>
              <button type="submit" class="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold">Login</button>
            </form>
            <div id="admin-login-error" class="text-red-600 mt-4 text-center hidden"></div>
          </div>
        </div>
      </section>
    </div>
  `;

  // Logo click: go to user home
  const logo = document.querySelector("#site-logo");
  if (logo) {
    logo.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/";
    });
  }

  const form = document.querySelector("#admin-login-form");
  const errorDiv = document.querySelector("#admin-login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorDiv.classList.add("hidden");
    const username = form.username.value.trim();
    const password = form.password.value;

    // Validation
    if (!username || !password) {
      errorDiv.textContent = "Please fill in all fields.";
      errorDiv.classList.remove("hidden");
      showToastr("Please fill in all fields.", "error");
      return;
    }
    if (username.length < 3 || username.length > 32) {
      errorDiv.textContent = "Username must be 3-32 characters.";
      errorDiv.classList.remove("hidden");
      showToastr("Username must be 3-32 characters.", "error");
      return;
    }
    if (password.length < 6 || password.length > 32) {
      errorDiv.textContent = "Password must be 6-32 characters.";
      errorDiv.classList.remove("hidden");
      showToastr("Password must be 6-32 characters.", "error");
      return;
    }

    // Demo: Hardcoded admin credentials
    if (username === "admin" && password === "12345E") {
      sessionStorage.setItem("admin_logged_in", "yes");
      showToastr("Login successful!", "success");
      setTimeout(() => {
        window.location.href = "/users/admin/home";
      }, 800);
      return;
    }

    // Example: If you want to check with Supabase, you can add here

    // If invalid
    errorDiv.textContent = "Invalid credentials!";
    errorDiv.classList.remove("hidden");
    showToastr("Invalid credentials!", "error");
  });
}