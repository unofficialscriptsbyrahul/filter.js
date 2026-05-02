(function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  let running = false;

  // ===== UI =====
  const box = document.createElement("div");
  box.style = `
    position:fixed; bottom:20px; right:20px; width:220px;
    background:#111; color:#fff; padding:12px;
    border-radius:12px; z-index:999999;
    font-family:sans-serif;
  `;

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
      <b>Auto Buy</b>
      <span id="light" style="width:10px;height:10px;border-radius:50%;background:red;"></span>
    </div>

    <input id="amt" placeholder="Amount"
      style="width:100%;padding:6px;margin-bottom:6px;border-radius:6px;" />

    <button id="start" style="width:100%;padding:6px;background:green;color:#fff;border:none;border-radius:6px;margin-bottom:6px;">Start</button>
    <button id="stop" style="width:100%;padding:6px;background:red;color:#fff;border:none;border-radius:6px;">Stop</button>

    <div id="status" style="margin-top:6px;font-size:12px;">Idle</div>
  `;

  document.body.appendChild(box);

  const status = document.getElementById("status");
  const light = document.getElementById("light");
  const input = document.getElementById("amt");

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

  function clickMobikwik() {
    const el = document.querySelector(".bgmobikwik") ||
      [...document.querySelectorAll("*")]
        .find(e => (e.innerText || "").toLowerCase().includes("mobikwik"));

    if (el) {
      el.click();
      return true;
    }
    return false;
  }

  async function handleSuccess() {
    fahhh.play();
    clickMobikwik();
    aayeinn.play();

    running = false;
    status.innerText = "Done";
    light.style.background = "red";
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

        await sleep(100);
      } else {
        await sleep(100);
      }
    }
  }

  // ===== CONTROLS =====
  document.getElementById("start").onclick = () => {
    if (!input.value.trim()) return alert("Enter amount");

    running = true;
    status.innerText = "Running";
    light.style.background = "lime";

    loop(input.value.trim());
  };

  document.getElementById("stop").onclick = () => {
    running = false;
    status.innerText = "Stopped";
    light.style.background = "red";
  };

})();
