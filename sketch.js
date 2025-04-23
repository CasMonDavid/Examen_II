class Bloque{
  constructor(x, y, w, h, vida, color, puntos, especial){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vida = vida;
    this.color = color;
    this.puntos = puntos;
    this.especial = especial;
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
    rect(this.x, this.y, this.w, this.h);
  }
}

let nivel_actual;

function setup() {
  createCanvas(900, 700);
  nivel_actual = crear_nivel_1();
}

function draw() {
  background(220);
  nivel_actual.mostrar();
}

function crear_nivel_1 (){
  let nivel1 = new Nivel();

  // Crear bloques y agregarlos al nivel
  for (let i=0; i<17; i++){
    for (let j=0; j<5; j++){
      let bloque = new Bloque(10 + i*52, 10 + j*22, 50, 20, 1, color(255,0,0), 10, false);
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