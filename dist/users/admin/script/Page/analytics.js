import { Navbar } from "../components/Navbar.js";
import { showSpinner } from "../components/spinner.js";
import { supabase } from "../../../../assets/function/Data/db.js";

// Dynamically load Chart.js if not present
async function loadChartJs() {
  if (typeof window.Chart === "undefined") {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Chart.js color palette
const chartColors = [
  "#00ffcc", "#00c9a7", "#007d80", "#fbbf24", "#f472b6", "#818cf8", "#f87171", "#34d399", "#f59e42"
];

// Modal helper (UI, not JSON)
function showModal(log) {
  let modal = document.getElementById("analytics-modal");
  if (modal) modal.remove();
  modal = document.createElement("div");
  modal.id = "analytics-modal";
  modal.className = "fixed inset-0 z-[9999] bg-black bg-opacity-40 flex items-center justify-center";
  modal.innerHTML = `
    <div class="relative bg-[#10182f] text-[#00ffcc] rounded-xl shadow-2xl w-full max-w-lg animate-fade-in overflow-y-auto max-h-[90vh] border-4 border-[#00ffcc]">
      <button class="absolute top-3 right-3 text-[#00ffcc] hover:text-pink-400 text-2xl close-modal z-10" aria-label="Close">&times;</button>
      <div class="p-6">
        <h2 class="text-xl font-bold mb-4 text-[#00ffcc] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="#00ffcc"><rect x="3" y="4" width="18" height="18" rx="2" fill="#10182f" stroke="#00ffcc" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="#00ffcc" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="#00ffcc" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="#00ffcc" stroke-width="2"/></svg>
          Log Details
        </h2>
        <div class="grid grid-cols-1 gap-3">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#00ffcc"><rect x="3" y="4" width="18" height="18" rx="2" fill="#10182f" stroke="#00ffcc" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="#00ffcc" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="#00ffcc" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="#00ffcc" stroke-width="2"/></svg>
            <span class="font-semibold">Date:</span>
            <span class="ml-1">${new Date(log.created_at).toLocaleString()}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-file-alt"></i>
            <span class="font-semibold">Page:</span>
            <span class="ml-1">${log.row_data?.page || ""}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-heading"></i>
            <span class="font-semibold">Title:</span>
            <span class="ml-1">${log.row_data?.title || ""}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-link"></i>
            <span class="font-semibold">Referrer:</span>
            <span class="ml-1 break-all">${log.row_data?.referrer || "-"}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-user"></i>
            <span class="font-semibold">User ID:</span>
            <span class="ml-1">${log.user_id || "-"}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-network-wired"></i>
            <span class="font-semibold">IP Address:</span>
            <span class="ml-1">${log.ip_address || ""}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-flag"></i>
            <span class="font-semibold">Country:</span>
            <span class="ml-1">${log.geo?.country || "-"}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-city"></i>
            <span class="font-semibold">City:</span>
            <span class="ml-1">${log.geo?.city || "-"}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-globe-africa"></i>
            <span class="font-semibold">Region:</span>
            <span class="ml-1">${log.geo?.region || "-"}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-laptop"></i>
            <span class="font-semibold">Device:</span>
            <span class="ml-1">${log.device_info?.platform || "-"}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-window-restore"></i>
            <span class="font-semibold">Browser:</span>
            <span class="ml-1">${log.device_info?.user_agent || "-"}</span>
          </div>
          <div class="flex items-center gap-2">
            <i class="fas fa-cogs"></i>
            <span class="font-semibold">Operation:</span>
            <span class="ml-1">${log.operation || ""}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = "";
    }
  };
  modal.querySelector(".close-modal").onclick = () => {
    modal.remove();
    document.body.style.overflow = "";
  };
}

export default async function adminAnalytics() {
  await loadChartJs();

  // Get today's date and month
  const today = new Date();
  const todayStr = today.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  const monthStr = today.toLocaleDateString(undefined, { year: "numeric", month: "long" });

  // Set up body and navbar, ensure enough left margin for aside
  let body = document.querySelector("body");
  body.classList.add("font-sans", "bg-[#0a0f1d]");
  body.innerHTML = `
    ${Navbar("analytics")}
    <div class="md:ml-64 min-h-screen flex flex-col bg-[#0a0f1d]">
      <main class="flex-1">
        <section class="w-full max-w-7xl mx-auto px-2 md:px-8 py-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 class="text-2xl md:text-3xl font-bold text-[#00ffcc] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 inline-block" fill="none" viewBox="0 0 24 24" stroke="#00ffcc"><rect x="3" y="4" width="18" height="18" rx="2" fill="#10182f" stroke="#00ffcc" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="#00ffcc" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="#00ffcc" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="#00ffcc" stroke-width="2"/></svg>
              Analytics Dashboard
            </h1>
            <div class="flex flex-col md:flex-row md:items-center gap-2">
              <div class="flex items-center gap-2 bg-[#10182f] px-3 py-1 rounded-lg border border-[#00ffcc]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#00ffcc"><rect x="3" y="4" width="18" height="18" rx="2" fill="#10182f" stroke="#00ffcc" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="#00ffcc" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="#00ffcc" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="#00ffcc" stroke-width="2"/></svg>
                <span class="font-semibold text-[#00ffcc]">Today:</span>
                <span class="text-[#00ffcc]">${todayStr}</span>
              </div>
              <div class="flex items-center gap-2 bg-[#10182f] px-3 py-1 rounded-lg border border-[#00ffcc]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#00ffcc"><rect x="3" y="4" width="18" height="18" rx="2" fill="#10182f" stroke="#00ffcc" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="#00ffcc" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="#00ffcc" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="#00ffcc" stroke-width="2"/></svg>
                <span class="font-semibold text-[#00ffcc]">Month:</span>
                <span class="text-[#00ffcc]">${monthStr}</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="dashboard-main">
            <!-- Spinner will show here -->
          </div>
          <div id="analytics-table" class="mt-8"></div>
        </section>
      </main>
    </div>
    <style>
      @keyframes fade-in { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
      .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      .delay-100 { animation-delay: .1s; }
      .delay-200 { animation-delay: .2s; }
      .delay-300 { animation-delay: .3s; }
      .delay-400 { animation-delay: .4s; }
    </style>
  `;

  const mainSection = document.getElementById("dashboard-main");
  await showSpinner(mainSection, 900);

  // Fetch analytics logs
  const { data: logs, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    mainSection.innerHTML = `<div class="text-pink-400 p-6">Failed to load analytics.</div>`;
    return;
  }

  // --- Data Preparation ---
  function groupBy(arr, keyFn) {
    return arr.reduce((acc, item) => {
      const key = keyFn(item);
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }

  // Visitors Overview (last 7 days)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daily = groupBy(logs, log => {
    const d = new Date(log.created_at);
    return days[d.getDay()];
  });
  const visitorsData = days.map(day => ({
    label: day,
    value: (daily[day] || []).length
  }));

  // Page Visits
  const byPage = groupBy(logs, log => log.row_data?.page || "unknown");
  const pageVisits = Object.entries(byPage).map(([page, arr]) => ({
    label: page, value: arr.length
  })).sort((a, b) => b.value - a.value);

  // Locations
  const byCountry = groupBy(logs, log => log.geo?.country || "Unknown");
  const countries = Object.entries(byCountry).map(([country, arr]) => ({
    label: country, value: arr.length
  })).sort((a, b) => b.value - a.value);

  // Devices
  const byDevice = groupBy(logs, log => (log.device_info?.platform || "Unknown").split(" ")[0]);
  const deviceTypes = Object.entries(byDevice).map(([type, arr]) => ({
    label: type, value: arr.length
  }));

  // Referrers
  const byRef = groupBy(logs, log => {
    const ref = log.row_data?.referrer;
    if (!ref) return "Direct";
    try {
      return new URL(ref).hostname.replace(/^www\./, "");
    } catch {
      return "Other";
    }
  });
  const referrers = Object.entries(byRef).map(([ref, arr]) => ({
    label: ref, value: arr.length
  }));

  // --- Render Cards ---
  mainSection.innerHTML = `
    <div class="card bg-[#10182f] rounded-xl shadow-lg p-6 flex flex-col animate-fade-in">
      <div class="icon-title flex items-center gap-2 mb-2">
        <i class="fas fa-users text-[#00ffcc] animate-bounce"></i>
        <h3 class="text-base font-bold text-[#00ffcc]">Visitors Overview</h3>
      </div>
      <canvas id="visitorsChart" height="200"></canvas>
    </div>
    <div class="card bg-[#10182f] rounded-xl shadow-lg p-6 flex flex-col animate-fade-in delay-100">
      <div class="icon-title flex items-center gap-2 mb-2">
        <i class="fas fa-chart-line text-[#00ffcc] animate-pulse"></i>
        <h3 class="text-base font-bold text-[#00ffcc]">Page Visits</h3>
      </div>
      <canvas id="pageChart" height="200"></canvas>
    </div>
    <div class="card bg-[#10182f] rounded-xl shadow-lg p-6 flex flex-col animate-fade-in delay-200">
      <div class="icon-title flex items-center gap-2 mb-2">
        <i class="fas fa-globe text-[#00ffcc]"></i>
        <h3 class="text-base font-bold text-[#00ffcc]">Visitor Locations</h3>
      </div>
      <canvas id="locationChart" height="200"></canvas>
    </div>
    <div class="card bg-[#10182f] rounded-xl shadow-lg p-6 flex flex-col animate-fade-in delay-300">
      <div class="icon-title flex items-center gap-2 mb-2">
        <i class="fas fa-laptop-code text-[#00ffcc]"></i>
        <h3 class="text-base font-bold text-[#00ffcc]">Devices Used</h3>
      </div>
      <canvas id="deviceChart" height="200"></canvas>
    </div>
    <div class="card bg-[#10182f] rounded-xl shadow-lg p-6 flex flex-col animate-fade-in delay-400">
      <div class="icon-title flex items-center gap-2 mb-2">
        <i class="fas fa-share-nodes text-[#00ffcc]"></i>
        <h3 class="text-base font-bold text-[#00ffcc]">Top Referrers</h3>
      </div>
      <canvas id="referrerChart" height="200"></canvas>
    </div>
  `;

  // --- Chart.js Rendering ---
  new window.Chart(document.getElementById("visitorsChart"), {
    type: 'line',
    data: {
      labels: visitorsData.map(d => d.label),
      datasets: [{
        label: 'Visits',
        data: visitorsData.map(d => d.value),
        borderColor: '#00ffcc',
        backgroundColor: 'rgba(0,255,204,0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#00ffcc'
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#00ffcc' }, grid: { color: '#222' } },
        y: { ticks: { color: '#00ffcc' }, grid: { color: '#222' } }
      }
    }
  });

  new window.Chart(document.getElementById("pageChart"), {
    type: 'bar',
    data: {
      labels: pageVisits.slice(0, 6).map(d => d.label),
      datasets: [{
        label: 'Visits',
        data: pageVisits.slice(0, 6).map(d => d.value),
        backgroundColor: chartColors
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#00ffcc' }, grid: { color: '#222' } },
        y: { ticks: { color: '#00ffcc' }, grid: { color: '#222' } }
      }
    }
  });

  new window.Chart(document.getElementById("locationChart"), {
    type: 'doughnut',
    data: {
      labels: countries.slice(0, 6).map(d => d.label),
      datasets: [{
        data: countries.slice(0, 6).map(d => d.value),
        backgroundColor: chartColors
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: '#00ffcc', font: { size: 13 } }
        }
      }
    }
  });

  new window.Chart(document.getElementById("deviceChart"), {
    type: 'pie',
    data: {
      labels: deviceTypes.map(d => d.label),
      datasets: [{
        data: deviceTypes.map(d => d.value),
        backgroundColor: chartColors
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: '#00ffcc', font: { size: 13 } }
        }
      }
    }
  });

  new window.Chart(document.getElementById("referrerChart"), {
    type: 'bar',
    data: {
      labels: referrers.slice(0, 6).map(d => d.label),
      datasets: [{
        label: 'Referrals',
        data: referrers.slice(0, 6).map(d => d.value),
        backgroundColor: chartColors
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#00ffcc' }, grid: { color: '#222' } },
        y: { ticks: { color: '#00ffcc' }, grid: { color: '#222' } }
      }
    }
  });

  // --- Table: Recent Activity Logs ---
  document.getElementById("analytics-table").innerHTML = `
    <div class="bg-[#10182f] rounded-xl shadow border border-[#00ffcc] mb-8 overflow-x-auto animate-fade-in delay-400">
      <h2 class="text-lg font-bold px-6 pt-6 pb-2 text-[#00ffcc] flex items-center gap-2">
        <i class="fas fa-table"></i> Recent Activity Logs
      </h2>
      <table class="min-w-full divide-y divide-[#00ffcc]">
        <thead>
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-[#00ffcc] uppercase">Date</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-[#00ffcc] uppercase">Page</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-[#00ffcc] uppercase">User</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-[#00ffcc] uppercase">IP</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-[#00ffcc] uppercase">Country</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-[#00ffcc] uppercase">Device</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-[#00ffcc] uppercase">Details</th>
          </tr>
        </thead>
        <tbody class="bg-[#10182f] divide-y divide-[#222]">
          ${logs.slice(0, 50).map((log, idx) => `
            <tr>
              <td class="px-4 py-2 text-xs text-[#00ffcc]">${new Date(log.created_at).toLocaleString()}</td>
              <td class="px-4 py-2 text-xs text-[#00ffcc]">${log.row_data?.page || ""}</td>
              <td class="px-4 py-2 text-xs text-[#00ffcc]">${log.user_id || "-"}</td>
              <td class="px-4 py-2 text-xs text-[#00ffcc]">${log.ip_address || ""}</td>
              <td class="px-4 py-2 text-xs text-[#00ffcc]">${log.geo?.country || ""}</td>
              <td class="px-4 py-2 text-xs text-[#00ffcc]">${log.device_info?.platform || ""}</td>
              <td class="px-4 py-2 text-xs">
                <button class="show-log-details text-[#00ffcc] hover:underline" data-idx="${idx}">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="#00ffcc"><rect x="3" y="4" width="18" height="18" rx="2" fill="#10182f" stroke="#00ffcc" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="#00ffcc" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="#00ffcc" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="#00ffcc" stroke-width="2"/></svg>
                  View
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  // --- Modal: Show log details ---
  document.querySelectorAll(".show-log-details").forEach(btn => {
    btn.onclick = () => {
      const log = logs[btn.dataset.idx];
      showModal(log);
    };
  });
}