import { Navbar } from "../components/Navbar.js";
import { showSpinner } from "../components/spinner.js";
import { supabase } from "../../../../assets/function/Data/db.js";

// Helper: SVG icon
const icon = (name, cls = "w-5 h-5") => {
  const icons = {
    general: `<i class="fas fa-cogs ${cls}"></i>`,
    appearance: `<i class="fas fa-paint-brush ${cls}"></i>`,
    menu: `<i class="fas fa-bars ${cls}"></i>`,
    email: `<i class="fas fa-envelope ${cls}"></i>`,
    api: `<i class="fas fa-plug ${cls}"></i>`,
    log: `<i class="fas fa-history ${cls}"></i>`,
    backup: `<i class="fas fa-database ${cls}"></i>`,
    info: `<i class="fas fa-info-circle ${cls}"></i>`,
    trash: `<i class="fas fa-trash-alt ${cls}"></i>`,
    auth: `<i class="fas fa-user-shield ${cls}"></i>`,
    save: `<i class="fas fa-save ${cls}"></i>`,
    upload: `<i class="fas fa-upload ${cls}"></i>`,
    edit: `<i class="fas fa-edit ${cls}"></i>`,
    restore: `<i class="fas fa-undo ${cls}"></i>`,
    delete: `<i class="fas fa-times ${cls}"></i>`,
  };
  return icons[name] || "";
};

// --- General Settings ---
async function handleGeneralSettingsSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  await supabase.from("settings").upsert([{
    key: "general",
    value: JSON.stringify(data)
  }]);
  alert("General settings saved!");
}

// --- Appearance Settings ---
async function handleAppearanceSettingsSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  await supabase.from("settings").upsert([{
    key: "appearance",
    value: JSON.stringify(data)
  }]);
  alert("Appearance settings saved!");
}

// --- Email Settings ---
async function handleEmailSettingsSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  await supabase.from("settings").upsert([{
    key: "email",
    value: JSON.stringify(data)
  }]);
  alert("Email/Notification settings saved!");
}

// --- API/Integrations Settings ---
async function handleApiSettingsSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  await supabase.from("settings").upsert([{
    key: "api",
    value: JSON.stringify(data)
  }]);
  alert("API/Integration settings saved!");
}

// --- Menu Management (Add/Edit) ---
function handleMenuEdit(menuName) {
  alert(`Edit menu: ${menuName}`);
}
function handleMenuAdd(e) {
  e.preventDefault();
  alert("Menu item added (demo)");
}

// --- Backup & Restore ---
function handleCreateBackup() {
  alert("Backup created (demo)");
}

// --- Trash/Recycle Bin ---
function handleRestoreTrash(itemId) {
  alert(`Restore item ${itemId} (demo)`);
}
function handleDeleteTrash(itemId) {
  alert(`Permanently delete item ${itemId} (demo)`);
}

// --- System Info (View Error Logs) ---
function handleViewErrorLogs() {
  alert("Show error logs (demo)");
}

