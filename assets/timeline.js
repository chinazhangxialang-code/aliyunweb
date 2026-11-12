// 学习路线时间轴：卡片滚动到屏幕里时依次淡入。没有时间轴的页面什么也不做。
(function () {
  const items = document.querySelectorAll(".ms-item");
  if (!items.length || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.documentElement.classList.add("ms-js");   // 有 JS 才隐藏，JS 失败时内容照样能看
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add("ms-in"); io.unobserve(e.target); }
    }
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
})();
