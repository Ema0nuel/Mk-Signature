import { supabase } from "/assets/function/Data/db.js";
import { showNotificationToastr } from "/assets/function/Util/notification.js";
import { trackPageVisit } from "/assets/function/Util/analyticsLogger.js";

export default async function signup(renderPageHTML) {
  window.scrollTo(0, 0);
  trackPageVisit();

  renderPageHTML.innerHTML = `
    <section class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fade-in-up">
        <div class="mb-6 text-center">
          <img src="/assets/images/favicon.ico" alt="Mk Signasures" class="mx-auto w-16 h-16 mb-2 rounded-full shadow">
          <h2 class="text-2xl font-bold text-pink-600 mb-1">Create Your Account</h2>
          <p class="text-gray-500">Join Mk Signasures for exclusive offers!</p>
        </div>
        <form class="js-signup space-y-4" autocomplete="off">
          <div class="flex gap-2">
            <input name="sName" type="text" placeholder="First Name" required class="w-1/2 border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
            <input name="sLast" type="text" placeholder="Last Name" required class="w-1/2 border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
          </div>
          <input name="sEmail" type="email" placeholder="Email" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
          <input name="sNumber" type="tel" placeholder="Phone Number" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
          <input name="sPassword" type="password" placeholder="Password" required minlength="6" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
          <div>
            <label class="block font-semibold mb-1">Profile Photo</label>
            <input type="file" name="avatar" accept="image/*" class="w-full border rounded px-3 py-2" />
          </div>
          <button id="signup-btn" type="submit" class="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow flex items-center justify-center gap-2">
            <i class="fas fa-user-plus"></i> Sign Up
          </button>
        </form>
        <div class="mt-6 text-center text-gray-500">
          Already have an account?
          <a id="log" class="cursor-pointer text-pink-600 hover:underline font-semibold">Login</a>
        </div>
      </div>
    </section>
  `;

  const signupForm = document.querySelector(".js-signup");
  const signupBtn = document.getElementById("signup-btn");
  const logLink = document.getElementById("log");

  logLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.loadPage) {
      window.location.href = "/users/user/index.html";
    } else {
      window.location.href = "/users/user/index.html";
    }
  });

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    signupBtn.disabled = true;
    signupBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Signing up...`;

    const firstName = signupForm.sName.value.trim();
    const lastName = signupForm.sLast.value.trim();
    const email = signupForm.sEmail.value.trim();
    const phone = signupForm.sNumber.value.trim();
    const password = signupForm.sPassword.value;
    const avatarFile = signupForm.avatar?.files?.[0];

    if (!firstName || !lastName || !email || !phone || !password) {
      showNotificationToastr("Please fill in all fields.", "error");
      signupBtn.disabled = false;
      signupBtn.innerHTML = "Sign Up";
      return;
    }
    if (password.length < 6) {
      showNotificationToastr("Password must be 6 characters.", "error");
      signupBtn.disabled = false;
      signupBtn.innerHTML = "Sign Up";
      return;
    }

    // 1. Create user in Supabase Auth
    const { error: signUpError, data: signUpData } = await supabase.auth.signUp(
      {
        email,
        password,
      }
    );
    if (signUpError) {
      showNotificationToastr("Sign up failed.", "error");
      signupBtn.disabled = false;
      signupBtn.innerHTML = "Sign Up";
      return;
    }

    // 2. Upload avatar if provided
    let avatar_url = "";
    if (avatarFile && signUpData?.user?.id) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${signUpData.user.id}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true });
      if (uploadError) {
        console.error("Upload error:", uploadError);
        showNotificationToastr(
          uploadError.message || "Avatar upload failed.",
          "error"
        );
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
        avatar_url = publicUrlData?.publicUrl || "";
      }
    }

    // 3. Insert user profile into users table (NO password_hash)
    const full_name = `${firstName} ${lastName}`;
    const { error: dbError } = await supabase.from("users").insert([
      {
        id: signUpData.user.id,
        email,
        password_hash: 1111,
        full_name,
        phone,
        address: {},
        avatar_url,
      },
    ]);
    if (dbError) {
      showNotificationToastr(
        "Account created, but profile setup failed.",
        "error"
      );
    }

    showNotificationToastr(
      "Signup successful! Please check your email to verify your account.",
      "success"
    );
    signupBtn.disabled = false;
    signupBtn.innerHTML = "Sign Up";
    setTimeout(() => {
      if (window.loadPage) {
        window.location.href = "/users/user/index.html";
      } else {
        window.location.href = "/users/user/index.html";
      }
    }, 1500);
  });
}
