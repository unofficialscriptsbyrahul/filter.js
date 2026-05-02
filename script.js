(async function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  console.log("🚀 Script Loaded");

  // =========================
  // 🔹 GET USER ID
  // =========================
  const raw = localStorage.getItem("memberId");

  if (!raw) {
    alert("No user found");
    return;
  }

  let userId;
  try {
    userId = String(JSON.parse(raw).value).trim();
  } catch {
    alert("User data error");
    return;
  }

  console.log("Local ID:", userId);

  // =========================
  // 🔹 FIREBASE CHECK (STABLE)
  // =========================
  async function checkUser(userId) {
    try {
      const url = "https://firestore.googleapis.com/v1/projects/amt-bot-control/databases/(default)/documents/users";

      const res = await fetch(url);
      const data = await res.json();

      console.log("DATA:", data);

      const docs = data.documents || [];
      const local = String(userId).trim();

      for (let doc of docs) {
        const fields = doc.fields || {};

        const firebaseId =
          fields.userId?.stringValue ||
          fields.userId?.integerValue ||
          "";

        const cleanFirebase = String(firebaseId).trim();

        console.log("Compare:", local, cleanFirebase);

        if (cleanFirebase === local) {
          const active = fields.active?.booleanValue;
          return active === true;
        }
      }

      return false;

    } catch (e) {
      console.log("Error:", e);
      return false;
    }
  }

  // =========================
  // 🔹 START FLOW
  // =========================
  checkUser(userId).then(allowed => {
    if (!allowed) {
      alert("Access denied: ID not registered or inactive");
      return;
    }

    console.log("✅ ACCESS GRANTED");
    startBot();
  });

  // =========================
  // 🔥 UI + BOT
  // =========================
  function startBot() {

  console.log("Starting UI...");

  let running = false;
  let observer = null;

  const box = document.createElement("div");

  box.style.position = "fixed";
  box.style.bottom = "20px";
  box.style.right = "20px";
  box.style.width = "240px";
  box.style.background = "rgba(20,20,20,0.95)";
  box.style.color = "#fff";
  box.style.padding = "14px";
  box.style.borderRadius = "16px";
  box.style.zIndex = "999999999";
  box.style.fontFamily = "system-ui, sans-serif";
  box.style.boxShadow = "0 10px 30px rgba(0,0,0,0.6)";

  box.innerHTML = `
    <div style="font-weight:600;margin-bottom:10px;">
      💰 Amount Bot
    </div>

    <input id="amt" placeholder="Enter amount"
      style="
        width:100%;
        padding:8px;
        border-radius:8px;
        border:none;
        margin-bottom:10px;
        background:#1f1f1f;
        color:#fff;
      " />

    <div style="display:flex;gap:8px;">
      <button id="start" style="flex:1;background:#22c55e;border:none;padding:8px;border-radius:8px;color:#fff;">
        Start
      </button>

      <button id="stop" style="flex:1;background:#ef4444;border:none;padding:8px;border-radius:8px;color:#fff;">
        Stop
      </button>
    </div>

    <div id="status" style="margin-top:10px;text-align:center;color:#aaa;">
      ● Stopped
    </div>
  `;

  function injectUI() {
    if (!document.body) return setTimeout(injectUI, 200);

    document.body.appendChild(box);
    console.log("UI injected");
  }

  injectUI();

  const input = box.querySelector("#amt");
  const status = box.querySelector("#status");

  function run() {
    const value = input.value.trim();
    if (!value) return;

    const rows = document.querySelectorAll("[class*=row],[class*=item]");

    rows.forEach(row => {
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
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function stopObserver() {
    if (observer) observer.disconnect();
    observer = null;
  }

  box.querySelector("#start").onclick = () => {
    if (running) return;

    running = true;
    startObserver();
    run();

    status.textContent = "● Active";
    status.style.color = "#22c55e";
  };

  box.querySelector("#stop").onclick = () => {
    running = false;
    stopObserver();

    status.textContent = "● Stopped";
    status.style.color = "#ef4444";
  };
}
    // ================= BOT =================
    function run() {
      const value = input.value.trim();
      if (!value) return;

      const rows = document.querySelectorAll("[class*=row],[class*=item]");

      rows.forEach(row => {
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
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    function stopObserver() {
      if (observer) observer.disconnect();
      observer = null;
    }

    // ================= EVENTS =================
    box.querySelector("#start").onclick = () => {
      if (running) return;

      running = true;
      startObserver();
      run();

      status.textContent = "● Active";
      status.style.color = "#22c55e";
    };

    box.querySelector("#stop").onclick = () => {
      running = false;
      stopObserver();

      status.textContent = "● Stopped";
      status.style.color = "#ef4444";
    };
  }

})();
