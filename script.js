(async function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  let running = false;

  // ✅ Sounds (direct links)
  const successSound = new Audio("https://www.myinstants.com/media/sounds/yoooooooooooo-60048.mp3");
  const finalSound = new Audio("https://www.myinstants.com/media/sounds/maa-tari-oo-bhai-7312.mp3");

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // 🔊 Safe play (avoids silent failure)
  async function safePlay(audio) {
    try {
      audio.currentTime = 0;
      await audio.play();
    } catch (e) {
      console.log("Sound blocked:", e);
    }
  }

  function clickOTPUPI() {
    document.querySelectorAll("button, div, span").forEach(el => {
      if ((el.innerText || "").toLowerCase().includes("otp-upi")) {
        el.click();
      }
    });
  }

  // 🔥 Strong Mobikwik click
  function clickMobikwik() {
    let found = false;

    const elements = document.querySelectorAll("button, div, span, li");

    elements.forEach(el => {
      const text = (el.innerText || "").toLowerCase();
      const html = (el.outerHTML || "").toLowerCase();

      if (
        text.includes("mobikwik") ||
        html.includes("mobikwik") ||
        (el.className || "").toLowerCase().includes("mobikwik")
      ) {
        el.click();
        found = true;
      }
    });

    return found;
  }

  function onPaymentPage() {
    return document.body.innerText.toLowerCase().includes("select method payment");
  }

  function findMatches(value) {
    const rows = [...document.querySelectorAll("[class*=row],[class*=item]")];
    let matches = [];

    rows.forEach(row => {
      const text = row.innerText.replace(/\s/g,"").replace(/,/g,"");
      const prices = text.match(/₹(\d+)/g);

      if (!prices) return;

      if (prices.some(p => p === "₹" + value)) {
        matches.push(row);
      }
    });

    return matches;
  }

  function highlight(matches) {
    document.querySelectorAll("[class*=row],[class*=item]").forEach(r=>{
      r.style.outline = "";
      r.style.background = "";
    });

    matches.slice(0,3).forEach(r=>{
      r.style.outline="2px solid green";
      r.style.background="rgba(0,255,0,0.1)";
    });
  }

  async function mainLoop(value, indicator) {
    while (running) {

      // reset to OTP-UPI
      clickOTPUPI();
      await sleep(100);

      let matches = findMatches(value);
      highlight(matches);

      if (matches.length > 0) {

        for (let row of matches.slice(0,3)) {

          const btn = row.querySelector("button");
          if (!btn) continue;

          btn.click();
          await sleep(200);

          if (onPaymentPage()) {

            await safePlay(successSound);

            await sleep(200);

            clickMobikwik();

            await sleep(200);

            await safePlay(finalSound);

            stop(indicator);
            return;
          }
        }

        await sleep(200);

      } else {
        await sleep(200);
      }
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

      // 🔓 unlock audio on user interaction
      successSound.play().then(() => {
        successSound.pause();
        successSound.currentTime = 0;
      }).catch(()=>{});

      finalSound.play().then(() => {
        finalSound.pause();
        finalSound.currentTime = 0;
      }).catch(()=>{});

      mainLoop(input.value.trim(), dot);
    }

    function stop(indicator) {
      running = false;
      indicator.style.background = "red";
    }

    ui.querySelector("#start").onclick = start;
    ui.querySelector("#stop").onclick = () => stop(dot);
  }

  createUI();
})();
