// === CONFIGURACIÓN GENERAL ===
let vidas = 3;
let velocidad_Bola = 7;
let puntuacion = 0;
let puntuacion_max = 0;
let nivel_actual;

// Para pruebas: cambiar este valor y recargar para arrancar en otro nivel
const nivelInicial = 1;
let selector_de_nivel = nivelInicial;

// Estados de juego: 'transition', 'playing', 'paused', 'resuming'
let gameState;
let transitionTimer = 0;
let resumeTimer = 0;
const dureTransicion = 2 * 60; // 2 segundos de transición
const dureResumir = 3 * 60;    // 3 segundos de cuenta atrás al reanudar

// Control de lanzamiento
let estaSacando = true;

// === CONSTANTES PARA LA UI ===
const altoUI = 50;
const margenBloques = 10;

let pelotas = [];
let paleta;

// --- CLASES ---
class Bloque {
  constructor(x, y, w, h, vida, color, puntos, destructible) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.vida = vida;
    this.color = color;
    this.puntos = puntos;
    this.destructible = destructible;
  }
  mostrar() {
    fill(this.color);
    strokeWeight(1);
    stroke("white");
    rect(this.x, this.y, this.w, this.h);
  }
}

class Nivel {
  constructor() { this.bloques = []; }
  agregarBloque(b) { this.bloques.push(b); }
  mostrar() {
    for (let b of this.bloques) if (b.vida > 0) b.mostrar();
  }
}

class Bola {
  constructor(x, y, r) {
    this.x = x; this.y = y; this.r = r;
    this.posicionar();
  }
  mostrar() {
    fill("white"); strokeWeight(0);
    ellipse(this.x, this.y, this.r);
  }
  posicionar() {
    this.x = paleta.x + paleta.w / 2;
    this.y = paleta.y - 15;
    let angle = random(-PI/4, -3*PI/4);
    this.xspeed = velocidad_Bola * cos(angle);
    this.yspeed = velocidad_Bola * sin(angle);
  }
  actualizar() {
    this.x += this.xspeed;
    this.y += this.yspeed;
    if (this.x < this.r || this.x > width - this.r) this.xspeed *= -1;
    if (this.y < this.r) this.yspeed *= -1;
    if (this.y > height + this.r) {
      vidas--;
      estaSacando = true;
      this.posicionar();
    }
  }
  tocaBloque(obj) {
    let cx = constrain(this.x, obj.x, obj.x + obj.w);
    let cy = constrain(this.y, obj.y, obj.y + obj.h);
    let dx = this.x - cx, dy = this.y - cy;
    if (dx*dx + dy*dy < this.r*this.r) {
      if (abs(dx) > abs(dy)) this.xspeed *= -1;
      else this.yspeed *= -1;
      return true;
    }
    return false;
  }
  tocaPaleta(p) {
    if (this.tocaBloque(p)) {
      let hit = (this.x - (p.x + p.w/2)) / (p.w/2);
      let ang = hit * PI/3;
      this.xspeed = velocidad_Bola * sin(ang);
      this.yspeed = -velocidad_Bola * cos(ang);
      return true;
    }
    return false;
  }
}

class Paleta {
  constructor(x, y, w, h) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
  }
  actualizar() {
    if (keyIsDown(LEFT_ARROW))  this.x = max(this.x - 7, 0);
    if (keyIsDown(RIGHT_ARROW)) this.x = min(this.x + 7, width - this.w);
  }
  mostrar() {
    fill("white"); rect(this.x, this.y, this.w, this.h);
  }
}

function setup() {
  createCanvas(900, 700);
  paleta = new Paleta(400, 600, 100, 10);
  initLevel();
}

// Inicializa nivel, pelota y transición
function initLevel() {
  pelotas = [];
  estaSacando = true;
  switch(selector_de_nivel) {
    case 1: nivel_actual = crear_nivel_1(); break;
    case 2: nivel_actual = crear_nivel_2(); break;
    case 3: nivel_actual = crear_nivel_3(); break;
    default: nivel_actual = crear_nivel_1(); break;
  }
  // Asegurar al menos una pelota en cada nivel
  crear_pelota();
  gameState = 'transition';
  transitionTimer = dureTransicion;
}

