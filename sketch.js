let vidas = 3;
let velocidad_Bola = 5;

class Bloque{
  constructor(x, y, w, h, vida, color, puntos, destructible){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vida = vida;
    this.color = color;
    this.puntos = puntos;
    this.destructible = destructible;
  }
  
  mostrar(){
    fill(this.color);
    strokeWeight(1);
    stroke("white");
    rect(this.x, this.y, this.w, this.h);
  }
}

class Nivel {
  constructor(){
    this.bloques = [];
  }
  
  agregarBloque(bloque){
    this.bloques.push(bloque);
  }
  
  mostrar(){
    for(let i = 0; i < this.bloques.length; i++){
      if (this.bloques[i].vida > 0){
        this.bloques[i].mostrar();
      }
    }
  }
}

class Bola {
  constructor(x, y, r){
    this.x = x;
    this.y = y;
    this.r = r;
    this.posicionar();
  }
  
  mostrar(){
    fill("white")
    strokeWeight(0);
    ellipse(this.x, this.y, this.r);
  }

  posicionar () {
    this.x = width / 2;
    this.y = height / 2;
    let angle = random(-PI / 4, -3 * PI / 4);
    this.xspeed = velocidad_Bola * cos(angle);
    this.yspeed = velocidad_Bola * sin(angle);
  }

  actualizar(){
    this.x += this.xspeed;
    this.y += this.yspeed;
    if (this.x < this.r || this.x > width - this.r) this.xspeed *= -1;
    if (this.y < this.r) this.yspeed *= -1;
    if (this.y > height + this.r) {
      vidas--;
      this.posicionar();
    }
  }

  tocaBloque(objetivo){
    let closestX = constrain(this.x, objetivo.x, objetivo.x + objetivo.w);
    let closestY = constrain(this.y, objetivo.y, objetivo.y + objetivo.h);
    let dx = this.x - closestX;
    let dy = this.y - closestY;
    if (dx * dx + dy * dy < this.r * this.r) {
      if (abs(dx) > abs(dy)) this.xspeed *= -1;
      else this.yspeed *= -1;
      return true;
    }
    return false;
  }

  tocaPaleta(objetivo){
    if (this.tocaBloque(objetivo)) {
      let hitPos = (this.x - (objetivo.x + objetivo.w / 2)) / (objetivo.w / 2);
      let angle = hitPos * PI / 3;
      this.xspeed = velocidad_Bola * sin(angle);
      this.yspeed = -velocidad_Bola * cos(angle);
      return true;
    }
    return false;
  }
}
let pelotas = [];

class Paleta {
  constructor(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  actualizar() {
    this.x = constrain(mouseX - this.w / 2, 0, width - this.w);
  }
  
  mostrar(){
    fill("white")
    rect(this.x, this.y, this.w, this.h);
  }
}
let paleta = new Paleta(400,600,100,10);

let nivel_actual;
let selector_de_nivel = 1;

function setup() {
  createCanvas(900, 700);
  nivel_actual = crear_nivel_1();
}

function draw() {
  background(0);
  frameRate(60);

  actualizar();
}

function actualizar(){
  nivel_actual.mostrar();

  paleta.mostrar();
  paleta.actualizar();

  movimiento_pelota();
}

function juego_terminado(){
  let count = 0;
  nivel_actual.bloques.forEach(bloque => {
    if (bloque.destructible){
      count++;
    }
  });

  //JUGADOR ROMPIO TODOS LOS BLOQUES
  if (count == 0){
    return 2;
  }

  //JUGADOR PERDIO TODAS SUS PELOTAS
  if (pelotas.length == 0){
    return 3;
  }

  //EL JUEGO SIGUE CORRIENDO
  return 1;
}

function movimiento_pelota(){
  pelotas.forEach(pelota => {
    pelota.actualizar();
    for (let i=0;i<nivel_actual.bloques.length;i++) {
      if (nivel_actual.bloques[i].vida > 0 && pelota.tocaBloque(nivel_actual.bloques[i])){
        nivel_actual.bloques[i].vida--;
        break;
      }
    }
    nivel_actual.bloques.forEach(bloque => {
      
    });

    pelota.tocaPaleta(paleta);

    pelota.mostrar();
  });
}

function reiniciar(){
  console.log("Toco reiniciar mi loco");
}

function crear_pelota(x, y){
  let pelota = new Bola(x, y, 20);
  pelotas.push(pelota);
}

function crear_nivel_1 (){
  let nivel1 = new Nivel();

  crear_pelota(width/2,height/2);

  // Crear bloques y agregarlos al nivel
  for (let i=0; i<3; i++){
    for (let j=0; j<17; j++){
      let bloque = new Bloque(10 + j*52, 10 + i*22, 50, 20, 1, color(255,0,0), 10, true);
      nivel1.agregarBloque(bloque);
    }
  }
  
  return nivel1;
}