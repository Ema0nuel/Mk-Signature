// --- USER ROUTES ---
import home from "../Pages/home.js";
import productDetail from "../Pages/productDetail.js";
import shop from "../Pages/shop.js";
import women from "../Pages/women.js";
import hair from "../Pages/hair.js";
import checkout from "../Pages/checkout.js";
import cart from "../Pages/cart.js";
import contact from "../Pages/contact.js";
import notfound from "../Pages/NotFound.js";
import { startPreloader, endPreloader } from "../Util/preloader.js";
import { setActiveMenu, removeActiveMenu } from "../Util/menu.js";
import about from "../Pages/about.js";
import terms from "../Pages/terms.js";
import privacy from "../Pages/privacy.js";
import login from "../../../users/user/scripts/login.js";
import signup from "../../../users/user/scripts/signup.js";
import user from "../../../users/user/scripts/user.js";

// --- ADMIN ROUTES ---
import loginAdmin from "../../../users/admin/script/Page/login.js";
import adminHome from "../../../users/admin/script/Page/home.js";
import adminNotfound from "../Pages/NotFound.js";

// --- ADMIN DASHBOARD PAGES (for Navbar.js) ---
import adminManagement from "../../../users/admin/script/Page/management.js";
import adminUsersManagement from "../../../users/admin/script/Page/userManagement.js";
import adminAnalytics from "../../../users/admin/script/Page/analytics.js";
import adminSettings from "../../../users/admin/script/Page/settings.js";

const renderPageHTML = document.getElementById("root");

// --- ROUTE REGISTRY ---
export const routes = {
  // User routes
  home,
  productDetail,
  shop,
  women,
  notfound,
  hair,
  checkout,
  cart,
  contact,
  about,
  terms,
  privacy,
  login,
  signup,
  user,
  // Admin routes
  loginAdmin,
  adminHome,
  adminNotfound,
  adminManagement,
  adminUsersManagement,
  adminAnalytics,
  adminSettings,
};

const navLinks = [
  // User nav
  { id: "home-nav", page: "home" },
  { id: "women-nav", page: "women" },
  { id: "hair-nav", page: "hair" },
  { id: "shop-nav", page: "shop" },
  { id: "cart-nav", page: "cart" },
  { id: "checkout-nav", page: "checkout" },
  { id: "contact-nav", page: "contact" },
  { id: "cart-nav-btn", page: "cart" },
  // Mobile
  { id: "home-nav-mobile", page: "home" },
  { id: "women-nav-mobile", page: "women" },
  { id: "hair-nav-mobile", page: "hair" },
  { id: "shop-nav-mobile", page: "shop" },
  { id: "cart-nav-mobile", page: "cart" },
  { id: "checkout-nav-mobile", page: "checkout" },
  { id: "contact-nav-mobile", page: "contact" },
  // Footer
  { id: "shop-footer", page: "shop" },
  { id: "about-footer", page: "about" },
  { id: "terms-footer", page: "terms" },
  { id: "term-footer", page: "terms" },
  { id: "contact-footer", page: "contact" },
  { id: "termp-footer", page: "privacy" },
  // Admin nav (for SPA routing)
  { id: "login-page", page: "loginAdmin" },
  { id: "admin-home-page", page: "adminHome" },
  { id: "admin-dashboard", page: "adminHome" },
  { id: "admin-management", page: "adminManagement" },
  { id: "admin-users-management", page: "adminUsersManagement" },
  { id: "admin-analytics", page: "adminAnalytics" },
  { id: "admin-settings", page: "adminSettings" },
  // Mobile admin nav
  { id: "admin-dashboard-mobile", page: "adminHome" },
  { id: "admin-management-mobile", page: "adminManagement" },
  { id: "admin-users-management-mobile", page: "adminUsersManagement" },
  { id: "admin-analytics-mobile", page: "adminAnalytics" },
  { id: "admin-settings-mobile", page: "adminSettings" },
];

