import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
  const sectors = [
    { color: "#f82", label: "谢谢参与", weight: 15 },
    { color: "#0bf", label: "即兴节目 +4", weight: 2 },
    { color: "#fb0", label: "x3", weight: 2 },
    { color: "#0fb", label: "x2", weight: 3 },
    // { color: "#b0f", label: "x1.5", weight: 6 },
    { color: "#f0b", label: "+2", weight: 8 },
    { color: "#bf0", label: "+1", weight: 10 },
    { color: "#bf0", label: "-2", weight: 6 },
    { color: "#bf0", label: "-1", weight: 8 },
    { color: "#f0b", label: "+4", weight: 2 },
    { color: "#bf0", label: "+3", weight: 3 },
    { color: "#bf0", label: "-4", weight: 2 },
    { color: "#bf0", label: "-3", weight: 3 },
    { color: "#bf0", label: "x0", weight: 1 },
    // { color: "#bf0", label: "x0.5", weight: 10 },
    // { color: "#bf0", label: "x1/3", weight: 6 },
  ] as const;

  const fx = document.querySelector<HTMLElement>("#fx");
  if (!fx) throw new Error("Missing element: #fx");

  function burstEmojis(resultText: string) {
    // Choose emoji sets based on result (customize this!)
    const good = ["🎉", "✨", "🎊", "🧧"];
    const bad = ["😈", "😭"];
    const neutral = ["🤝"];

    const isBad = resultText.includes("0") || resultText.includes("/") || resultText.includes("-") || resultText.includes("谢谢参与");
    const pool = isBad ? bad : good;

    const n = 36; // number of emoji particles
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.45;

    // 1) Result chip(s)
    // for (let i = 0; i < 6; i++) {
    //   const chip = document.createElement("div");
    //   chip.className = "fx-chip";
    //   chip.textContent = `结果：${resultText} ${neutral[i % neutral.length]}`;

    //   chip.style.setProperty("--x", `${originX + (Math.random() - 0.5) * 260}px`);
    //   chip.style.setProperty("--y", `${originY + (Math.random() - 0.5) * 60}px`);
    //   chip.style.setProperty("--dx", `${(Math.random() - 0.5) * 200}px`);

    //   if (fx) fx.appendChild(chip);
    //   chip.addEventListener("animationend", () => chip.remove());
    // }

    // 2) Emoji confetti
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      el.className = "fx-emoji";
      el.textContent = pool[Math.floor(Math.random() * pool.length)];

      const size = 18 + Math.random() * 50;
      const dx = (Math.random() - 0.5) * 1500;      // left/right spread
      const dy = -180 - Math.random() * 180;       // fly upward
      const rot = `${(Math.random() - 0.5) * 3}turn`;

      el.style.setProperty("--x", `${originX}px`);
      el.style.setProperty("--y", `${originY}px`);
      el.style.setProperty("--size", `${size}px`);
      el.style.setProperty("--dx", `${dx}px`);
      el.style.setProperty("--dy", `${dy}px`);
      el.style.setProperty("--rot", rot);

      // random small delay makes it feel richer
      el.style.animationDelay = `${Math.random() * 500}ms`;

      if (fx) fx.appendChild(el);
      el.addEventListener("animationend", () => el.remove());
    }
  }

  function colorForIndex(i: number) {
    const GOLDEN_ANGLE = 137.508;
    const hue = (i * GOLDEN_ANGLE) % 360;
  
    // Muted, professional palette
    const saturation = 55; // was 85 → too bright
    const lightness = 48;  // slightly darker
  
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
  }

  const rand = (m: number, M: number) => Math.random() * (M - m) + m;
  const tot = sectors.length;

  const spinEl = document.querySelector<HTMLElement>("#spin");
  if (!spinEl) throw new Error("Missing element: #spin");

  const canvas = document.querySelector<HTMLCanvasElement>("#wheel");
  if (!canvas) throw new Error("Missing element: #wheel");

  const resultEl = document.querySelector<HTMLElement>("#result");
  if (!resultEl) throw new Error("Missing element: #result");

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  const dia = canvas.width;
  const rad = dia / 2;
  const PI = Math.PI;
  const TAU = 2 * PI;

  // Adjust by weight - Each sector gets its own start/end angle based on weight.
  // const arc = TAU / tot;
  const totalW = sectors.reduce((s, x) => s + x.weight, 0);
  const sectorAngles = (() => {
    let start = 0;
    const n = sectors.length;
  
    return sectors.map((s, i) => {
      const arc = (s.weight / totalW) * TAU;
      const end = start + arc;
      const mid = (start + end) / 2;
  
      const out = {
        ...s,
        color: colorForIndex(i),
        start,
        end,
        mid,
      };
  
      start = end;
      return out;
    });
  })();

  const friction = 0.991;
  let angVel = 0;
  let ang = 0;
  let lastIndex = 0;
  let hasStopped = true;

  // const getIndex = () => {
  //   const idx = Math.floor(tot - (ang / TAU) * tot) % tot;
  //   return (idx + tot) % tot; // normalize to [0..tot-1]
  // };
  const getIndex = () => {
    const pointerAngle = (TAU - ang) % TAU;
  
    const idx = sectorAngles.findIndex(
      (s) => pointerAngle >= s.start && pointerAngle < s.end
    );
    return idx === -1 ? sectorAngles.length - 1 : idx;
  };

  // function drawSector(sector: (typeof sectors)[number], i: number) {
  //   const angle = arc * i;
  //   ctx?.save();

  //   ctx?.beginPath();
  //   if (ctx) {ctx.fillStyle = sector.color;}
  //   ctx?.moveTo(rad, rad);
  //   ctx?.arc(rad, rad, rad, angle, angle + arc);
  //   ctx?.lineTo(rad, rad);
  //   ctx?.fill();

  //   ctx?.translate(rad, rad);
  //   ctx?.rotate(angle + arc / 2);
  //   if (ctx) ctx.textAlign = "right";
  //   if (ctx) ctx.fillStyle = "#fff";
  //   if (ctx) ctx.font = "bold 30px sans-serif";
  //   ctx?.fillText(sector.label, rad - 10, 10);

  //   ctx?.restore();
  // }

  function drawSector(sector: (typeof sectorAngles)[number]) {
    ctx?.save();
  
    ctx?.beginPath();
    if (ctx) ctx.fillStyle = sector.color;
    ctx?.moveTo(rad, rad);
    ctx?.arc(rad, rad, rad, sector.start, sector.end);
    ctx?.lineTo(rad, rad);
    ctx?.fill();
  
    // Label at mid angle
    ctx?.translate(rad, rad);
    ctx?.rotate(sector.mid);
    if (ctx) ctx.textAlign = "right";
    if (ctx) ctx.fillStyle = "#fff";
    // if (ctx) ctx.font = "bold 20px sans-serif"; // smaller for longer text
    function fitTextOnRadius(text: string, maxWidth: number) {
      let size = 30;
      if (ctx) ctx.font = `900 ${size}px sans-serif`;
      while (ctx && ctx.measureText(text).width > maxWidth && size > 12) {
        size -= 1;
        if (ctx) ctx.font = `900 ${size}px sans-serif`;
      }
      return size;
    }
    const maxTextWidth = rad * 0.70; // shrink if you want
    const fontSize = fitTextOnRadius(sector.label, maxTextWidth);
    if (ctx) ctx.font = `900 ${fontSize}px sans-serif`;
    ctx?.fillText(sector.label, rad - 10, 10);
  
    ctx?.restore();
  }

  // function rotate() {
  //   // const sector = sectors[getIndex()];
  //   const sector = sectorAngles[getIndex()];
  //   if (canvas) canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  //   if (spinEl) spinEl.textContent = angVel ? sector.label : "SPIN";
  //   if (spinEl) spinEl.style.background = sector.color;
  // }
  function rotate() {
    const idx = getIndex();
    lastIndex = idx;
  
    const sector = sectorAngles[idx];
    if (canvas) canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  
    // While spinning: show current sector on button (optional)
    // When stopped: keep button as "SPIN"
    if (spinEl) spinEl.textContent = angVel ? sector.label : "SPIN";
    if (spinEl) spinEl.style.background = sector.color;
  }

  // function frame() {
  //   if (!angVel) return;
  //   angVel *= friction;
  //   if (angVel < 0.002) angVel = 0;
  //   ang = (ang + angVel) % TAU;
  //   rotate();
  // }
  function frame() {
    if (!angVel) {
      // If we just stopped, write the result once
      if (!hasStopped) {
        hasStopped = true;
        const sector = sectorAngles[lastIndex];
        if (resultEl) resultEl.textContent = `结果：${sector.label}`;
        setTimeout(() => burstEmojis(sector.label), 360);
      }
      return;
    }
  
    hasStopped = false;
  
    angVel *= friction;
    if (angVel < 0.002) angVel = 0;
    ang = (ang + angVel) % TAU;
  
    rotate();
  }

  function engine() {
    frame();
    requestAnimationFrame(engine);
  }

  function init() {
    // sectors.forEach(drawSector);
    sectorAngles.forEach(drawSector);
    rotate();
    engine();

    spinEl?.addEventListener("click", () => {
      if (!angVel) {
        if (resultEl) resultEl.textContent = "结果：???";
        angVel = rand(0.25, 0.45);
      }
    });
  }

  init();
});