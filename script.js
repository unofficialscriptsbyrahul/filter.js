(async function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  console.log("🚀 Script Loaded");

  // =========================
  // 🔑 GET USER ID
  // =========================
  const raw = localStorage.getItem("memberId");

  if (!raw) {
    alert("❌ No user found");
    return;
  }

  let userId;
  try {
    userId = String(JSON.parse(raw).value).trim();
  } catch {
    alert("❌ User data error");
    return;
  }

  console.log("👤 Local ID:", userId);

  // =========================
  // 🌐 FETCH USERS FROM GITHUB
  // =========================
  const url = "https://raw.githubusercontent.com/unofficialscriptsbyrahul/filter.js/main/users.json?v=" + Date.now();

  let allowed = false;

  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log("📦 GitHub Users:", data.users);

    allowed = data.users.some(u => String(u).trim() === userId);
  } catch (e) {
    alert("❌ Failed to load users");
    console.log(e);
    return;
  }

  if (!allowed) {
    alert("❌ Access Denied");
    return;
  }

  console.log("✅ ACCESS GRANTED");

  // =========================
  // 🎛️ UI PANEL
  // =========================
  const box = document.createElement("div");

  box.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 220px;
    background: rgba(20,20,20,0.95);
    color: #fff;
    padding: 12px;
    border-radius: 14px;
    z-index: 999999;
    font-family: sans-serif;
    box-shadow: 0 0 12px rgba(0,0,0,0.5);
  `;

  box.innerHTML = `
    <div style="font-size:14px;margin-bottom:10px;">
      ⚡ Filter Panel
    </div>

    <input id="amtInput" placeholder="Enter ₹ amount"
      style="width:100%;padding:6px;border:none;border-radius:6px;margin-bottom:8px;" />

    <button id="applyBtn"
      style="width:100%;padding:8px;background:#00c853;color:#fff;border:none;border-radius:8px;">
      Apply Filter
    </button>
  `;

  document.body.appendChild(box);

  // =========================
  // 🔍 FILTER FUNCTION
  // =========================
  document.getElementById("applyBtn").onclick = () => {
    const target = document.getElementById("amtInput").value.trim();

    if (!target) return;

    const rows = document.querySelectorAll("[class*=row], [class*=item]");

    let found = false;

    rows.forEach(row => {
      const match = row.innerText.match(/₹\s?\d+/);

      if (!match) {
        row.style.display = "none";
        return;
      }

      const price = match[0].replace(/\s/g, "");

      if (price === `₹${target}`) {
        row.style.display = "";
        found = true;
      } else {
        row.style.display = "none";
      }
    });

    if (!found) {
      console.log("❌ No matching result");
    } else {
      console.log("✅ Filter applied");
    }
  };

})();
