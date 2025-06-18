
import { trackPageVisit } from "/assets/function/Util/analyticsLogger.js";
export default async function notfound(renderPageHTML) {
  window.scrollTo(0, 0);
  trackPageVisit({ page: "notfound" });
  renderPageHTML.innerHTML = `
    <section class="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50 animate-fade-in-up pb-3">
      <img src="https://horizonridgecu.online/htdocs_error/page_not_found.svg" alt="Page Not Found" class="w-screen h-full mb-6">
      <h1 class="text-6xl font-extrabold text-pink-600 mb-2">404</h1>
      <p class="text-2xl text-gray-700 mb-4">Oops! Page Not Found</p>
      <p class="text-gray-500 mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <button id="go-home-btn" class="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition-all duration-300 flex items-center gap-2">
        <i class="fas fa-arrow-left"></i>
        Return to Home
      </button>
    </section>
  `;

  // Button event: go home using SPA navigation if available
  const btn = document.getElementById("go-home-btn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.loadPage) {
        window.loadPage("home");
      } else {
        window.location.href = "/";
      }
    });
  }
}