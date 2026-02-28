// === SIMPLE PORTFOLIO SHOOTER GAME ===
// Controls: WASD move, mouse aim, click shoot, R restart, Esc close panel

// 🔊 SOUNDS
const shootSound = new Audio("assets/laser.wav");
const hitSound   = new Audio("assets/hit.wav");
const winSound   = new Audio("assets/win.wav");

// optional volume control
shootSound.volume = 0.4;
hitSound.volume   = 0.5;
winSound.volume   = 0.6;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// HUD
const hpEl = document.getElementById("hp");
const scoreEl = document.getElementById("score");
const targetsLeftEl = document.getElementById("targetsLeft");

// Modal
const modal = document.getElementById("modal");
const ending = document.getElementById("ending");
const panelTitle = document.getElementById("panelTitle");
const panelTag = document.getElementById("panelTag");
const panelBody = document.getElementById("panelBody");
const closeBtn = document.getElementById("closeBtn");
const modalBackdrop = document.getElementById("modalBackdrop");
const nextBtn = document.getElementById("nextBtn");
const endClose = document.getElementById("endClose");
const restartBtn = document.getElementById("restartBtn");

// --- Your portfolio data (edit this text to match your resume 1:1) ---
const PANELS = [

  {
    id: "TCS",
    tag: "RETAIL • 3PL • B2B INTEGRATION",
    title: "TCS — Software Engineer",
    bodyHTML: `
      <div class="kv">
        <div class="row"><div class="label">Environment</div><div class="value">IBM Sterling B2Bi • MuleSoft • SQL • Linux</div></div>
        <div class="row"><div class="label">Transactions</div><div class="value">850, 855, 856, 810, 997/999</div></div>
        <div class="row"><div class="label">Protocols</div><div class="value">AS2 • SFTP • VAN • FTP</div></div>
      </div>

      <ul class="bullets">
        <li>Developed and supported end-to-end B2B integrations for retail and 3PL partners.</li>
        <li>Onboarded new trading partners including connectivity setup, mapping validation, and production cutover.</li>
        <li>Troubleshot failed transactions using BP logs, document tracking, and SQL validation.</li>
        <li>Implemented reusable onboarding templates to reduce partner go-live time.</li>
        <li>Handled high-volume production support with SLA-driven incident resolution.</li>
      </ul>

      <div class="dash-grid">
        <div class="dash-card">
          <div class="dash-label">Impact</div>
          <div class="dash-value">Faster onboarding • Reduced manual fixes • Stable document flow</div>
        </div>
      </div>
    `
  },

  {
    id: "V2",
    tag: "HEALTHCARE • ITX • EDI MODERNIZATION",
    title: "V2Soft — Senior Integration / EDI Developer",
    bodyHTML: `
      <div class="kv">
        <div class="row"><div class="label">Client</div><div class="value">Anthem (Healthcare EDI Modernization)</div></div>
        <div class="row"><div class="label">Tools</div><div class="value">IBM ITX / ITXA • TLA • SQL • AWS</div></div>
        <div class="row"><div class="label">Transactions</div><div class="value">837, 835, 834, 270/271, 276/277</div></div>
      </div>

      <ul class="bullets">
        <li>Developed and enhanced ITX maps for HIPAA X12 healthcare transactions.</li>
        <li>Implemented validation rules and automated error-handling frameworks.</li>
        <li>Performed data validation using SQL for claim and remittance reconciliation.</li>
        <li>Supported high-volume batch processing with performance optimization.</li>
        <li>Reduced manual intervention by automating monitoring and reprocessing flows.</li>
        <li>Collaborated with business and EDI teams to resolve production incidents.</li>
      </ul>

      <div class="dash-grid">
        <div class="dash-card">
          <div class="dash-label">Key Achievements</div>
          <div class="dash-value">↓ Manual effort • ↑ MTTR improvement • Reliable claim processing</div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Data Flow</div>
          <div class="dash-value">Claims → Validation → Transformation → Acknowledgement</div>
        </div>
      </div>
    `
  },

  {
    id: "CIGNA",
    tag: "HEALTHCARE • EDI OPERATIONS",
    title: "Cigna — EDI Developer",
    bodyHTML: `
      <div class="kv">
        <div class="row"><div class="label">Transactions</div><div class="value">837, 835, 834, 270/271</div></div>
        <div class="row"><div class="label">Tools</div><div class="value">Edifecs • ITX • SQL</div></div>
        <div class="row"><div class="label">Focus</div><div class="value">Validation • Testing • Production Support</div></div>
      </div>

      <ul class="bullets">
        <li>Supported healthcare EDI claim, remittance, and eligibility workflows.</li>
        <li>Performed SNIP-level validations and data quality checks.</li>
        <li>Executed test cycles and coordinated defect fixes with upstream systems.</li>
        <li>Analyzed failed transactions and provided quick turnaround resolutions.</li>
        <li>Ensured accurate partner connectivity and document delivery.</li>
      </ul>

      <div class="dash-grid">
        <div class="dash-card">
          <div class="dash-label">Outcome</div>
          <div class="dash-value">Improved processing accuracy • Faster issue resolution</div>
        </div>
      </div>
    `
  }

];

