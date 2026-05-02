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
  let running = false;
  let observer = null;

  const box = document.createElement("div");
  box.style = `
    position:fixed; bottom:20px; right:20px;
    width:220px; background:#111; color:#fff;
    padding:12px; border-radius:12px;
    z-index:99999; font-family:sans-serif;
  `;

  box.innerHTML = `
    <div style="font-weight:bold;margin-bottom:8px;">Amount Bot</div>
    <input id="amt" placeholder="Enter amount" style="width:100%;padding:6px;margin-bottom:8px;" />
    <div style="display:flex;gap:6px;">
      <button id="start">Start</button>
      <button id="stop">Stop</button>
    </div>
    <div id="status" style="margin-top:6px;color:red;">Stopped</div>
  `;

  document.body.appendChild(box);

  const input = box.querySelector("#amt");
  const status = box.querySelector("#status");

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
