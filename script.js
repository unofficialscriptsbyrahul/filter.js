(async function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  let running = false;

  const fahhh = new Audio("https://www.myinstants.com/media/sounds/fahh.mp3");
  const aayeinn = new Audio("https://www.myinstants.com/media/sounds/aayein.mp3");

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function text(el) {
    return (el.innerText || "").toLowerCase().trim();
  }

  function onPaymentPage() {
    return text(document.body).includes("select method payment");
  }

  function clickOTPUPI() {
    const el = [...document.querySelectorAll(".tab-title")]
      .find(e => text(e) === "otp-upi");
    if (el) el.click();
  }

  function findMatches(value) {
    const regex = new RegExp(`₹\\s*${value}(?!\\d)`);
    return [...document.querySelectorAll(".amount")]
      .filter(el => regex.test(el.innerText));
  }

  function getBuyButton(amountEl) {
    let container = amountEl.closest(".x-row")?.parentElement;
    return container?.querySelector("button.van-button");
  }

  function highlight(matches) {
    document.querySelectorAll(".amount").forEach(el => {
      el.style.outline = "";
      el.style.background = "";
    });

    matches.slice(0,3).forEach(el => {
      el.style.outline = "2px solid #22c55e";
      el.style.background = "rgba(34,197,94,0.15)";
    });
  }

  function clickMobikwikInstant() {
    const el = [...document.querySelectorAll("div,button,span")]
      .find(e => text(e).includes("mobikwik"));

    if (el) {
      el.click();
      return true;
    }
    return false;
  }

  async function mainLoop(value, indicator) {
    while (running) {

      // Step 1: Always click OTP-UPI
      clickOTPUPI();

      // Step 2: Instant scan
      const matches = findMatches(value);
      highlight(matches);

      if (matches.length === 0) {
        await sleep(100); // Step 6
        continue;
      }

      let success = false;

      for (let amt of matches.slice(0,3)) {

        const btn = getBuyButton(amt);
        if (!btn) continue;

        btn.click();

        // Step 4: micro detection loop (no fixed delay)
        for (let i = 0; i < 10; i++) {

          if (onPaymentPage()) {

            fahhh.play();

            // Step 8: instant Mobikwik attempt
            clickMobikwikInstant();

            aayeinn.play();

            running = false;
            indicator.style.background = "red";
            return;
          }

          await sleep(20);
        }
      }

      // Step 7: no payment → wait then restart
      await sleep(100);
    }
  }

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
