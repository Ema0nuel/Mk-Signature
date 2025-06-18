
import { trackPageVisit } from "/assets/function/Util/analyticsLogger.js";
export default function privacy(renderPageHTML) {
    window.scrollTo(0, 0);
    trackPageVisit({ page: "privacy" });
  renderPageHTML.innerHTML = `
    <section class="py-12 bg-gray-50 min-h-screen animate-fade-in-up">
      <div class="max-w-4xl mx-auto px-4">
        <div class="mb-10 text-center">
          <h1 class="text-4xl font-extrabold text-pink-600 mb-2">Privacy Policy</h1>
          <p class="text-lg text-gray-600">Your privacy and trust are important to us at Mk Signasures.</p>
        </div>
        <div class="bg-white rounded-xl shadow p-8 space-y-8">
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">1. Information We Collect</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>Personal details (name, email, phone, address) for order processing</li>
              <li>Payment information (processed securely via trusted gateways)</li>
              <li>Browsing data (cookies, device info, IP address) for analytics and security</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">2. How We Use Your Data</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>To process and deliver your orders</li>
              <li>To communicate order updates, offers, and support</li>
              <li>To improve our website and services</li>
              <li>To prevent fraud and ensure security</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">3. Payments & Security</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>All payments are processed via secure, PCI-compliant gateways (e.g., Paystack, cards, bank transfer)</li>
              <li>We do not store your card details on our servers</li>
              <li>SSL encryption protects your data during transmission</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">4. Cookies & Tracking</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>We use cookies to remember your preferences and enhance your experience</li>
              <li>Cookies help us analyze site traffic and personalize content</li>
              <li>You can disable cookies in your browser settings, but some features may not work</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">5. Data Sharing & Confidentiality</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>We never sell or rent your personal data to third parties</li>
              <li>We may share data with trusted partners for order fulfillment and delivery only</li>
              <li>All staff are trained on data privacy and confidentiality</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">6. Your Rights</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>You can request access, correction, or deletion of your data at any time</li>
              <li>Contact us at <a href="mailto:mksignasures@gmail.com" class="text-pink-600 hover:underline">mksignasures@gmail.com</a> for privacy requests</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">7. Updates</h2>
            <p class="text-gray-700">We may update this policy occasionally. Changes will be posted on this page. Please review regularly.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}