// Game entities
const keys = {};
let mouse = { x: canvas.width / 2, y: canvas.height / 2, down: false };

const player = {
  x: canvas.width * 0.15,
  y: canvas.height * 0.55,
  r: 16,
  speed: 3.2,
  hp: 100,
  angle: 0
};

let bullets = [];
let particles = [];
let score = 0;

function makeTargets() {
  return [
    { id: "TCS", x: 820, y: 180, w: 180, h: 70, alive: true },
    { id: "V2", x: 920, y: 360, w: 210, h: 70, alive: true },
    { id: "CIGNA", x: 520, y: 120, w: 200, h: 70, alive: true },
  ];
}
let targets = makeTargets();

// --- helpers ---
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }

function panelFor(id) {
  return PANELS.find(p => p.id === id);
}

function openPanel(id) {
  const p = panelFor(id);
  if (!p) return;
  panelTitle.textContent = p.title;
  panelTag.textContent = p.tag;
  panelBody.innerHTML = p.bodyHTML;
  modal.classList.remove("hidden");
}

function closePanel() {
  modal.classList.add("hidden");
}

function openEnding() {
  ending.classList.remove("hidden");
}
function closeEnding() {
  ending.classList.add("hidden");
}

function resetGame() {
  player.x = canvas.width * 0.15;
  player.y = canvas.height * 0.55;
  player.hp = 100;
  bullets = [];
  particles = [];
  score = 0;
  targets = makeTargets();
  closePanel();
  closeEnding();
}

// --- input ---
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === "r") resetGame();
  if (e.key === "Escape") closePanel();
});
window.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
  mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
});

canvas.addEventListener("mousedown", () => mouse.down = true);
canvas.addEventListener("mouseup", () => mouse.down = false);

canvas.addEventListener("click", () => {
  if (!modal.classList.contains("hidden")) return; // don’t shoot when panel open
  shoot();
});

closeBtn.addEventListener("click", closePanel);
modalBackdrop.addEventListener("click", closePanel);
nextBtn.addEventListener("click", () => closePanel());

endClose.addEventListener("click", closeEnding);
restartBtn.addEventListener("click", resetGame);

// --- shooting ---
function shoot() {

  shootSound.currentTime = 0;
  shootSound.play();

  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  const speed = 8.8;

  bullets.push({
    x: player.x + Math.cos(angle) * (player.r + 6),
    y: player.y + Math.sin(angle) * (player.r + 6),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 80
  });
}

function burst(x, y, color="rgba(0,212,255,0.9)") {
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1.2 + Math.random() * 3.8;
    particles.push({
      x, y,
      vx: Math.cos(a)*s,
      vy: Math.sin(a)*s,
      life: 35 + Math.random()*20,
      color
    });
  }
}

