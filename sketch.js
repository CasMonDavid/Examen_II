let vidas = 3;
let velocidad_Bola = 7;
let puntuacion = 0;
let puntuacion_max = 0;
let nivel_actual;
let selector_de_nivel = 1; //VARIABLE PARA SABER QUE NIVEL SE JUEGA
let esta_sacando = true; //VARIABLE PARA SABER SI EL JUGADOR ESTA SACANDO

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
    this.x = paleta.x + (paleta.w/2)
    this.y = paleta.y - 15;
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
      esta_sacando = true;
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
    //this.x = constrain(mouseX - this.w / 2, 0, width - this.w);
    if (keyIsDown(LEFT_ARROW) == true){
      this.x -= 7;
      if (this.x < 0){
        this.x = 0;
      }
    }
    if (keyIsDown(RIGHT_ARROW) == true){
      this.x += 7;
      if (this.x > width - this.w){
        this.x = width - this.w;
      }
    }
    if (keyIsDown(UP_ARROW) == true){
      esta_sacando = false;
    }
  }
  
  mostrar(){
    fill("white")
    rect(this.x, this.y, this.w, this.h);
  }
}
let paleta = new Paleta(400,600,100,10);

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

  if (juego_terminado() == 1){ //EL JUEGO SIGUE CORRIENDO
    console.log("El juego sigue corriendo");
    paleta.mostrar();
    paleta.actualizar();
  
    movimiento_pelota();
  }else if (juego_terminado() == 2){ //EL JUGADOR ROMPIO TODOS LOS BLOQUES
    console.log("Se rompieron todos los bloques");
    pasar_nivel();
  }else if (juego_terminado() == 3){ // SE ACABARON LAS VIDAS DEL JUGADOR
    console.log("Se acabaron las vidas");
    reiniciar();
  }
}

function juego_terminado(){
  let count = 0;
  nivel_actual.bloques.forEach(bloque => {
    if (bloque.vida > 0){
      count++;
    }
  });

  //JUGADOR ROMPIO TODOS LOS BLOQUES
  if (count == 0){
    return 2;
  }

  //JUGADOR PERDIO TODAS SUS VIDAS
  if (vidas <= 0){
    return 3;
  }

  //EL JUEGO SIGUE CORRIENDO
  return 1;
}

function movimiento_pelota(){
  if (esta_sacando){// SI EL JUGADOR VA A SACAR LA PELOTA LO VA A SEGUIR
    pelotas[0].posicionar();
    pelotas[0].mostrar();
  }else{ // CASO CONTRARIO SEGUIRA SU RITMO
    pelotas.forEach(pelota => {
      pelota.actualizar();
      for (let i=0;i<nivel_actual.bloques.length;i++) {
        if (nivel_actual.bloques[i].vida > 0 && pelota.tocaBloque(nivel_actual.bloques[i])){
          if (nivel_actual.bloques[i].destructible){
            if (nivel_actual.bloques[i].vida == 1){
              puntuacion++;
            }
            nivel_actual.bloques[i].vida--;
          }
          break;
        }
      }
      nivel_actual.bloques.forEach(bloque => {
        
      });
  
      pelota.tocaPaleta(paleta);
  
      pelota.mostrar();
    });
  }
}

function reiniciar(){
  console.log("Toco reiniciar mi loco");
  pelotas = [];
  nivel_actual = crear_nivel_1();
  selector_de_nivel = 1;
  vidas = 3;
  console.log("Puntuacion: "+puntuacion+", Puntuacion max: "+puntuacion_max);
  puntuacion_max = (puntuacion > puntuacion_max)? puntuacion : puntuacion_max;
  puntuacion = 0;
}

function pasar_nivel(){
  selector_de_nivel++;
  esta_sacando = true;
  switch (selector_de_nivel) {
    case 2:
      nivel_actual = crear_nivel_2();
      break;
    case 3:
      nivel_actual = crear_nivel_3();
      break;
    case 4:
      //GANAR EL JUEGO O NIVELES INFINIOS O LO QUE SEA
      break;
    default: break;
  }
}

function crear_pelota(x, y){
  let pelota = new Bola(x, y, 20);
  pelotas.push(pelota);
}

function crear_nivel_1 (){
  let nivel1 = new Nivel();

  crear_pelota(width/2,height/2);

  // Crear bloques y agregarlos al nivel
  for (let i=0; i<4; i++){ // columnas
    for (let j=0; j<17; j++){// filas
      let bloque = new Bloque(10 + j*52, 10 + i*22, 50, 20, 1, color(255,0,0), 10, true);
      nivel1.agregarBloque(bloque);
    }
  }
  
  return nivel1;
}

function crear_nivel_2(){
  let nivel2 = new Nivel();
  let bloque;
  velocidad_Bola = 10;

  // Crear bloques y agregarlos al nivel
  for (let i=0; i<5; i++){
    for (let j=0; j<17; j++){
      if (i == 3 && (j%2)==0){
        bloque = new Bloque(10 + j*52, 10 + i*22, 50, 20, 3, color(255,255,0), 10, true);
      }else{
        bloque = new Bloque(10 + j*52, 10 + i*22, 50, 20, 1, color(255,0,0), 10, true);
      }
      nivel2.agregarBloque(bloque);
    }
  }
  
  return nivel2;
}

function crear_nivel_3(){
  let nivel3 = new Nivel();
  let bloque;
  velocidad_Bola = 13;

  // Crear bloques y agregarlos al nivel
  for (let i=0; i<6; i++){
    for (let j=0; j<17; j++){
      if (i == 3 && (j == 3 || j == 13)){
        bloque = new Bloque(10 + j*52, 10 + i*22, 50, 20, 1, color(147,147,147), 10, false);

      }else if (i == 5 && (j%2)==0){
        bloque = new Bloque(10 + j*52, 10 + i*22, 50, 20, 3, color(255,255,0), 10, true);
      }else{
        bloque = new Bloque(10 + j*52, 10 + i*22, 50, 20, 1, color(255,0,0), 10, true);
      }
      nivel3.agregarBloque(bloque);
    }
  }
  
  return nivel3;
}