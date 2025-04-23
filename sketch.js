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
    strokeWeight(0);
    stroke("black");
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
      this.bloques[i].mostrar();
    }
  }
}

class Bola {
  constructor(x, y, r){
    this.x = x;
    this.y = y;
    this.r = r; 
  }
  
  mostrar(){
    ellipse(this.x, this.y, this.r);
  }

  toca(objetivo){
    if ((this.x-(this.d/2)) < objetivo.x + objetivo.w &&
        (this.x+(this.d/2)) > objetivo.x &&
        (this.y-(this.d/2)) < objetivo.y + objetivo.h &&
        (this.y+(this.d/2)) > objetivo.y) {
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
let paleta = new Paleta(425,600,50,10);

let nivel_actual;
let selector_de_nivel = 1;

function setup() {
  createCanvas(900, 700);
  nivel_actual = crear_nivel_1();
  crear_pelota(425,580);
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

  if (juego_terminado == 1){
    console.log("El juego CONTINUA");
  }else if (juego_terminado == 2){
    console.log("El juego FUE VENCIDO");
  }else{
    console.log("El juego SE ACABO");
  }

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
    pelota.x+=1;
    pelota.y+=4;
    pelota.mostrar();
  });
}

function crear_pelota(x, y){
  let pelota = new Bola(x, y, 10);
  pelotas.push(pelota);
}

function crear_nivel_1 (){
  let nivel1 = new Nivel();

  // Crear bloques y agregarlos al nivel
  for (let i=0; i<17; i++){
    for (let j=0; j<5; j++){
      let bloque = new Bloque(10 + i*52, 10 + j*22, 50, 20, 1, color(255,0,0), 10, true);
      nivel1.agregarBloque(bloque);
    }
  }
  
  return nivel1;
}

// Ball con colisiones optimizadas
class Ball {
  constructor() {
    this.r = 10;
    this.reset();
  }
  reset() {
    this.x = width / 2;
    this.y = height / 2;
    let angle = random(-PI/4, -3*PI/4);
    this.xspeed = ballSpeed * cos(angle);
    this.yspeed = ballSpeed * sin(angle);
  }
  update() {
    this.x += this.xspeed;
    this.y += this.yspeed;
    // Rebotar en paredes
    if (this.x < this.r || this.x > width - this.r) this.xspeed *= -1;
    if (this.y < this.r) this.yspeed *= -1;
    // Caer fuera de pantalla
    if (this.y > height + this.r) {
      lives--;
      this.reset();
    }
  }
  display() {
    fill(255);
    ellipse(this.x, this.y, this.r * 2);
  }
  // Colisión genérica con rectángulo
  collideRect(rect) {
    let closestX = constrain(this.x, rect.x, rect.x + rect.w);
    let closestY = constrain(this.y, rect.y, rect.y + rect.h);
    let dx = this.x - closestX;
    let dy = this.y - closestY;
    if (dx * dx + dy * dy < this.r * this.r) {
      // Determinar colisión lateral o vertical
      if (abs(dx) > abs(dy)) this.xspeed *= -1;
      else this.yspeed *= -1;
      return true;
    }
    return false;
  }
  // Colisión especializada con paddle para ángulo dinámico
  collidePaddle(p) {
    if (this.collideRect(p)) {
      // Calcular punto de impacto para ajustar ángulo
      let hitPos = (this.x - (p.x + p.w / 2)) / (p.w / 2);
      let angle = hitPos * PI / 3; // rango -60° a 60°
      this.xspeed = ballSpeed * sin(angle);
      this.yspeed = -ballSpeed * cos(angle);
      return true;
    }
    return false;
  }
}