// --- update loop ---
function update() {
  // player movement
  let dx = 0, dy = 0;
  if (keys["w"]) dy -= 1;
  if (keys["s"]) dy += 1;
  if (keys["a"]) dx -= 1;
  if (keys["d"]) dx += 1;

  const len = Math.hypot(dx, dy) || 1;
  player.x = clamp(player.x + (dx/len) * player.speed, 30, canvas.width - 30);
  player.y = clamp(player.y + (dy/len) * player.speed, 80, canvas.height - 30);

  // aim
  player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

  // bullets
  bullets.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;
    b.life--;
  });
  bullets = bullets.filter(b => b.life > 0 && b.x > -50 && b.x < canvas.width + 50 && b.y > -50 && b.y < canvas.height + 50);

  // collisions
  for (const b of bullets) {
    for (const t of targets) {
      if (!t.alive) continue;

      const hit = (b.x >= t.x && b.x <= t.x + t.w && b.y >= t.y && b.y <= t.y + t.h);
      if (hit) {

  hitSound.currentTime = 0;
  hitSound.play();

  t.alive = false;
  score += 250;

  burst(b.x, b.y, "rgba(124,58,237,0.95)");
  openPanel(t.id);

  b.life = 0;
}
    }
  }

  // particles
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);

  // HUD
  hpEl.textContent = player.hp;
  scoreEl.textContent = score;
  const left = targets.filter(t => t.alive).length;
  targetsLeftEl.textContent = left;

  // ending
  if (left === 0 && ending.classList.contains("hidden") && modal.classList.contains("hidden")) {
    winSound.currentTime = 0;
    winSound.play();
    openEnding();
  }
}

// --- draw ---
function drawBackground() {
  // “digital grid” background
  ctx.save();
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // subtle vignette
  const g = ctx.createRadialGradient(canvas.width*0.4, canvas.height*0.3, 50, canvas.width*0.5, canvas.height*0.5, 700);
  g.addColorStop(0, "rgba(0,212,255,0.10)");
  g.addColorStop(0.5, "rgba(124,58,237,0.08)");
  g.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // grid lines
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBillboard(t) {
  // hologram billboard
  ctx.save();
  ctx.globalAlpha = t.alive ? 1 : 0.15;

  // glow
  ctx.shadowColor = "rgba(0,212,255,0.8)";
  ctx.shadowBlur = 18;

  // panel
  ctx.fillStyle = "rgba(0,212,255,0.10)";
  ctx.strokeStyle = "rgba(0,212,255,0.35)";
  roundRect(ctx, t.x, t.y, t.w, t.h, 14, true, true);

  // title
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "800 18px Arial";
  ctx.fillText(t.id === "V2" ? "V2 MENTATS" : t.id, t.x + 14, t.y + 42);

  // hint
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "12px Arial";
  ctx.fillText("Shoot to open", t.x + 14, t.y + 62);

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawPlayer() {
  ctx.save();

  // body
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
  ctx.fill();

  // gun direction
  ctx.strokeStyle = "rgba(0,212,255,0.85)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x + Math.cos(player.angle)*32, player.y + Math.sin(player.angle)*32);
  ctx.stroke();

  // crosshair
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mouse.x-14, mouse.y);
  ctx.lineTo(mouse.x+14, mouse.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mouse.x, mouse.y-14);
  ctx.lineTo(mouse.x, mouse.y+14);
  ctx.stroke();

  ctx.restore();
}

function drawBullets() {
  ctx.save();
  ctx.fillStyle = "rgba(250,204,21,0.95)";
  for (const b of bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3.2, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawParticles() {
  ctx.save();
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / 55);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.2, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawUIOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, 18, 18, 340, 48, 14, true, false);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 14px Arial";
  ctx.fillText("Shoot targets to open role panels (TCS, V2 Mentats, Anthem, Cigna)", 30, 48);
  ctx.restore();
}

function render() {
  drawBackground();

  // animated “data lines”
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "rgba(34,197,94,0.55)";
  ctx.lineWidth = 2;
  const t = Date.now() / 900;
  for (let i = 0; i < 7; i++) {
    const y = 90 + i*70;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(canvas.width*0.4, y + Math.sin(t+i)*18, canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();

  // targets
  targets.forEach(drawBillboard);

  drawBullets();
  drawParticles();
  drawPlayer();
  drawUIOverlay();
}

// loop
function loop() {
  if (modal.classList.contains("hidden") && ending.classList.contains("hidden")) {
    update();
  }
  render();
  requestAnimationFrame(loop);
}

// init
targetsLeftEl.textContent = targets.filter(t => t.alive).length;
loop();