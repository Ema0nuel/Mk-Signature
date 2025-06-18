export function showNotification(message, type = "info", duration = 2500) {
  // Remove existing toast if present
  const prev = document.getElementById("mk-toast");
  if (prev) prev.remove();

  const colors = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
    warning: "bg-yellow-500 text-black",
  };
  const icons = {
    success: "fa-check-circle",
    error: "fa-times-circle",
    info: "fa-info-circle",
    warning: "fa-exclamation-triangle",
  };

  const toast = document.createElement("div");
  toast.id = "mk-toast";
  toast.className = `fixed top-6 right-6 z-[9999] px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-toast-in ${
    colors[type] || colors.info
  }`;
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info} text-xl"></i>
    <span class="font-medium">${message}</span>
    <button class="ml-4 text-white/80 hover:text-white focus:outline-none" aria-label="Close">
      <i class="fas fa-times"></i>
    </button>
  `;

  document.body.appendChild(toast);

  // Remove on click or after duration, with animation
  const removeToast = () => {
    toast.classList.remove("animate-toast-in");
    toast.classList.add("animate-toast-out");
    setTimeout(() => toast.remove(), 400);
  };
  toast.querySelector("button").onclick = removeToast;
  setTimeout(removeToast, duration);
}

export function showNotificationToastr(
  message,
  type = "info",
  duration = 3000
) {
  // Remove any existing notification
  const existing = document.getElementById("mk-toast");
  if (existing) existing.remove();

  // Icon per type
  const icons = {
    success: `<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
    error: `<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`,
    info: `<svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01"/></svg>`,
    warning: `<svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01"/></svg>`,
  };

  // Color per type
  const colors = {
    success: "bg-green-50 border-green-500 text-green-700",
    error: "bg-red-50 border-red-500 text-red-700",
    info: "bg-blue-50 border-blue-500 text-blue-700",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-700",
  };

  // Toast HTML
  const toast = document.createElement("div");
  toast.id = "mk-toast";
  toast.className = `fixed top-8 left-1/2 z-50 transform -translate-x-1/2 px-6 py-4 border-l-4 rounded-xl shadow-2xl flex items-center gap-3 toast-animate-in ${
    colors[type] || colors.info
  }`;
  toast.style.minWidth = "260px";
  toast.style.maxWidth = "90vw";
  toast.style.transition = "box-shadow 0.3s cubic-bezier(.4,0,.2,1)";
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span class="font-medium">${message}</span>
    <button class="ml-4 text-xl font-bold focus:outline-none text-gray-400 hover:text-gray-700" aria-label="Close">&times;</button>
  `;

  document.body.appendChild(toast);

  // Remove on click or after duration
  toast.querySelector("button").onclick = () => animateOutAndRemove(toast);
  setTimeout(() => animateOutAndRemove(toast), duration);

  function animateOutAndRemove(el) {
    el.classList.remove("toast-animate-in");
    el.classList.add("toast-animate-out");
    setTimeout(() => el.remove(), 500);
  }
}

// Add modern toast animation styles if not present
if (!document.getElementById("mk-toast-style")) {
  const style = document.createElement("style");
  style.id = "mk-toast-style";
  style.innerHTML = `
@keyframes toast-in {
  from { opacity: 0; transform: translateY(-40px) scale(0.95);}
  to   { opacity: 1; transform: translateY(0) scale(1);}
}
@keyframes toast-out {
  from { opacity: 1; transform: translateY(0) scale(1);}
  to   { opacity: 0; transform: translateY(-40px) scale(0.95);}
}
.toast-animate-in {
  animation: toast-in 0.5s cubic-bezier(.4,0,.2,1) both;
}
.toast-animate-out {
  animation: toast-out 0.5s cubic-bezier(.4,0,.2,1) both;
}
`;
  document.head.appendChild(style);
}
