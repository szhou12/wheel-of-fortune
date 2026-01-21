// src/generator.ts
import "./style.css";

const words = [
  "范围三",
  "PtX",
  "巴黎协定",
  "COP30",
  "十五五规划",
  "能源转型",
  "红杉气候基金会 (Sequoia Climate Foundation)",
  "橡树基金会 (Oak Foundation)",
  "能源基金会 (EFC)",
  "国家自主贡献 (NDC)",
  "Book & Claim",
  "氢冶金",
  "零碳园区",
  "液化天然气 (LNG)",
  "分布式光伏",
  "集中式光伏",
  "离岸风能",
  "绿色航运走廊",
  "绿色能源加注",
  "绿色电力",
  "水力发电",
  "核电",
  "绿氢",
  "绿氨",
  "甲醇",
  "建筑隐含碳",
  "氢燃料电池",
  "生物燃料",
  "生物天然气",
  "生物甲烷",
  "充电重卡",
  "可持续航空燃料 (SAF)",
  "二氧化碳捕集",
  "工业脱碳",
  "再生铝",
  "碳达峰",
  "碳中和",
  "碳足迹",
  "碳关税",
  "净零排放",
  "落基山研究所创新中心",
  "秸秆",
  "喜马拉雅",
  "落基山",
  "猪脚饭",
  "螺蛳粉",
  "远洋光华",
  "呼家楼",
  "安妮餐厅",
  "爱泰峰/泰国菜",
  "羊肉粉",
  "豆花饭",
  "林里柠檬茶",
  "马记永",
  "麦当劳",
  "avocado tree",
  "Manner Coffee",
] as const;

const btn = document.querySelector<HTMLButtonElement>("#btn");
if (!btn) throw new Error("Missing element: #btn");

const wordEl = document.querySelector<HTMLElement>("#word");
if (!wordEl) throw new Error("Missing element: #word");

const cdEl = document.querySelector<HTMLElement>("#countdown");
if (!cdEl) throw new Error("Missing element: #countdown");

const fx = document.querySelector<HTMLElement>("#fx");
if (!fx) throw new Error("Missing element: #fx");

let timer: number | null = null;
let remaining = 0;

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function setVisible(el: HTMLElement, on: boolean) {
  el.classList.toggle("hidden", !on);
  el.classList.toggle("show", on);
}

function clearTimer() {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
}

function burst(result: string) {
  const good = ["🎉", "✨", "🥳", "🎊", "🔥", "👏"];
  const bad = ["🫠", "😵‍💫", "💀", "🙃", "😅"];
  const neutral = ["😎", "🤝", "✅", "⭐️", "👏"];

  const isBad =
    result.includes("x0") ||
    result.includes("-") ||
    result.includes("谢谢参与");

  const pool = isBad ? bad : good;

  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.42;

  // A few "result chips" (optional)
  for (let i = 0; i < 6; i++) {
    const chip = document.createElement("div");
    chip.className = "fx-chip";
    chip.textContent = `结果：${result} ${neutral[i % neutral.length]}`;

    chip.style.setProperty("--x", `${originX + (Math.random() - 0.5) * 260}px`);
    chip.style.setProperty("--y", `${originY + (Math.random() - 0.5) * 60}px`);
    chip.style.setProperty("--dx", `${(Math.random() - 0.5) * 200}px`);

    fx.appendChild(chip);
    chip.addEventListener("animationend", () => chip.remove());
  }

  // Emoji confetti
  for (let i = 0; i < 36; i++) {
    const el = document.createElement("div");
    el.className = "fx-emoji";
    el.textContent = pool[Math.floor(Math.random() * pool.length)];

    const size = 18 + Math.random() * 18;
    const dx = (Math.random() - 0.5) * 520;
    const dy = -140 - Math.random() * 360;
    const rot = `${(Math.random() - 0.5) * 2}turn`;

    el.style.setProperty("--x", `${originX}px`);
    el.style.setProperty("--y", `${originY}px`);
    el.style.setProperty("--size", `${size}px`);
    el.style.setProperty("--dx", `${dx}px`);
    el.style.setProperty("--dy", `${dy}px`);
    el.style.setProperty("--rot", rot);

    el.style.animationDelay = `${Math.random() * 120}ms`;

    fx.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

function start() {
  // prevent double-start while running
  btn.disabled = true;

  clearTimer();

  const result = pickRandom(words);
  wordEl.textContent = result;

  remaining = 5;
  cdEl.textContent = String(remaining);

  setVisible(wordEl, true);
  setVisible(cdEl, true);

//   burst(result);

  timer = window.setInterval(() => {
    remaining -= 1;

    if (remaining <= 0) {
      clearTimer();
      setVisible(wordEl, false);
      setVisible(cdEl, false);
      btn.disabled = false;
      return;
    }

    cdEl.textContent = String(remaining);
  }, 500);
}

btn.addEventListener("click", start);