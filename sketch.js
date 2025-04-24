// === CONFIGURACIÓN GENERAL ===
let vidas = 3;
let velocidad_Bola = 7;
let puntuacion = 0;
let puntuacion_max = 0;
let nivel_actual;

// Para pruebas: cambiar este valor y recargar para arrancar en otro nivel
const nivelInicial = 1;
const nivelFinal = 3;               // ← AÑADIDO: número de niveles totales
let selector_de_nivel = nivelInicial;

// Estados de juego: 'transition', 'playing', 'paused', 'resuming', 'win', 'lose'
let gameState;
let transitionTimer = 0;
let resumeTimer = 0;
const dureTransicion = 2 * 60;      // 2 seg
const dureResumir    = 3 * 60;      // 3 seg

// Lanzamiento de bola
let estaSacando = true;

// Power-up mensajes
let powerMsg = '';
let powerMsgTimer = 0;
const powerMsgDuration = 2 * 60;   // 2 seg

// Paddle grow
const paddleDefaultWidth  = 100;
const paddleGrowFactor    = 1.5;
const paddleGrowDuration  = 10 * 60; // 10s
let paddleGrowTimer       = 0;

// Paddle speed-up
const paddleDefaultSpeed = 7;
const paddleSpeedFactor  = 1.5;
const paddleSpeedDuration = 10 * 60;  // 10s
let paddleSpeed = paddleDefaultSpeed;
let paddleSpeedTimer = 0;

// Wall power-up
let wallActive = false;
let wallTimer = 0;
let wallY = 0;
const wallDuration = 15 * 60;       // 15s

// Probabilidad de power-up
const probPowerUp = 0.2; //20%

// UI
let altoUI = 50;
const margenBloques = 10;

let pelotas = [];
let paleta;

// === CLASES ===
class Bloque {
  constructor(x, y, w, h, vida, color, puntos, destructible) {
    Object.assign(this, {x, y, w, h, vida, color, puntos, destructible});
  }
  mostrar() {
    fill(this.color);
    strokeWeight(1);
    stroke('white');
    rect(this.x, this.y, this.w, this.h);
  }
}

class Nivel {
  constructor() { this.bloques = []; }
  agregarBloque(b) { this.bloques.push(b); }
  mostrar() { this.bloques.forEach(b => b.vida > 0 && b.mostrar()); }
}

class Bola {
  constructor(r) { this.r = r; this.posicionar(); }
  posicionar() {
    this.x = paleta.x + paleta.w / 2;
    this.y = paleta.y - 15;
    const angle = random(-PI/4, -3 * PI/4);
    this.xspeed = velocidad_Bola * cos(angle);
    this.yspeed = velocidad_Bola * sin(angle);
  }
  mostrar() {
    fill('white'); noStroke(); ellipse(this.x, this.y, this.r);
  }
  actualizar() {
    if (wallActive && this.y + this.r > wallY) {
      this.yspeed *= -1;
      this.y = wallY - this.r;
      return;
    }
    this.x += this.xspeed;
    this.y += this.yspeed;
    if (this.x < this.r || this.x > width - this.r) this.xspeed *= -1;
    if (this.y < this.r) this.yspeed *= -1;
    if (this.y > height + this.r) {
      if (pelotas.length > 1) pelotas.splice(pelotas.indexOf(this), 1);
      else {
        vidas--; estaSacando = true; this.posicionar();
      }
    }
  }
  tocaBloque(b) {
    const cx = constrain(this.x, b.x, b.x + b.w);
    const cy = constrain(this.y, b.y, b.y + b.h);
    const dx = this.x - cx;
    const dy = this.y - cy;
    if (dx*dx + dy*dy < this.r*this.r) {
      if (abs(dx) > abs(dy)) this.xspeed *= -1;
      else this.yspeed *= -1;
      return true;
    }
    return false;
  }
  tocaPaleta(p) {
    if (this.tocaBloque(p)) {
      const hit = (this.x - (p.x + p.w/2)) / (p.w/2);
      const ang = hit * PI/3;
      this.xspeed = velocidad_Bola * sin(ang);
      this.yspeed = -velocidad_Bola * cos(ang);
      return true;
    }
    return false;
  }
}