function draw() {
  background(0);
  frameRate(60);
  mostrarUI();

  if (gameState === 'transition') {
    mostrarMensajeCentro(`Nivel ${selector_de_nivel}`);
    if (--transitionTimer <= 0) gameState = 'playing';
    return;
  }
  if (gameState === 'paused') {
    mostrarMensajeCentro('PAUSA');
    return;
  }
  if (gameState === 'resuming') {
    let s = ceil(resumeTimer / 60);
    mostrarMensajeCentro(`Reanudando en ${s}`);
    if (--resumeTimer <= 0) gameState = 'playing';
    return;
  }

  // estado 'playing'
  actualizar();
}

function keyPressed() {
  if (key === ' ') {
    if (gameState === 'playing') gameState = 'paused';
    else if (gameState === 'paused') {
      gameState = 'resuming';
      resumeTimer = dureResumir;
    }
  }
  if (keyCode === UP_ARROW && gameState === 'playing' && estaSacando) {
    estaSacando = false;
  }
}

// Dibuja la UI superior
function mostrarUI() {
  noStroke(); fill(0, 150);
  rect(0, 0, width, altoUI);
  fill(255); textSize(16);
  textAlign(LEFT, TOP);
  text(`Vidas: ${vidas}`, 10, 10);
  text(`Puntuación: ${puntuacion}`, 10, 30);
  textAlign(RIGHT, TOP);
  text(`Nivel: ${selector_de_nivel}`, width - 10, 10);
  text(`Max: ${puntuacion_max}`, width - 10, 30);
}

// Mensajes centrados
function mostrarMensajeCentro(msg) {
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(32);
  text(msg, width/2, height/2);
}

function actualizar() {
  nivel_actual.mostrar();
  paleta.mostrar();
  paleta.actualizar();
  movimiento_pelota();

  let estado = juego_terminado();
  if (estado === 2) pasar_nivel();
  else if (estado === 3) reiniciar();
}

function juego_terminado() {
  let quedan = nivel_actual.bloques.filter(b => b.vida > 0).length;
  if (quedan === 0) return 2;
  if (vidas <= 0) return 3;
  return 1;
}

function movimiento_pelota() {
  if (gameState !== 'playing') return;
  if (estaSacando) {
    // muestra la pelota fijada a la paleta
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
        }
        break;
      }
    }
    p.tocaPaleta(paleta);
    p.mostrar();
  });
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

function crear_pelota(x, y) {
  let pel = new Bola(x, y, 20);
  pelotas.push(pel);
}

// CREACIÓN DE NIVELES (offset Y con UI)
function crear_nivel_1() {
  let n1 = new Nivel();
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
  let n2 = new Nivel();
  velocidad_Bola = 10;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 17; j++) {
      let x = 10 + j*52;
      let y = altoUI + margenBloques + i*22;
      let vida = (i===3 && j%2===0)?3:1;
      let col = (i===3 && j%2===0)?color(255,255,0):color(255,0,0);
      n2.agregarBloque(new Bloque(x, y, 50, 20, vida, col, 10, true));
    }
  }
  return n2;
}

function crear_nivel_3() {
  let n3 = new Nivel();
  velocidad_Bola = 13;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 17; j++) {
      let x = 10 + j*52;
      let y = altoUI + margenBloques + i*22;
      if (i===3 && (j===3||j===13)) {
        n3.agregarBloque(new Bloque(x, y, 50, 20, 1, color(147,147,147), 10, false));
      } else if (i===5 && j%2===0) {
        n3.agregarBloque(new Bloque(x, y, 50, 20, 3, color(255,255,0), 10, true));
      } else {
        n3.agregarBloque(new Bloque(x, y, 50, 20, 1, color(255,0,0), 10, true));
      }
    }
  }
  return n3;
}
