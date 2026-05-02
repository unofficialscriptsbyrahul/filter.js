(async function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  let running = false;

  const fahhh = new Audio("https://www.myinstants.com/media/sounds/fahh.mp3");
  const aayeinn = new Audio("https://www.myinstants.com/media/sounds/aayein.mp3");

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ---------- HELPERS ----------

  function text(el) {
    return (el.innerText || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function onPaymentPage() {
    return text(document.body).includes("select method payment");
  }

  function clickByText(keyword) {
    keyword = keyword.toLowerCase();

    const el = [...document.querySelectorAll("button, div, span")]
      .find(e => text(e).includes(keyword));

    if (el) {
      el.click();
      return true;
    }
    return false;
  }

  function clickOTPUPI() {
    return clickByText("otp-upi");
  }

  function clickLarge() {
    return clickByText("large");
  }

  function findMatches(value) {
    const regex = new RegExp(`₹\\s*${value}(?!\\d)`);
    return [...document.querySelectorAll("[class*=row],[class*=item]")]
      .filter(row => regex.test(row.innerText));
  }

  function findBuyButton(row) {
    let cur = row;

    while (cur && cur !== document.body) {
      const btn = [...cur.querySelectorAll("button, span, div")]
        .find(e => text(e).includes("buy"));
      if (btn) return btn;
      cur = cur.parentElement;
    }
    return null;
  }

  function highlight(matches) {
    document.querySelectorAll("[class*=row],[class*=item]").forEach(r=>{
      r.style.outline = "";
      r.style.background = "";
    });

    matches.slice(0,3).forEach(r=>{
      r.style.outline="2px solid #22c55e";
      r.style.background="rgba(34,197,94,0.15)";
    });
  }

  async function clickMobikwik() {
    for (let i = 0; i < 8; i++) {
      if (clickByText("mobikwik")) {
        aayeinn.play();
        return true;
      }
      await sleep(100);
    }
    return false;
  }

  // ---------- MAIN LOOP ----------

  async function mainLoop(value, indicator) {
    while (running) {

      // STEP 1: set correct state
      clickOTPUPI();
      clickLarge();

      await sleep(120); // allow UI refresh

      // STEP 2: scan
      const matches = findMatches(value);
      highlight(matches);

      if (matches.length === 0) {
        await sleep(120);
        continue;
      }

      // STEP 3: act
      for (let row of matches.slice(0,3)) {

        const btn = findBuyButton(row);
        if (!btn) continue;

        btn.click();
        await sleep(120);

        if (onPaymentPage()) {
          fahhh.play();

          await sleep(150);

          await clickMobikwik();

          running = false;
          indicator.style.background = "red";
          return;
        }
      }

      // retry loop
      await sleep(120);
    }
  }

  // ---------- UI ----------

  function createUI() {
    const ui = document.createElement("div");

    ui.style = `
      position:fixed;
      bottom:20px;
      right:20px;
      width:240px;
      background:rgba(255,255,255,0.6);
      backdrop-filter:blur(10px);
      color:#000;
      padding:14px;
      border-radius:14px;
      z-index:999999999;
      font-family:sans-serif;
    `;

    ui.innerHTML = `
      <div style="display:flex;justify-content:space-between;">
        <div>💰 Bot</div>
        <div id="dot" style="width:10px;height:10px;border-radius:50%;background:red;"></div>
      </div>

      <input id="amt" placeholder="Amount"
        style="width:100%;margin-top:10px;padding:8px;border-radius:8px;border:1px solid #ccc;" />

      <button id="start" style="margin-top:10px;width:100%;padding:8px;background:#22c55e;color:#fff;border:none;border-radius:8px;">Start</button>
      <button id="stop" style="margin-top:6px;width:100%;padding:8px;background:#ef4444;color:#fff;border:none;border-radius:8px;">Stop</button>
    `;

    document.body.appendChild(ui);

    const input = ui.querySelector("#amt");
    const dot = ui.querySelector("#dot");

    function start() {
      if (running) return;
      if (!input.value.trim()) return alert("Enter amount");

      running = true;
      dot.style.background = "green";

      mainLoop(input.value.trim(), dot);
    }

    function stop() {
      running = false;
      dot.style.background = "red";
    }

    ui.querySelector("#start").onclick = start;
    ui.querySelector("#stop").onclick = stop;
  }

  createUI();
})();
