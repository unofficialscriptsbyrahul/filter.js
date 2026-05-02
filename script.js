(async function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  const log = (msg, color = "#000") =>
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

  log("👤 User ID: " + userId, "blue");

  // =========================
  // 🌐 GITHUB ACCESS CHECK
  // =========================
  const url =
    "https://raw.githubusercontent.com/unofficialscriptsbyrahul/filter.js/main/users.json?v=" +
    Date.now();

  let allowed = false;

  try {
    const res = await fetch(url);
    const data = await res.json();

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

  log("✅ ACCESS GRANTED", "green");

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
      background:#ffffff;
      color:#000;
      padding:15px;
      border-radius:16px;
      z-index:999999999;
      font-family:system-ui;
      box-shadow:0 10px 25px rgba(0,0,0,0.3);
    `;

    ui.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div style="font-weight:600;">💰 Amount Bot</div>
        <div id="indicator" style="width:10px;height:10px;border-radius:50%;background:red;"></div>
      </div>

      <input id="amt-input" placeholder="Enter amount"
        style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;margin-bottom:10px;" />

      <div style="display:flex;gap:8px;">
        <button id="start" style="flex:1;background:#22c55e;border:none;padding:8px;border-radius:8px;color:#fff;">Start</button>
        <button id="stop" style="flex:1;background:#ef4444;border:none;padding:8px;border-radius:8px;color:#fff;">Stop</button>
      </div>

      <div id="status" style="margin-top:10px;text-align:center;color:#555;">
        ● Stopped
      </div>
    `;

    function inject() {
      if (!document.body) return setTimeout(inject, 200);
      document.body.appendChild(ui);
    }

    inject();

    let observer = null;
    let running = false;

    const input = ui.querySelector("#amt-input");
    const status = ui.querySelector("#status");
    const indicator = ui.querySelector("#indicator");

    // =========================
    // 🎯 EXACT FILTER LOGIC
    // =========================
    function run() {
      const value = input.value.trim();
      if (!value) return;

      const rows = document.querySelectorAll("[class*=row],[class*=item]");

      let found = false;

      rows.forEach(row => {
        const match = row.innerText.match(/₹\s?(\d+)/);

        if (!match) {
          row.style.display = "none";
          return;
        }

        const price = match[1];

        if (price === value) {
          row.style.display = "";
          found = true;
        } else {
          row.style.display = "none";
        }
      });

      if (!found) {
        log("❌ No match for ₹" + value, "red");
      } else {
        log("✅ Showing ₹" + value, "green");
      }
    }

    function startObserver() {
      if (observer) return;

      observer = new MutationObserver(run);
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
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
      status.style.color = "green";
      indicator.style.background = "green";
    };

    ui.querySelector("#stop").onclick = () => {
      running = false;
      stopObserver();

      status.textContent = "● Stopped";
      status.style.color = "red";
      indicator.style.background = "red";
    };
  }

  createUI();
})();
