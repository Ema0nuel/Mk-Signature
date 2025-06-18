export default function about(renderPageHTML) {
    window.scrollTo(0, 0);
  renderPageHTML.innerHTML = `
    <section class="py-12 bg-gray-50 min-h-screen animate-fade-in-up">
      <div class="max-w-6xl mx-auto px-4">
        <div class="mb-10 text-center">
          <h1 class="text-4xl font-extrabold text-pink-600 mb-2">About Mk Signasures</h1>
          <p class="text-lg text-gray-600">Empowering Confidence, Celebrating Beauty</p>
        </div>
        <div class="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 class="text-2xl font-bold mb-4 text-gray-800">Who We Are</h2>
            <p class="mb-4 text-gray-700">
              <span class="font-semibold text-pink-600">Mk Signasures</span> is Nigeria’s premier destination for women’s beauty, hair, and fashion. We offer a curated selection of high-quality wigs, hair products, cosmetics, and elegant dresses, all designed to help you express your unique style and confidence.
            </p>
            <p class="mb-4 text-gray-700">
              Our mission is to provide a seamless, rewarding shopping experience for every woman. Whether you’re looking for a bold new look, everyday essentials, or the perfect dress for a special occasion, Mk Signasures is your trusted partner in beauty and fashion.
            </p>
            <ul class="mb-4 text-gray-700 space-y-2">
              <li><i class="fas fa-check-circle text-pink-500 mr-2"></i> 100% authentic products</li>
              <li><i class="fas fa-check-circle text-pink-500 mr-2"></i> Fast nationwide delivery</li>
              <li><i class="fas fa-check-circle text-pink-500 mr-2"></i> Secure payments & privacy</li>
              <li><i class="fas fa-check-circle text-pink-500 mr-2"></i> Dedicated customer support</li>
            </ul>
            <a href="/contact" class="inline-block mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow flex items-center gap-2">
              <i class="fas fa-envelope"></i> Contact Us
            </a>
          </div>
          <div class="flex flex-col items-center">
            <img src="/assets/images/MKSignature.png" alt="Mk Signasures Logo" class="w-64 h-64 object-contain rounded-xl shadow mb-6" />
            <div class="flex gap-4">
              <a href="https://api.whatsapp.com/send/?phone=2348101510096" class="text-green-500 text-2xl hover:scale-110 transition"><i class="fab fa-whatsapp"></i></a>
              <a href="https://www.instagram.com/mk_signasures/" class="text-pink-500 text-2xl hover:scale-110 transition"><i class="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
        <div class="mt-16">
          <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">Meet Our Team</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <img src="/assets/images/users/team1.jpg" alt="Dahlia Moore" class="w-24 h-24 rounded-full mb-3 object-cover shadow">
              <h4 class="font-bold text-lg text-gray-800">Dahlia Moore</h4>
              <span class="text-pink-600 font-semibold mb-2">Senior Manager</span>
              <div class="flex gap-2">
                <a href="#" class="text-blue-600 hover:text-blue-800"><i class="fab fa-facebook-f"></i></a>
                <a href="#" class="text-pink-500 hover:text-pink-700"><i class="fab fa-instagram"></i></a>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <img src="/assets/images/users/team2.jpg" alt="John Dago" class="w-24 h-24 rounded-full mb-3 object-cover shadow">
              <h4 class="font-bold text-lg text-gray-800">John Dago</h4>
              <span class="text-pink-600 font-semibold mb-2">Marketing</span>
              <div class="flex gap-2">
                <a href="#" class="text-blue-600 hover:text-blue-800"><i class="fab fa-facebook-f"></i></a>
                <a href="#" class="text-pink-500 hover:text-pink-700"><i class="fab fa-instagram"></i></a>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <img src="/assets/images/users/team3.jpg" alt="Zara Tango" class="w-24 h-24 rounded-full mb-3 object-cover shadow">
              <h4 class="font-bold text-lg text-gray-800">Zara Tango</h4>
              <span class="text-pink-600 font-semibold mb-2">Web Developer</span>
              <div class="flex gap-2">
                <a href="#" class="text-blue-600 hover:text-blue-800"><i class="fab fa-facebook-f"></i></a>
                <a href="#" class="text-pink-500 hover:text-pink-700"><i class="fab fa-instagram"></i></a>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <img src="/assets/images/users/team4.jpg" alt="David Zone" class="w-24 h-24 rounded-full mb-3 object-cover shadow">
              <h4 class="font-bold text-lg text-gray-800">David Zone</h4>
              <span class="text-pink-600 font-semibold mb-2">SEO Expert</span>
              <div class="flex gap-2">
                <a href="#" class="text-blue-600 hover:text-blue-800"><i class="fab fa-facebook-f"></i></a>
                <a href="#" class="text-pink-500 hover:text-pink-700"><i class="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <i class="fas fa-rocket text-pink-600 text-3xl mb-2"></i>
            <h4 class="font-bold text-lg mb-1">Free Shipping</h4>
            <p class="text-gray-600 text-center">Enjoy free shipping on orders over ₦100,000 and fast delivery nationwide.</p>
          </div>
          <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <i class="fas fa-lock text-pink-600 text-3xl mb-2"></i>
            <h4 class="font-bold text-lg mb-1">Secure Payment</h4>
            <p class="text-gray-600 text-center">Your transactions are protected with industry-leading security and privacy standards.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}
