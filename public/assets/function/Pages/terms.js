export default function terms(renderPageHTML) {
    window.scrollTo(0, 0);
  renderPageHTML.innerHTML = `
    <section class="py-12 bg-gray-50 min-h-screen animate-fade-in-up">
      <div class="max-w-4xl mx-auto px-4">
        <div class="mb-10 text-center">
          <h1 class="text-4xl font-extrabold text-pink-600 mb-2">Terms & Conditions</h1>
          <p class="text-lg text-gray-600">Please read these terms carefully before using Mk Signasures.</p>
        </div>
        <div class="bg-white rounded-xl shadow p-8 space-y-8">
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">1. Introduction</h2>
            <p class="text-gray-700">Welcome to Mk Signasures. By accessing or using our website, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please do not use our website.</p>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">2. Eligibility</h2>
            <p class="text-gray-700">You must be at least 18 years old or have parental supervision to use this site and purchase products.</p>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">3. Business Policy</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>Online store: 24/7 availability</li>
              <li>Physical store: Mon-Sat, 9:00 AM - 7:00 PM</li>
              <li>Contact: <a href="mailto:mksignasures@gmail.com" class="text-pink-600 hover:underline">mksignasures@gmail.com</a> | +2348101510096</li>
              <li>Social: <a href="https://www.instagram.com/mk_signasures/" class="text-pink-600 hover:underline">@mk_signasures</a></li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">4. Payments</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>Accepted: Bank transfer, credit/debit cards, cash (in-store)</li>
              <li>All payments must be made in full before delivery</li>
              <li>No credit or installment plans</li>
              <li>Refunds only for damaged or incorrect products (request within 7 days with proof)</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">5. Delivery & Shipping</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>Local delivery: 1-3 business days</li>
              <li>Nationwide: 3-7 business days</li>
              <li>Flat-rate delivery fee: ₦2,500–₦5,000</li>
              <li>Free delivery for orders above 20 pieces</li>
              <li>Order tracking provided via email/SMS</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">6. Returns & Exchanges</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>Products must be unused, in original packaging, with tags</li>
              <li>Customized wigs are not returnable</li>
              <li>Contact customer service to initiate returns within 14 days</li>
              <li>Exchanges subject to stock availability</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">7. Quality Assurance</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>All wigs undergo strict quality control</li>
              <li>6-month quality guarantee with proper care</li>
              <li>Care guides provided with each product</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">8. Privacy & Data</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>Customer information is confidential and never shared with third parties</li>
              <li>Secure payment gateways protect your data</li>
              <li>See our <a href="/privacy" class="text-pink-600 hover:underline">Privacy Policy</a> for more</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">9. Code of Conduct</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>Respectful communication is expected at all times</li>
              <li>Disputes resolved amicably via customer service</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">10. Warranty & Cancellations</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>3-month warranty for wigs against manufacturing defects</li>
              <li>Warranty excludes improper care or external damage</li>
              <li>Orders can be canceled within 24 hours without penalty; late cancellations incur a 20% restocking fee</li>
            </ul>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-2 text-gray-800">11. Reviews & Social Media</h2>
            <ul class="list-disc ml-6 text-gray-700">
              <li>Honest reviews are encouraged</li>
              <li>Negative feedback will be addressed privately</li>
              <li>Abusive users may be blocked</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `;
}
