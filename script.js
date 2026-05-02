(async function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  const log = (msg, color = "#00c853") =>
    console.log(`%c${msg}`, `color:${color};font-weight:bold;`);

  log("🚀 Script Loaded");

  // =========================
  // 🔑 GET USER ID
  // =========================
  const raw = localStorage.getItem("memberId");

  if (!raw) {
    log("❌ No user found", "red");
    return;
  }

  let userId;
  try {
    userId = String(JSON.parse(raw).value).trim();
  } catch {
    log("❌ User parse error", "red");
    return;
  }

  log("👤 User ID: " + userId, "#03a9f4");

  // =========================
  // 🌐 GITHUB ACCESS CHECK
  // =========================
  log("🌐 Fetching users...", "orange");

  const url =
    "https://raw.githubusercontent.com/unofficialscriptsbyrahul/filter.js/main/users.json?v=" +
    Date.now();

  let allowed = false;

  try {
    const res = await fetch(url);
    const data = await res.json();

    log("📦 Users Loaded", "#03a9f4");

    allowed = data.users.some(
      (u) => String(u).trim() === userId
    );
  } catch (e) {
    log("❌ Failed to fetch users", "red");
    return;
  }

  if (!allowed) {
    log("❌ ACCESS DENIED", "red");
    return;
  }

  log("✅ ACCESS GRANTED");

  // =========================
  // 🎛️ UI PANEL
  // =========================
  function createUI() {
    if (document.getElementById("amt-ui")) return;

    const ui = document.createElement("div");
    ui.id = "amt-ui";

    ui.style = `
      position:fixed;
      bottom:20px;
      right:20px;
      width:250px;
      background:rgba(15,15,15,0.95);
      color:#fff;
      padding:15px;
      border-radius:16px;
      z-index:999999999;
      font-family:system-ui;
      box-shadow:0 10px 25px rgba(0,0,0,0.6);
    `;

    ui.innerHTML = `
      <div style="font-weight:600;margin-bottom:10px;">💰 Amount Bot</div>

      <input id="amt-input" placeholder="Enter amount"
        style="width:100%;padding:8px;border:none;border-radius:8px;margin-bottom:10px;background:#1e1e1e;color:#fff;" />

      <div style="display:flex;gap:8px;">
        <button id="start" style="flex:1;background:#22c55e;border:none;padding:8px;border-radius:8px;color:#fff;">Start</button>
        <button id="stop" style="flex:1;background:#ef4444;border:none;padding:8px;border-radius:8px;color:#fff;">Stop</button>
      </div>

      <div id="status" style="margin-top:10px;text-align:center;color:#aaa;">
        ● Stopped
      </div>
    `;

    function inject() {
      if (!document.body) return setTimeout(inject, 200);
      document.body.appendChild(ui);
      log("✅ UI injected");
    }

    inject();

    let observer = null;
    let running = false;

    const input = ui.querySelector("#amt-input");
    const status = ui.querySelector("#status");

    function run() {
      const value = input.value.trim();
      if (!value) return;

      const rows = document.querySelectorAll("[class*=row],[class*=item]");

      rows.forEach((row) => {
        const text = row.innerText;

        const match =
          text.includes("₹" + value) &&
          !text.includes("₹" + value + "0");

        row.style.display = match ? "" : "none";

        if (match) {
          const btn = row.querySelector("button");
          if (btn) btn.click();
        }
      });
    }

    function startObserver() {
      if (observer) return;
      observer = new MutationObserver(run);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    function stopObserver() {
      if (observer) observer.disconnect();
      observer = null;
    }

    ui.querySelector("#start").onclick = () => {
      if (running) return;
      running = true;
      startObserver();
      run();
      status.textContent = "● Active";
      status.style.color = "#22c55e";
    };

    ui.querySelector("#stop").onclick = () => {
      running = false;
      stopObserver();
      status.textContent = "● Stopped";
      status.style.color = "#ef4444";
    };
  }

  createUI();
})();
