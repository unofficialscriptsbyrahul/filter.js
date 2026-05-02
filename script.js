(async function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  let running = false;

  const fahhh = new Audio("https://www.myinstants.com/media/sounds/fahh.mp3");
  const aayeinn = new Audio("https://www.myinstants.com/media/sounds/aayein.mp3");

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // ---------- DEBUG ----------
  function log(msg) {
    console.log("BOT:", msg);
    const el = document.getElementById("bot-log");
    if (el) el.innerText = msg;
  }

  function text(el) {
    return (el.innerText || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function onPaymentPage() {
    return text(document.body).includes("select method payment");
  }

  // ---------- OTP CLICK ----------
  function clickOTPUPI() {
    const el = [...document.querySelectorAll("*")]
      .find(e => text(e).includes("otp-upi") || text(e) === "otp upi");

    if (el) {
      el.click();
      log("OTP-UPI clicked");
      return true;
    } else {
      log("OTP-UPI NOT FOUND");
      return false;
    }
  }

  // ---------- FIND AMOUNTS ----------
  function findMatches(value) {
    const all = [...document.querySelectorAll("*")].filter(e =>
      text(e).includes("₹")
    );

    const matches = all.filter(e => {
      const t = text(e).replace(/\s/g,"");
      return t.includes(`₹${value}`);
    });

    log("Matches: " + matches.length);
    return matches;
  }

  // ---------- FIND BUY BUTTON ----------
  function getBuyButton(el) {
    let node = el;

    while (node && node !== document.body) {
      const btn = [...node.querySelectorAll("button")]
        .find(b => text(b).includes("buy"));

      if (btn) return btn;

      node = node.parentElement;
    }

    return null;
  }

  function highlight(matches) {
    document.querySelectorAll("*").forEach(el => {
      el.style.outline = "";
    });

    matches.slice(0,3).forEach(el => {
      el.style.outline = "2px solid lime";
    });
  }

  function clickMobikwikInstant() {
    const el = [...document.querySelectorAll("*")]
      .find(e => text(e).includes("mobikwik"));

    if (el) {
      el.click();
      log("Mobikwik clicked");
      return true;
    } else {
      log("Mobikwik NOT FOUND");
      return false;
    }
  }

  async function mainLoop(value, indicator) {
    while (running) {

      clickOTPUPI();

      const matches = findMatches(value);
      highlight(matches);

      if (matches.length === 0) {
        await sleep(100);
        continue;
      }

      for (let el of matches.slice(0,3)) {

        const btn = getBuyButton(el);
        if (!btn) {
          log("Buy not found");
          continue;
        }

        btn.click();
        log("Clicked BUY");

        for (let i = 0; i < 10; i++) {

          if (onPaymentPage()) {

            log("Payment page detected");

            fahhh.play();

            clickMobikwikInstant();

            aayeinn.play();

            running = false;
            indicator.style.background = "red";
            return;
          }

          await sleep(20);
        }
      }

      await sleep(100);
    }
  }

  // ---------- UI ----------
  function createUI() {
    const ui = document.createElement("div");

    ui.style = `
      position:fixed;
      bottom:20px;
      right:20px;
      width:260px;
      background:#111;
      color:#0f0;
      padding:12px;
      border-radius:12px;
      z-index:999999999;
      font-family:monospace;
    `;

    ui.innerHTML = `
      <div style="display:flex;justify-content:space-between;">
        <div>BOT</div>
        <div id="dot" style="width:10px;height:10px;border-radius:50%;background:red;"></div>
      </div>

      <input id="amt" placeholder="Amount"
        style="width:100%;margin-top:8px;padding:6px;" />

      <button id="start" style="margin-top:8px;width:100%;">Start</button>
      <button id="stop" style="margin-top:4px;width:100%;">Stop</button>

      <div id="bot-log" style="margin-top:6px;font-size:11px;">Idle</div>
    `;

    document.body.appendChild(ui);

    const input = ui.querySelector("#amt");
    const dot = ui.querySelector("#dot");

    ui.querySelector("#start").onclick = () => {
      if (!input.value.trim()) return alert("Enter amount");

      running = true;
      dot.style.background = "lime";
      log("Started");

      mainLoop(input.value.trim(), dot);
    };

    ui.querySelector("#stop").onclick = () => {
      running = false;
      dot.style.background = "red";
      log("Stopped");
    };
  }

  createUI();
})();
