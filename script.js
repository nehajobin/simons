const colors = ["green", "red", "yellow", "blue"];
const freq = {
  green: 329.63,  
  red:   261.63,  
  yellow:220.00,  
  blue:  164.81   
};

let gamePattern = [];
let userPattern = [];
let audioCtx = null;
let acceptingInput = false;

const startBtn = document.getElementById("startBtn");
const statusEl = document.getElementById("status");
const levelEl = document.getElementById("level");
const buttons = document.querySelectorAll(".btn");

const sleep = ms => new Promise(res => setTimeout(res, ms));


function playTone(color, duration = 300) {
  return new Promise((resolve) => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    o.type = "sine";
    o.frequency.value = freq[color] || 220;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);

    o.connect(g);
    g.connect(audioCtx.destination);

    
    g.gain.linearRampToValueAtTime(0.45, audioCtx.currentTime + 0.02);
    o.start();

    setTimeout(() => {
      
      g.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02);
      try { o.stop(audioCtx.currentTime + 0.03); } catch (e) { o.stop(); }
      resolve();
    }, duration);
  });
}


function playWrongSound(duration = 300) {
  return new Promise(resolve => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    o.type = "square";
    o.frequency.value = 120;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    o.connect(g);
    g.connect(audioCtx.destination);
    g.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.01);
    o.start();

    setTimeout(() => {
      g.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02);
      try { o.stop(audioCtx.currentTime + 0.03); } catch (e) { o.stop(); }
      resolve();
    }, duration);
  });
}

async function highlightAndPlay(color, toneDuration = 380) {
  const el = document.getElementById(color);
  if (!el) return;
  el.classList.add("active");
  await playTone(color, toneDuration);
  el.classList.remove("active");
}


startBtn.addEventListener("click", async () => {
  
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") await audioCtx.resume();

  startBtn.disabled = true;
  startBtn.textContent = "Playing...";
  gamePattern = [];
  userPattern = [];
  levelEl.textContent = "Level: 0";
  statusEl.textContent = "Get ready...";
  await sleep(400);
  nextSequence();
});


async function nextSequence() {
  acceptingInput = false;
  userPattern = [];


  const next = colors[Math.floor(Math.random() * colors.length)];
  gamePattern.push(next);

  levelEl.textContent = `Level: ${gamePattern.length}`;
  statusEl.textContent = "Watch the sequence...";

  
  await sleep(350);
  for (let c of gamePattern) {
    await highlightAndPlay(c, 420);
    await sleep(200);
  }

  
  statusEl.textContent = "Your turn";
  acceptingInput = true;
}


buttons.forEach(btn => {
  btn.addEventListener("click", async function () {
    if (!acceptingInput) return;
    const color = this.id;

    
    this.classList.add("active");
    playTone(color, 220).then(() => this.classList.remove("active"));

    userPattern.push(color);
    checkAnswer(userPattern.length - 1);
  });
});


function checkAnswer(currentIndex) {
  if (userPattern[currentIndex] !== gamePattern[currentIndex]) {
    
    gameOver();
    return;
  }

  
  if (userPattern.length === gamePattern.length) {
    acceptingInput = false;
    statusEl.textContent = "Correct! Next level...";
    setTimeout(() => nextSequence(), 900);
  }
}


async function gameOver() {
  acceptingInput = false;
  statusEl.textContent = `Wrong! Game Over — you reached level ${gamePattern.length}.`;
  await playWrongSound(450);

  
  document.body.style.transition = "background-color 120ms";
  const old = document.body.style.background;
  document.body.style.background = "#5a0d0d";
  setTimeout(() => {
    document.body.style.background = old;
  }, 200);

  startBtn.disabled = false;
  startBtn.textContent = "Restart Game";
  gamePattern = [];
  userPattern = [];
}