class Paleta {
  constructor(x, y, w, h) { Object.assign(this, {x, y, w, h}); }
  actualizar() {
    if (keyIsDown(LEFT_ARROW)) this.x = max(this.x - paddleSpeed, 0);
    if (keyIsDown(RIGHT_ARROW)) this.x = min(this.x + paddleSpeed, width - this.w);
  }
  mostrar() { fill('white'); noStroke(); rect(this.x, this.y, this.w, this.h); }
}

function setup() {
  createCanvas(900, 700);
  paleta = new Paleta(400, 600, paddleDefaultWidth, 10);
  initLevel();
}

function initLevel() {
  pelotas = [];
  paddleGrowTimer = 0;
  paddleSpeedTimer = 0;
  wallActive = false;
  wallTimer = 0;
  selector_de_nivel = selector_de_nivel;
  switch(selector_de_nivel) {
    case 1: nivel_actual = crear_nivel_1(); break;
    case 2: nivel_actual = crear_nivel_2(); break;
    case 3: nivel_actual = crear_nivel_3(); break;
    default: nivel_actual = crear_nivel_1();
  }
  crear_pelota();
  estaSacando = true;
  gameState = 'transition';
  transitionTimer = dureTransicion;
  loop();                           // asegúrate de reiniciar draw loop
}

function draw() {
  background(0);
  frameRate(60);

  // Mostrar muro cuando power-up activo
  if (wallActive) {
    stroke(255);
    strokeWeight(4);
    line(0, wallY, width, wallY);
  }

  // Checar estados de victoria/derrota
  if (gameState === 'win') {
    mostrarMensajeCentro('¡VICTORIA!');
    noLoop();
    return;
  }
  if (gameState === 'lose') {
    mostrarMensajeCentro('GAME OVER');
    noLoop();
    return;
  }

  mostrarUI();

  if (--paddleGrowTimer <= 0) paleta.w = paddleDefaultWidth;
  if (--paddleSpeedTimer <= 0) paddleSpeed = paddleDefaultSpeed;
  if (wallActive && --wallTimer <= 0) wallActive = false;
  if (powerMsgTimer > 0) powerMsgTimer--;

  if (gameState === 'transition') {
    mostrarMensajeCentro(`Nivel ${selector_de_nivel}`);
    if (--transitionTimer <= 0) gameState = 'playing';
    return;
  }
  if (gameState === 'paused') { mostrarMensajeCentro('PAUSA'); return; }
  if (gameState === 'resuming') {
    mostrarMensajeCentro(`Reanudando en ${ceil(resumeTimer/60)}`);
    if (--resumeTimer <= 0) gameState = 'playing';
    return;
  }

  actualizar();

  if (powerMsgTimer > 0) {
    textAlign(CENTER, TOP);
    fill(255, 255, 0);
    textSize(20);
    text(powerMsg, width/2, altoUI + 10);
  }
}

function keyPressed() {
  // Reinicio con ENTER tras victoria o derrota
  if ((gameState === 'win' || gameState === 'lose') && keyCode === ENTER) {
    reiniciar();
    return;
  }
  if (key === ' ') {
    if (gameState === 'playing') gameState = 'paused';
    else if (gameState === 'paused') { gameState = 'resuming'; resumeTimer = dureResumir; }
  }
  if (keyCode === UP_ARROW && gameState === 'playing' && estaSacando) estaSacando = false;
}

function actualizar() {
  nivel_actual.mostrar();
  paleta.mostrar();
  paleta.actualizar();
  movimiento_pelota();

  const estado = juego_terminado();
  if (estado === 2) {
    if (selector_de_nivel === nivelFinal) {
      gameState = 'win';           // ← AÑADIDO: nivel final completado
    } else {
      pasar_nivel();
    }
  } else if (estado === 3) {
    gameState = 'lose';            // ← AÑADIDO: vidas agotadas
  }
}