// --- Main Page Render ---
export default async function adminSettings() {
  let body = document.querySelector("body");
  body.innerHTML = `
    ${Navbar("settings")}
    <div class="md:ml-64 min-h-screen bg-[#0a0f1d] text-[#00ffcc] font-sans">
      <main class="max-w-5xl mx-auto px-2 sm:px-4 md:px-8 py-8 w-full">
        <h1 class="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">${icon("general", "w-7 h-7")} Settings & Configuration</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- General Settings -->
          <section class="bg-[#10182f] rounded-xl shadow-lg p-4 sm:p-6 mb-4 w-full">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">${icon("general")} General Settings</h2>
            <form id="general-settings-form" class="space-y-4">
              <div>
                <label class="block font-semibold mb-1">Site Title</label>
                <input type="text" name="site_title" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="Site Title" />
              </div>
              <div>
                <label class="block font-semibold mb-1">Tagline</label>
                <input type="text" name="tagline" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="Tagline" />
              </div>
              <div class="flex flex-col sm:flex-row gap-2">
                <div class="flex-1">
                  <label class="block font-semibold mb-1">Default Timezone</label>
                  <input type="text" name="timezone" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="e.g. UTC" />
                </div>
                <div class="flex-1">
                  <label class="block font-semibold mb-1">Date/Time Format</label>
                  <input type="text" name="datetime_format" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="e.g. YYYY-MM-DD" />
                </div>
              </div>
              <div class="flex flex-col sm:flex-row gap-2">
                <div class="flex-1">
                  <label class="block font-semibold mb-1">Contact Email</label>
                  <input type="email" name="contact_email" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="Contact Email" />
                </div>
                <div class="flex-1">
                  <label class="block font-semibold mb-1">Admin Email</label>
                  <input type="email" name="admin_email" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="Admin Email" />
                </div>
              </div>
              <div>
                <label class="block font-semibold mb-1">Homepage</label>
                <select name="homepage" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]">
                  <option value="static">Static Page</option>
                  <option value="latest">Latest Posts</option>
                </select>
              </div>
              <button type="submit" class="mt-2 px-4 py-2 rounded bg-[#00ffcc] text-[#0a0f1d] font-bold hover:bg-[#00c9a7] transition w-full sm:w-auto">${icon("save")} Save</button>
            </form>
          </section>

          <!-- Appearance / Theme Settings -->
          <section class="bg-[#10182f] rounded-xl shadow-lg p-4 sm:p-6 mb-4 w-full">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">${icon("appearance")} Appearance / Theme</h2>
            <form id="appearance-settings-form" class="space-y-4">
              <div>
                <label class="block font-semibold mb-1">Logo Upload</label>
                <input type="file" name="logo" class="w-full text-[#00ffcc]"/>
              </div>
              <div>
                <label class="block font-semibold mb-1">Color Scheme</label>
                <select name="color_scheme" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]">
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold mb-1">Font</label>
                <select name="font" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]">
                  <option value="sans">Sans-serif</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Monospace</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold mb-1">Custom CSS</label>
                <textarea name="custom_css" rows="2" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="Paste your CSS here"></textarea>
              </div>
              <div>
                <label class="block font-semibold mb-1">Favicon Upload</label>
                <input type="file" name="favicon" class="w-full text-[#00ffcc]"/>
              </div>
              <button type="submit" class="mt-2 px-4 py-2 rounded bg-[#00ffcc] text-[#0a0f1d] font-bold hover:bg-[#00c9a7] transition w-full sm:w-auto">${icon("save")} Save</button>
            </form>
          </section>
        </div>

        <!-- Navigation / Menu Management -->
        <section class="bg-[#10182f] rounded-xl shadow-lg p-4 sm:p-6 mb-8 w-full">
          <h2 class="text-lg font-bold mb-4 flex items-center gap-2">${icon("menu")} Navigation / Menu Management</h2>
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold mb-2">Menus</h3>
              <ul class="space-y-2" id="menu-list">
                <li class="flex items-center gap-2"><span class="font-bold">Main Menu</span> <button class="ml-auto text-[#00ffcc] hover:underline menu-edit-btn" data-menu="Main Menu">${icon("edit")} Edit</button></li>
                <li class="flex items-center gap-2"><span class="font-bold">Footer Menu</span> <button class="ml-auto text-[#00ffcc] hover:underline menu-edit-btn" data-menu="Footer Menu">${icon("edit")} Edit</button></li>
              </ul>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold mb-2">Menu Editor</h3>
              <form id="menu-editor-form" class="bg-[#0a0f1d] rounded p-3 border border-[#00ffcc]">
                <div class="mb-2 flex flex-col sm:flex-row gap-2">
                  <input type="text" name="link_text" class="flex-1 rounded bg-[#10182f] border border-[#00ffcc] px-2 py-1 text-[#00ffcc]" placeholder="Link Text"/>
                  <input type="url" name="url" class="flex-1 rounded bg-[#10182f] border border-[#00ffcc] px-2 py-1 text-[#00ffcc]" placeholder="URL"/>
                  <button type="submit" class="px-3 py-1 rounded bg-[#00ffcc] text-[#0a0f1d] font-bold hover:bg-[#00c9a7] w-full sm:w-auto">${icon("save")}</button>
                </div>
                <div class="text-xs text-[#00ffcc]">Drag and drop to reorder menu items.</div>
              </form>
            </div>
          </div>
        </section>

        <!-- Email / Notification Settings -->
        <section class="bg-[#10182f] rounded-xl shadow-lg p-4 sm:p-6 mb-8 w-full">
          <h2 class="text-lg font-bold mb-4 flex items-center gap-2">${icon("email")} Email / Notification Settings</h2>
          <form id="email-settings-form" class="space-y-4">
            <div>
              <label class="block font-semibold mb-1">SMTP Host</label>
              <input type="text" name="smtp_host" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="SMTP Host" />
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="flex-1">
                <label class="block font-semibold mb-1">SMTP User</label>
                <input type="text" name="smtp_user" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="SMTP User" />
              </div>
              <div class="flex-1">
                <label class="block font-semibold mb-1">SMTP Password</label>
                <input type="password" name="smtp_pass" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="SMTP Password" />
              </div>
            </div>
            <div>
              <label class="block font-semibold mb-1">Templates</label>
              <select name="email_template" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]">
                <option>New User Welcome</option>
                <option>Password Reset</option>
                <option>Order Confirmation</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1">Enable Notifications</label>
              <input type="checkbox" name="enable_notifications" class="accent-[#00ffcc] scale-125 ml-2"/>
            </div>
            <button type="submit" class="mt-2 px-4 py-2 rounded bg-[#00ffcc] text-[#0a0f1d] font-bold hover:bg-[#00c9a7] transition w-full sm:w-auto">${icon("save")} Save</button>
          </form>
        </section>

        <!-- Integrations / API Settings -->
        <section class="bg-[#10182f] rounded-xl shadow-lg p-4 sm:p-6 mb-8 w-full">
          <h2 class="text-lg font-bold mb-4 flex items-center gap-2">${icon("api")} Integrations / API Settings</h2>
          <form id="api-settings-form" class="space-y-4">
            <div>
              <label class="block font-semibold mb-1">Analytics API Key</label>
              <input type="text" name="analytics_api" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="API Key" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Payment Gateway Key</label>
              <input type="text" name="payment_api" class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]" placeholder="Payment API Key" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Enable Integrations</label>
              <input type="checkbox" name="enable_integrations" class="accent-[#00ffcc] scale-125 ml-2"/>
            </div>
            <button type="submit" class="mt-2 px-4 py-2 rounded bg-[#00ffcc] text-[#0a0f1d] font-bold hover:bg-[#00c9a7] transition w-full sm:w-auto">${icon("save")} Save</button>
          </form>
        </section>

        <!-- Tools & Utilities -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Activity Log -->
          <div class="bg-[#10182f] rounded-xl shadow-lg p-4 sm:p-6 mb-8 w-full overflow-x-auto">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">${icon("log")} Activity Log / Audit Trail</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full text-xs">
                <thead>
                  <tr>
                    <th class="px-2 py-1 text-left text-[#00ffcc]">Timestamp</th>
                    <th class="px-2 py-1 text-left text-[#00ffcc]">User</th>
                    <th class="px-2 py-1 text-left text-[#00ffcc]">Action</th>
                    <th class="px-2 py-1 text-left text-[#00ffcc]">Resource</th>
                  </tr>
                </thead>
                <tbody id="activity-log-table" class="divide-y divide-[#222]">
                  <tr><td colspan="4" class="px-2 py-2 text-center text-[#00ffcc]">Loading...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Backup & Restore -->
          <div class="bg-[#10182f] rounded-xl shadow-lg p-4 sm:p-6 mb-8 w-full">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">${icon("backup")} Backup & Restore</h2>
            <button id="create-backup-btn" class="mb-3 px-4 py-2 rounded bg-[#00ffcc] text-[#0a0f1d] font-bold hover:bg-[#00c9a7] transition w-full sm:w-auto">${icon("save")} Create Backup Now</button>
            <div class="mb-2 font-semibold">Previous Backups</div>
            <ul class="space-y-2 text-sm" id="backup-list">
              <li class="flex items-center gap-2">No backups yet.</li>
            </ul>
            <div class="mt-2">
              <label class="block font-semibold mb-1">Schedule Backup</label>
              <select class="w-full rounded bg-[#0a0f1d] border border-[#00ffcc] px-3 py-2 text-[#00ffcc]">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- System Info -->
          <div class="bg-[#10182f] rounded-xl shadow-lg p-4 sm:p-6 mb-8 w-full">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">${icon("info")} System Information / Diagnostics</h2>
            <ul class="text-sm space-y-1">
              <li>Server OS: <span class="font-semibold">Linux</span></li>
              <li>Node.js Version: <span class="font-semibold">v18.x</span></li>
              <li>Database: <span class="font-semibold">PostgreSQL</span></li>
              <li>Disk Usage: <span class="font-semibold">2.3GB / 10GB</span></li>
              <li>Memory Usage: <span class="font-semibold">1.1GB / 4GB</span></li>
              <li>Error Logs: <button id="view-error-logs-btn" class="ml-2 text-[#00ffcc] hover:underline">${icon("edit")} View</button></li>
            </ul>
          </div>
          <!-- Trash / Recycle Bin -->
          <div class="bg-[#10182f] rounded-xl shadow-lg p-4 sm:p-6 mb-8 w-full">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">${icon("trash")} Trash / Recycle Bin</h2>
            <ul class="space-y-2 text-sm" id="trash-list">
              <li class="flex items-center gap-2">No deleted items.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
    <style>
      @media (max-width: 640px) {
        .rounded-xl { border-radius: 1rem !important; }
        .shadow-lg, .shadow { box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10) !important; }
        .overflow-x-auto { overflow-x: auto !important; }
        table.min-w-full { min-width: 600px !important; }
        th, td { white-space: nowrap; }
      }
    </style>
  `;

  // Show spinner for main content
  const mainSection = document.querySelector("main");
  await showSpinner(mainSection, 1000);

  // Attach form handlers
  document.getElementById("general-settings-form").onsubmit = handleGeneralSettingsSubmit;
  document.getElementById("appearance-settings-form").onsubmit = handleAppearanceSettingsSubmit;
  document.getElementById("email-settings-form").onsubmit = handleEmailSettingsSubmit;
  document.getElementById("api-settings-form").onsubmit = handleApiSettingsSubmit;
  document.getElementById("menu-editor-form").onsubmit = handleMenuAdd;

  // Menu edit buttons
  document.querySelectorAll(".menu-edit-btn").forEach(btn => {
    btn.onclick = () => handleMenuEdit(btn.dataset.menu);
  });

  // Backup button
  document.getElementById("create-backup-btn").onclick = handleCreateBackup;

  // Error logs button
  document.getElementById("view-error-logs-btn").onclick = handleViewErrorLogs;

  // Fetch and render Activity Log (example)
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("created_at,user_id,operation,row_data")
    .order("created_at", { ascending: false })
    .limit(10);

  const logTable = document.getElementById("activity-log-table");
  if (logTable && logs && logs.length) {
    logTable.innerHTML = logs.map(log => `
      <tr>
        <td class="px-2 py-1">${new Date(log.created_at).toLocaleString()}</td>
        <td class="px-2 py-1">${log.user_id || "System"}</td>
        <td class="px-2 py-1">${log.operation || "-"}</td>
        <td class="px-2 py-1">${log.row_data?.page || "-"}</td>
      </tr>
    `).join("");
  } else if (logTable) {
    logTable.innerHTML = `<tr><td colspan="4" class="px-2 py-2 text-center text-[#00ffcc]">No logs found.</td></tr>`;
  }
}