(function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  let running = false;

  // ===== UI =====
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

  // ===== SOUND =====
  const fahhh = new Audio("https://www.myinstants.com/media/sounds/fahh.mp3");
  const aayeinn = new Audio("https://www.myinstants.com/media/sounds/aayein.mp3");

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function isPaymentPage() {
    return document.body.innerText.includes("Select Method Payment");
  }

  function clickOtpUpi() {
    document.querySelectorAll(".tab-title").forEach(t => {
      if (t.innerText.includes("OTP-UPI")) t.click();
    });
  }

  function findTargets(value) {
    return Array.from(document.querySelectorAll(".amount"))
      .filter(el => el.innerText.replace(/\s+/g,'') === `₹${value}`);
  }

  function findBuy(startEl) {
    let cur = startEl;
    while (cur && cur !== document.body) {
      let btn = cur.querySelector("button");
      if (btn && btn.innerText.toLowerCase().includes("buy")) return btn;
      cur = cur.parentElement;
    }
    return null;
  }

  // ✅ FINAL FIXED MOBIKWIK CLICK
  function clickMobikwik() {
    const all = document.querySelectorAll(".bgmobikwik");

    if (all.length > 0) {
      all[0].click(); // click first Mobikwik option
      return true;
    }

    return false;
  }

  async function handleSuccess() {
    fahhh.play();

    let clicked = false;

    for (let i = 0; i < 15; i++) {
      if (clickMobikwik()) {
        clicked = true;
        break;
      }
      await sleep(120);
    }

    if (clicked) {
      aayeinn.play();
    }

    running = false;
    dot.style.background = "red";
  }

  async function clickTargets(targets) {
    for (let t of targets.slice(0, 3)) {

      let buy = findBuy(t);
      if (!buy) continue;

      buy.click();

      for (let i = 0; i < 10; i++) {
        if (isPaymentPage()) {
          await handleSuccess();
          return true;
        }
        await sleep(20);
      }
    }
    return false;
  }

  async function loop(value) {
    while (running) {

      clickOtpUpi();

      let targets = findTargets(value);

      if (targets.length > 0) {
        let success = await clickTargets(targets);
        if (success) return;

        await sleep(80);
      } else {
        await sleep(80);
      }
    }
  }

  function start() {
    if (running) return;
    if (!input.value.trim()) return alert("Enter amount");

    running = true;
    dot.style.background = "green";

    loop(input.value.trim());
  }

  function stop() {
    running = false;
    dot.style.background = "red";
  }

  ui.querySelector("#start").onclick = start;
  ui.querySelector("#stop").onclick = stop;
})();
