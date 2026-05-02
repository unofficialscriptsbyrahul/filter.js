(function () {
  if (window.__BOT__) return;
  window.__BOT__ = true;

  let running = true;
  const targetAmount = prompt("Enter Amount");

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

  async function loop() {
    while (running) {

      clickOtpUpi();

      let targets = findTargets(targetAmount);

      if (targets.length > 0) {
        let success = await clickTargets(targets);
        if (success) return;
        await sleep(100);
      } else {
        await sleep(100);
      }
    }
  }

  loop();
})();
