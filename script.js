(async function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  let running = false;

  const taco = new Audio("https://www.myinstants.com/media/sounds/taco-bell-bong.mp3");
  const cricket = new Audio("https://www.myinstants.com/media/sounds/cricket-sound.mp3");

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function clickDefault() {
    document.querySelectorAll("button").forEach(b => {
      if (b.innerText.toLowerCase().includes("default")) b.click();
    });
  }

  function onPaymentPage() {
    return document.body.innerText.toLowerCase().includes("select method payment");
  }

  function clickMobikwik() {
    document.querySelectorAll("button").forEach(b => {
      if (b.innerText.toLowerCase().includes("mobikwik")) b.click();
    });
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

  async function mainLoop(value, indicator) {
    while (running) {

      let matches = findMatches(value);

      // highlight top 3
      matches.slice(0,3).forEach(r=>{
        r.style.outline="2px solid green";
        r.style.background="rgba(0,255,0,0.1)";
      });

      if (matches.length > 0) {

        for (let row of matches.slice(0,3)) {

          const btn = row.querySelector("button");
          if (!btn) continue;

          btn.click();
          await sleep(400);

          if (onPaymentPage()) {
            taco.play();

            await sleep(500);

            clickMobikwik();

            cricket.play();

            stop(indicator);
            return;
          }
        }

        // clicked but failed → retry
        clickDefault();
        await sleep(200);

      } else {
        // no match → reset & retry
        clickDefault();
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
      running = true;
      dot.style.background = "green";

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
