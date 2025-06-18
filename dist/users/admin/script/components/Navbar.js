import { loadPage } from "../../../../assets/function/Routes/route.js";
import { endPreloader, startPreloader } from "../../../../assets/function/Util/preloader.js";

// Responsive Admin Navbar (Sidebar on desktop, bottom bar on mobile)
export function Navbar(activePage = "dashboard") {
  // Return HTML for the navbar
  setTimeout(() => {
    // Desktop
    document.getElementById("admin-dashboard")?.addEventListener("click", () => {
      startPreloader();
      loadPage("adminHome");
      endPreloader();
    });
    document.getElementById("admin-management")?.addEventListener("click", () => {
      startPreloader();
      loadPage("adminManagement");
      endPreloader();
    });
    document.getElementById("admin-users-management")?.addEventListener("click", () => {
      startPreloader();
      loadPage("adminUsersManagement");
      endPreloader();
    });
    document.getElementById("admin-analytics")?.addEventListener("click", () => {
      startPreloader();
      loadPage("adminAnalytics");
      endPreloader();
    });
    document.getElementById("admin-settings")?.addEventListener("click", () => {
      startPreloader();
      loadPage("adminSettings");
      endPreloader();
    });
    document.getElementById("admin-logo-home")?.addEventListener("click", (e) => {
      e.preventDefault();
      startPreloader();
      window.location.href = "/";
      endPreloader();
    });
    // Mobile
    document.getElementById("admin-dashboard-mobile")?.addEventListener("click", () => {
      startPreloader();
      loadPage("adminHome");
      endPreloader();
    });
    document.getElementById("admin-management-mobile")?.addEventListener("click", () => {
      startPreloader();
      loadPage("adminManagement");
      endPreloader();
    });
    document.getElementById("admin-users-management-mobile")?.addEventListener("click", () => {
      startPreloader();
      loadPage("adminUsersManagement");
      endPreloader();
    });
    document.getElementById("admin-analytics-mobile")?.addEventListener("click", () => {
      startPreloader();
      loadPage("adminAnalytics");
      endPreloader();
    });
    document.getElementById("admin-settings-mobile")?.addEventListener("click", () => {
      startPreloader();
      loadPage("adminSettings");
      endPreloader();
    });
    document.getElementById("admin-logo-home-mobile")?.addEventListener("click", (e) => {
      e.preventDefault();
      startPreloader();
      window.location.href = "/";
      endPreloader();
    });
  }, 0);

  return `
    <nav>
      <!-- Desktop Sidebar -->
      <aside class="hidden md:flex flex-col w-64 bg-white p-6 shadow-md min-h-screen fixed left-0 top-0 z-40">
        <div class="flex items-center gap-2 mb-10">
          <img src="/assets/images/MKSignature.png" alt="Logo" class="h-10 w-10 rounded-full shadow" />
          <span class="font-bold text-lg text-primary">MK Signasures</span>
        </div>
        <ul class="flex-1 flex flex-col gap-2">
          <li>
            <button id="admin-dashboard" class="w-full text-left nav-link ${activePage === "dashboard" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"} flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition">
              <i class="fas fa-home"></i> <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button id="admin-management" class="w-full text-left nav-link ${activePage === "admin" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"} flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition">
              <i class="fas fa-user-shield"></i> <span>Admin Management</span>
            </button>
          </li>
          <li>
            <button id="admin-users-management" class="w-full text-left nav-link ${activePage === "users" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"} flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition">
              <i class="fas fa-users"></i> <span>Users Management</span>
            </button>
          </li>
          <li>
            <button id="admin-analytics" class="w-full text-left nav-link ${activePage === "analytics" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"} flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition">
              <i class="fas fa-chart-line"></i> <span>Analytics</span>
            </button>
          </li>
          <li>
            <button id="admin-settings" class="w-full text-left nav-link ${activePage === "settings" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"} flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition">
              <i class="fas fa-cog"></i> <span>Settings</span>
            </button>
          </li>
        </ul>
        <div class="mt-10">
          <button id="admin-logo-home" class="flex items-center gap-2 text-primary hover:underline transition">
            <i class="fas fa-arrow-left"></i> <span>Back to Shop</span>
          </button>
        </div>
      </aside>
      <!-- Mobile Bottom Nav -->
      <div class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around py-2 shadow-lg">
        <button id="admin-dashboard-mobile" class="cursor-pointer flex flex-col items-center text-xs ${activePage === "dashboard" ? "text-primary" : "text-gray-500"}">
          <i class="fas fa-home text-lg"></i>
          <span>Dashboard</span>
        </button>
        <button id="admin-management-mobile" class="cursor-pointer flex flex-col items-center text-xs ${activePage === "admin" ? "text-primary" : "text-gray-500"}">
          <i class="fas fa-user-shield text-lg"></i>
          <span>Admin</span>
        </button>
        <button id="admin-users-management-mobile" class="cursor-pointer flex flex-col items-center text-xs ${activePage === "users" ? "text-primary" : "text-gray-500"}">
          <i class="fas fa-users text-lg"></i>
          <span>Users</span>
        </button>
        <button id="admin-analytics-mobile" class="cursor-pointer flex flex-col items-center text-xs ${activePage === "analytics" ? "text-primary" : "text-gray-500"}">
          <i class="fas fa-chart-line text-lg"></i>
          <span>Stats</span>
        </button>
        <button id="admin-settings-mobile" class="cursor-pointer flex flex-col items-center text-xs ${activePage === "settings" ? "text-primary" : "text-gray-500"}">
          <i class="fas fa-cog text-lg"></i>
          <span>Settings</span>
        </button>
        <button id="admin-logo-home-mobile" class="cursor-pointer flex flex-col items-center text-xs text-primary">
          <i class="fas fa-arrow-left text-lg"></i>
          <span>Shop</span>
        </button>
      </div>
    </nav>
    <style>
      .nav-link:active { transform: scale(0.97); }
    </style>
  `;
}