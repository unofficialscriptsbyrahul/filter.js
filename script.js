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
      const fields = doc.fields;

      const firebaseId =
        fields.userId.stringValue ||
        fields.userId.integerValue;

      console.log("Compare:", local, firebaseId);

      if (String(firebaseId) === local) {
        return fields.active.booleanValue === true;
      }
    }

    return false;

  } catch (e) {
    console.log("Error:", e);
    return false;
  }
}
  const allowed = await checkUser(userId);

  if (!allowed) {
    alert("Access denied");
    return;
  }

  console.log("✅ ACCESS GRANTED");

  // =========================
  // 🔥 UI PANEL
  // =========================
 function startBot() {

  let running = false;
  let observer = null;

  // ================= UI =================
  const box = document.createElement("div");
  box.style = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:240px;
    backdrop-filter: blur(14px);
    background: rgba(20,20,20,0.85);
    color:#fff;
    padding:14px;
    border-radius:16px;
    z-index:99999;
    font-family: system-ui, sans-serif;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  `;

  box.innerHTML = `
    <div style="font-size:15px;font-weight:600;margin-bottom:10px;">
      💰 Amount Bot
    </div>

    <input id="amt" placeholder="Enter amount"
      style="
        width:100%;
        padding:8px;
        border-radius:8px;
        border:none;
        outline:none;
        margin-bottom:10px;
        background:#1f1f1f;
        color:#fff;
      " />

    <div style="display:flex;gap:8px;">
      <button id="start"
        style="
          flex:1;
          padding:8px;
          border:none;
          border-radius:8px;
          background:#22c55e;
          color:#fff;
          font-weight:600;
        ">
        Start
      </button>

      <button id="stop"
        style="
          flex:1;
          padding:8px;
          border:none;
          border-radius:8px;
          background:#ef4444;
          color:#fff;
          font-weight:600;
        ">
        Stop
      </button>
    </div>

    <div id="status"
      style="
        margin-top:10px;
        font-size:13px;
        color:#aaa;
        text-align:center;
      ">
      ● Stopped
    </div>
  `;

  document.body.appendChild(box);

  const input = box.querySelector("#amt");
  const status = box.querySelector("#status");

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
  // =========================
  // 🔥 BOT LOGIC
  // =========================
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

    status.textContent = "Active";
    status.style.color = "#22c55e";
  };

  box.querySelector("#stop").onclick = () => {
    running = false;
    stopObserver();

    status.textContent = "Stopped";
    status.style.color = "red";
  };

})();
