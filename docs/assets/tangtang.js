// "糖糖"页面：先打出开场白，再在随机位置弹出温柔话；点击屏幕会冒小爱心并多弹一句。
(function () {
  "use strict";
  const stage = document.getElementById("tt-stage");
  if (!stage) return;

  // 开场白：必须第一个出现
  const GREETING = "敏敏，你好呀，欢迎来到我的世界";

  // 温柔话：参考网上常见的情话整理改写
  const WORDS = [
    "你是我的星空，点亮了我的整个世界",
    "你笑起来的时候，全世界都变温柔了",
    "和你在一起的感觉，就像回到了家",
    "你是我每一天最甜的念头",
    "你是我阴天里的阳光",
    "我不需要星空，你的眼睛就是我的银河",
    "你让我相信，一见钟情是真的",
    "今天也要记得好好吃饭呀",
    "累了就靠一靠，我一直都在",
    "我的温柔，全都指向你",
    "想和你一起，把平凡的日子过成诗",
    "遇见你，是我这辈子最幸运的事",
    "风是甜的，因为想起了你",
    "你一出现，我的坏心情就下班了",
    "世界很大，我只想陪在你身边",
    "晚安之前，最后想的人是你",
    "你是我藏在心里的糖",
    "想把所有的偏爱都给你",
    "春风十里，不如你",
    "以后的路，想和你一起慢慢走",
    "你不用很懂事，在我这里可以做小朋友",
    "有你在，每一天都值得期待",
    "我想做你的专属开心果",
    "所有的晚风，都替我说了想你",
  ];

  const greetEl = document.getElementById("tt-greet");
  const hintEl = document.getElementById("tt-hint");
  const bubbles = document.getElementById("tt-bubbles");
  const hearts = document.getElementById("tt-hearts");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MAX_BUBBLES = window.innerWidth < 600 ? 3 : 5;

  // 洗牌后轮流取，一轮里不重复
  let pool = [];
  function nextWord() {
    if (!pool.length) pool = WORDS.slice().sort(() => Math.random() - 0.5);
    return pool.pop();
  }

  // 在随机位置弹出一句，避开中间的开场白区域
  function popBubble(x, y) {
    const live = bubbles.querySelectorAll(".tt-bubble:not(.tt-out)");
    if (live.length >= MAX_BUBBLES) dismiss(live[0]);

    const el = document.createElement("div");
    el.className = "tt-bubble";
    el.textContent = nextWord();
    if (x === undefined) {
      x = 12 + Math.random() * 76;
      do { y = 10 + Math.random() * 80; } while (y > 38 && y < 62);
    }
    el.style.left = x + "%";
    el.style.top = y + "%";
    bubbles.appendChild(el);
    setTimeout(() => dismiss(el), 6500 + Math.random() * 2000);
  }
  function dismiss(el) {
    if (!el || el.classList.contains("tt-out")) return;
    el.classList.add("tt-out");
    setTimeout(() => el.remove(), 650);
  }

  // 背景里慢慢飘落的爱心
  function dropHeart() {
    const h = document.createElement("span");
    h.className = "tt-heart";
    h.textContent = Math.random() < 0.5 ? "♥" : "❤";
    h.style.left = Math.random() * 100 + "%";
    h.style.fontSize = 0.8 + Math.random() * 1.4 + "rem";
    h.style.animationDuration = 6 + Math.random() * 6 + "s";
    hearts.appendChild(h);
    setTimeout(() => h.remove(), 12500);
  }

  // 点击：在点击处炸开几颗小爱心，并在点击位置弹一句
  stage.addEventListener("click", (e) => {
    const rect = stage.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    for (let i = 0; i < 6; i++) {
      const b = document.createElement("span");
      b.className = "tt-burst";
      b.textContent = "♥";
      b.style.left = px + "px";
      b.style.top = py + "px";
      const ang = Math.random() * Math.PI * 2, dist = 30 + Math.random() * 40;
      b.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      b.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      stage.appendChild(b);
      setTimeout(() => b.remove(), 950);
    }
    popBubble(Math.min(85, Math.max(15, (px / rect.width) * 100)), Math.min(88, Math.max(12, (py / rect.height) * 100)));
  });

  // 开场白打字机，打完才开始弹温柔话
  function startLoops() {
    hintEl.classList.add("tt-show");
    if (reduceMotion) { popBubble(); popBubble(); return; }
    popBubble();
    setInterval(popBubble, 2200);
    setInterval(dropHeart, 450);
  }
  if (reduceMotion) {
    greetEl.textContent = GREETING;
    greetEl.classList.add("tt-done");
    startLoops();
  } else {
    let i = 0;
    const type = () => {
      greetEl.textContent = GREETING.slice(0, ++i);
      if (i < GREETING.length) setTimeout(type, 140);
      else { greetEl.classList.add("tt-done"); setTimeout(startLoops, 600); }
    };
    setTimeout(type, 400);
  }
})();