// --- URL <-> Page mapping helpers ---
function parsePathToRoute(pathname) {
  // --- ADMIN ROUTES ---
  if (
    pathname === "/users/admin/" ||
    pathname === "/users/admin/login"
  )
    return { page: "loginAdmin" };

  if (pathname === "/users/admin/adminHome" || pathname === "/users/admin/home")
    return { page: "adminHome" };

  if (pathname === "/users/admin/management")
    return { page: "adminManagement" };

  if (pathname === "/users/admin/users")
    return { page: "adminUsersManagement" };

  if (pathname === "/users/admin/analytics")
    return { page: "adminAnalytics" };

  if (pathname === "/users/admin/settings")
    return { page: "adminSettings" };

  // Block user routes from handling other admin paths
  if (pathname.startsWith("/users/admin/")) {
    return { page: "adminNotfound" };
  }

  // --- USER ROUTES ---
  if (
    pathname === "/" ||
    pathname === "" ||
    pathname === "/home" ||
    pathname === "/index.html"
  )
    return { page: "home" };

  if (
    pathname === "/login" ||
    pathname === "/users/user/login" ||
    pathname === "/users/user/index.html"
  )
    return { page: "login" };
  if (pathname === "/users/user/signup") return { page: "signup" };

  if (pathname === "*") return { page: "notfound" };
  const productMatch = pathname.match(/^\/product\/([^/]+)$/);
  if (productMatch) return { page: "productDetail", args: [productMatch[1]] };
  const pageMatch = pathname.match(/^\/([a-zA-Z0-9_-]+)$/);
  if (pageMatch && routes[pageMatch[1]]) return { page: pageMatch[1] };
  return { page: "notfound" };
}

function getPathForRoute(page, ...args) {
  // Admin
  if (page === "loginAdmin") return "/users/admin/login";
  if (page === "adminHome") return "/users/admin/adminHome";
  if (page === "adminManagement") return "/users/admin/management";
  if (page === "adminUsersManagement") return "/users/admin/users";
  if (page === "adminAnalytics") return "/users/admin/analytics";
  if (page === "adminSettings") return "/users/admin/settings";
  // User
  if (page === "home") return "/";
  if (page === "productDetail" && args[0]) return `/product/${args[0]}`;
  return `/${page}`;
}

// --- Main page loader with admin routing support ---
export async function loadPage(page, ...args) {
  startPreloader();

  try {
    const render = routes[page];
    if (render) {
      // Update browser URL (pushState)
      const newPath = getPathForRoute(page, ...args);
      if (window.location.pathname !== newPath) {
        window.history.pushState({ page, args }, "", newPath);
      }
      await render(renderPageHTML, ...args);
      setActiveNav(page);
    } else {
      renderPageHTML.innerHTML = `
        <div class="p-8 text-center text-red-600 text-lg font-semibold">
          Page not found.
        </div>
      `;
      setActiveNav(null);
    }
  } catch (error) {
    console.error(`Error loading page "${page}":`, error);
    renderPageHTML.innerHTML = `
      <div class="p-8 text-center text-red-600 text-lg font-semibold">
        Failed to load the page.
      </div>
    `;
    setActiveNav(null);
  } finally {
    endPreloader(2000);
  }
}

// --- Handle browser navigation (back/forward) ---
window.addEventListener("popstate", async (event) => {
  const { page, args } =
    event.state || parsePathToRoute(window.location.pathname);
  if (page && routes[page]) {
    await routes[page](renderPageHTML, ...(args || []));
    setActiveNav(page);
  } else if (page !== null) {
    renderPageHTML.innerHTML = `
      <div class="p-8 text-center text-red-600 text-lg font-semibold">
        Page not found.
      </div>
    `;
    setActiveNav(null);
  }
});

// --- Set all navigation click events ---
function setNavEvents() {
  navLinks.forEach(({ id, page }) => {
    const element = document.getElementById(id);
    if (!element) return;

    element.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage(page);
    });
  });
}

// --- Set active nav based on current page ---
function setActiveNav(currentPage) {
  navLinks.forEach(({ id, page }) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (page === currentPage) {
      setActiveMenu(el);
    } else {
      removeActiveMenu(el);
    }
  });
}

// --- DOM Ready ---
window.addEventListener("DOMContentLoaded", async () => {
  setNavEvents();
  const { page, args } = parsePathToRoute(window.location.pathname);
  if (page && routes[page]) {
    await routes[page](renderPageHTML, ...(args || []));
    setActiveNav(page);
  } else if (page !== null) {
    renderPageHTML.innerHTML = `
      <div class="p-8 text-center text-red-600 text-lg font-semibold">
        Page not found.
      </div>
    `;
    setActiveNav(null);
  }
});

// Expose loadPage globally (optional)
window.loadPage = loadPage;