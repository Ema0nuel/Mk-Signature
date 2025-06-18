// filepath: public/assets/function/Util/analyticsLogger.js
import { supabase } from "../Data/db.js";

export async function trackPageVisit(extra = {}) {
  try {
    // 1. Get User Info (if logged in)
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Get IP + Geolocation Data
    let geoData = {};
    try {
      const geoRes = await fetch("https://ipapi.co/json/");
      geoData = await geoRes.json();
    } catch {}

    const ip_address = geoData.ip || null;
    const geo = {
      city: geoData.city,
      region: geoData.region,
      country: geoData.country_name,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      timezone: geoData.timezone
    };

    // 3. Get Device/Browser Data
    const device_info = {
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: {
        width: window.screen.width,
        height: window.screen.height
      }
    };

    // 4. Log Page Info
    const row_data = {
      page: window.location.pathname,
      title: document.title,
      referrer: document.referrer || null,
      ...extra
    };

    // 5. Send to Supabase
    const { error } = await supabase.from("activity_logs").insert([{
      table_name: "page_visit",
      operation: "VIEW",
      row_data,
      ip_address,
      geo,
      device_info,
      user_id: user?.id || null
    }]);
    if (error) console.error("Analytics log failed:", error);
  } catch (err) {
    console.error("Analytics tracking error:", err);
  }
}