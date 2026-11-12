// 首页首屏动画：数据节点粒子网络 + 打字机标语。原生 JS，不依赖任何库。
(function () {
  "use strict";

  // ---------- 打字机：轮流打出几句话 ----------
  const lines = [
    "ODS → DWD → DWS → ADS，再往前一步：让业务直接用自然语言取数",
    "字段走向量检索，取值走 ES 精确匹配",
    "EXPLAIN 校验 → 大模型纠错 → 再校验，最多 3 次",
    "确定的流程用 Workflow，开放的问题交给 Agent",
  ];
  const typedEl = document.getElementById("dz-typed");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typedEl) {
    if (reduceMotion) {
      typedEl.textContent = lines[0];
    } else {
      let li = 0, ci = 0, deleting = false;
      const tick = () => {
        const text = lines[li];
        ci += deleting ? -1 : 1;
        typedEl.textContent = text.slice(0, ci);
        let delay = deleting ? 25 : 70;
        if (!deleting && ci === text.length) { deleting = true; delay = 2200; }
        else if (deleting && ci === 0) { deleting = false; li = (li + 1) % lines.length; delay = 400; }
        setTimeout(tick, delay);
      };
      tick();
    }
  }

  // ---------- 粒子网络 ----------
  const canvas = document.getElementById("dz-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // 带标签的"核心节点"：数仓分层 + 大模型技术，比普通粒子大、会发光
  const LABELS = ["ODS", "DWD", "DWS", "ADS", "RAG", "Agent", "LangGraph", "Qdrant", "ES", "SQL"];
  const LINK_DIST = 130;          // 两点距离小于它就连线
  const MOUSE_DIST = 180;         // 鼠标附近的点会被轻微吸引并连线

  let w = 0, h = 0, dpr = 1, nodes = [], pulses = [];
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);   // 高清屏不糊，但最多 2 倍，省性能
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    init();
  }

  function init() {
    // 粒子数量跟屏幕面积走：手机少一些，大屏多一些
    const count = Math.max(40, Math.min(130, Math.floor((w * h) / 11000)));
    nodes = [];
    for (let i = 0; i < count; i++) {
      const label = i < LABELS.length ? LABELS[i] : null;
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: label ? 3.2 : Math.random() * 1.6 + 0.8,
        label,
        hue: Math.random() < 0.5 ? 199 : 245,           // 青色或靛蓝色
      });
    }
    pulses = [];
  }

  // 沿连线流动的"数据包"，象征数据在层与层之间流转
  function spawnPulse(a, b) {
    if (pulses.length < 40 && Math.random() < 0.004) pulses.push({ a, b, t: 0 });
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      // 鼠标吸引
      const dx = mouse.x - n.x, dy = mouse.y - n.y;
      const md = Math.hypot(dx, dy);
      if (md < MOUSE_DIST) { n.vx += dx / md * 0.012; n.vy += dy / md * 0.012; }
      // 限速，防止越吸越快
      const sp = Math.hypot(n.vx, n.vy);
      if (sp > 0.9) { n.vx *= 0.9 / sp; n.vy *= 0.9 / sp; }
      n.x += n.vx; n.y += n.vy;
      // 碰到边缘反弹
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }

    // 连线：越近越亮
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.45;
          ctx.strokeStyle = `hsla(${a.hue}, 90%, 70%, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          spawnPulse(a, b);
        }
      }
      // 和鼠标连线
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < MOUSE_DIST) {
        ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - md / MOUSE_DIST) * 0.6})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }

    // 数据包
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += 0.02;
      if (p.t >= 1 || Math.hypot(p.a.x - p.b.x, p.a.y - p.b.y) > LINK_DIST) { pulses.splice(i, 1); continue; }
      const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.fillStyle = "rgba(255, 255, 255, .95)";
      ctx.shadowColor = "#22d3ee"; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 节点
    for (const n of nodes) {
      ctx.fillStyle = `hsla(${n.hue}, 95%, 72%, ${n.label ? 1 : 0.8})`;
      if (n.label) { ctx.shadowColor = `hsl(${n.hue}, 95%, 65%)`; ctx.shadowBlur = 14; }
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      if (n.label) {
        ctx.font = "600 11px ui-monospace, Menlo, monospace";
        ctx.fillStyle = "rgba(200, 214, 255, .75)";
        ctx.fillText(n.label, n.x + 7, n.y + 4);
      }
    }
  }

  let running = true, rafId = 0;
  function loop() { step(); if (running) rafId = requestAnimationFrame(loop); }

  window.addEventListener("resize", resize);
  canvas.parentElement.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
  });
  canvas.parentElement.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });
  // 切到别的标签页时暂停，省电
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) { cancelAnimationFrame(rafId); loop(); }
  });

  resize();
  if (reduceMotion) step();   // 系统开了"减少动态效果"就只画一帧静态图
  else loop();
})();