function movimiento_pelota() {
  if (gameState !== 'playing') return;
  if (estaSacando) {
    pelotas.forEach(p => { p.posicionar(); p.mostrar(); });
    return;
  }
  pelotas.forEach(p => {
    p.actualizar();
    for (let b of nivel_actual.bloques) {
      if (b.vida > 0 && p.tocaBloque(b)) {
        if (b.destructible) {
          if (b.vida === 1) puntuacion++;
          b.vida--;
          if (b.vida === 0 && random() < probPowerUp) {
            const types = ['paddle', 'wall', 'extraBalls', 'speed'];
            const t = random(types);
            aplicarPowerUp(t);
            powerMsg = `Power-up: ${t}`;
            powerMsgTimer = powerMsgDuration;
          }
        }
        break;
      }
    }
    p.tocaPaleta(paleta);
    p.mostrar();
  });
}

function aplicarPowerUp(type) {
  if (type === 'paddle') {
    paleta.w = paddleDefaultWidth * paddleGrowFactor;
    paddleGrowTimer = paddleGrowDuration;
  } else if (type === 'wall') {
    wallActive = true;
    wallTimer = wallDuration;
    wallY = paleta.y + paleta.h + 5;
  } else if (type === 'extraBalls') {
    crear_pelota();
    crear_pelota();
  } else if (type === 'speed') {
    paddleSpeed = paddleDefaultSpeed * paddleSpeedFactor;
    paddleSpeedTimer = paddleSpeedDuration;
  }
}

function juego_terminado() {
  // Solo consideramos bloques destructibles para la victoria
  const quedan = nivel_actual.bloques.filter(b => b.destructible && b.vida > 0).length;
  if (quedan === 0) return 2;
  if (vidas <= 0)    return 3;
  return 1;
}

function reiniciar() {
  puntuacion_max = max(puntuacion, puntuacion_max);
  puntuacion = 0;
  vidas = 3;
  selector_de_nivel = nivelInicial;
  initLevel();
}

function pasar_nivel() {
  selector_de_nivel++;
  initLevel();
}

function crear_pelota() {
  pelotas.push(new Bola(20));
}

function mostrarUI() {
  noStroke(); fill(0, 150); rect(0, 0, width, altoUI);
  fill(255); textSize(16);
  textAlign(LEFT, TOP);  text(`Vidas: ${vidas}`, 10, 10);
  text(`Puntuación: ${puntuacion}`, 10, 30);
  textAlign(RIGHT, TOP); text(`Nivel: ${selector_de_nivel}`, width - 10, 10);
  text(`Max: ${puntuacion_max}`, width - 10, 30);
}

function mostrarMensajeCentro(msg) {
  textAlign(CENTER, CENTER); fill(255); textSize(32); text(msg, width/2, height/2);
}

// CREACIÓN DE NIVELES (offset Y con UI)
function crear_nivel_1() {
  let n1 = new Nivel();
  velocidad_Bola = 7;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 17; j++) {
      let x = 10 + j*52;
      let y = altoUI + margenBloques + i*22;
      n1.agregarBloque(new Bloque(x, y, 50, 20, 1, color(255,0,0), 10, true));
    }
  }
  return n1;
}

function crear_nivel_2() {
  const n = new Nivel(); velocidad_Bola = 10;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 17; j++) {
      const vida = (i === 3 && j % 2 === 0) ? 3 : 1;
      const col  = (i === 3 && j % 2 === 0) ? color(255,255,0) : color(255,0,0);
      n.agregarBloque(new Bloque(10 + j*52, altoUI + margenBloques + i*22, 50, 20, vida, col, 10, true));
    }
  }
  return n;
}

function crear_nivel_3() {
  const n = new Nivel(); velocidad_Bola = 13;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 17; j++) {
      if (i === 3 && (j === 3 || j === 13))
        n.agregarBloque(new Bloque(10 + j*52, altoUI + margenBloques + i*22, 50, 20, 1, color(147,147,147), 10, false));
      else if (i === 5 && j % 2 === 0)
        n.agregarBloque(new Bloque(10 + j*52, altoUI + margenBloques + i*22, 50, 20, 3, color(255,255,0), 10, true));
      else
        n.agregarBloque(new Bloque(10 + j*52, altoUI + margenBloques + i*22, 50, 20, 1, color(255,0,0), 10, true));
    }
  }
  return n;
}
