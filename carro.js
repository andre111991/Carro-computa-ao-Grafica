import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xddeeff);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ...................................................................Luzes

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // ambientlight ilumina todos os objetos igualmente
scene.add(ambientLight);                                    // sem sombras

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // luz direcional simula o sol
directionalLight.position.set(100, 200, 300);                   // cria sombras e profundidade, mas nao deu tempo          
scene.add(directionalLight);

// ......................................... Câmera e Controlos

const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 2000);

camera.up.set(0, 0, 1); 
camera.position.set(150, -150, 100); 

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 15);
controls.update();

//..............................................................Carro cores 

const ListaCores = [0x00F5FF, 0xFF00FF, 0x7000FF, 0xFF5F1F, 0x39FF14, 0xFF3131];

function Colors(array) {
    return array[Math.floor(Math.random() * array.length)];
}

//...............................................texturas e rodas...........

function WheelTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    context.fillStyle = "#111111";
    context.fillRect(0, 0, 128, 128);
    context.beginPath();
    context.arc(64, 64, 45, 0, Math.PI * 2);
    context.fillStyle = "#666666";
    context.fill();
    return new THREE.CanvasTexture(canvas);
}

function Wheel() {
    
    const geometry = new THREE.CylinderGeometry(8, 8, 15, 32);
    const texturaRoda = WheelTexture();
    const materiais = [
        new THREE.MeshLambertMaterial({ color: 0x000000 }), // Lateral do pneu
        new THREE.MeshLambertMaterial({ map: texturaRoda }), // Lado Esquerdo
        new THREE.MeshLambertMaterial({ map: texturaRoda })  // Lado Direito
    ];
    const wheel = new THREE.Mesh(geometry, materiais);
    
    wheel.rotation.y = Math.PI / 2; 
    wheel.rotation.x = Math.PI / 2; // rotaçoes na roda sobre ela mesma
    wheel.rotation.z = Math.PI / 2;
    return wheel;
}

function FrontTexture() {
    const canvas = document.createElement("canvas");

    canvas.width = 128;
     canvas.height = 64;

    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 128, 64);

    context.fillStyle = "#333333";
    context.fillRect(10, 10, 108, 44); 
    
    return new THREE.CanvasTexture(canvas);
}

function SideTexture() {
    const canvas = document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 64;

    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 256, 64); // retangulo branco (base)

    context.fillStyle = "#333333"; // a cor para cinza escuro
    context.fillRect(15, 10, 100, 44); // Retângulo cinza das janelas
    context.fillRect(130, 10, 110, 44);

    return new THREE.CanvasTexture(canvas);
}

function texturaMatriculas(text = "84-57-OM") {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 40;

    const context = canvas.getContext("2d");
    
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 128, 40);
    
    context.strokeStyle = "#003399";
    context.lineWidth = 3;
    context.strokeRect(2, 2, 124, 36);
    
    context.fillStyle = "#000000";
    context.font = "bold 20px Arial"; //texto em negrito 20px Arial
    context.textAlign = "center"; //alinhamento horizontal
    context.textBaseline = "middle"; // alinhamento vertical
    context.fillText(text, 64, 20);
    
    return new THREE.CanvasTexture(canvas);
}

// ..............................................................Carro montagem

function Car() {
    const car = new THREE.Group();
    const CorCarro = Colors(ListaCores);

    // 1. Corpo Principal
    const main = new THREE.Mesh(
        new THREE.BoxGeometry(100, 50, 20),
        new THREE.MeshLambertMaterial({ color: CorCarro })
    );
    main.position.z = 18; 
    car.add(main);

    
    const TexturaFrenteCarro = FrontTexture();
    TexturaFrenteCarro.center.set(0.5, 0.5);
    TexturaFrenteCarro.rotation = Math.PI / 2;

    const TexturaTrasCarro = FrontTexture();
    TexturaTrasCarro.center.set(0.5, 0.5); 
    TexturaTrasCarro.rotation = -Math.PI / 2;

    const TexturaLadoEsquerdoCarro = SideTexture();
    TexturaLadoEsquerdoCarro.flipY = false;

    const TexturaLadoDireitoCarro = SideTexture();
    
    const materiaisCabine = [
        new THREE.MeshLambertMaterial({ map: TexturaFrenteCarro }),         // Frente
        new THREE.MeshLambertMaterial({ map: TexturaTrasCarro }),           // Trás
        new THREE.MeshLambertMaterial({ map: TexturaLadoEsquerdoCarro }),   // Esquerda
        new THREE.MeshLambertMaterial({ map: TexturaLadoDireitoCarro }),    // Direita
        new THREE.MeshLambertMaterial({ color: 0xffffff }),                 // Teto
        new THREE.MeshLambertMaterial({ color: CorCarro })                  // Base
    ];

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(55, 45, 20), materiaisCabine);
    cabin.position.set(-12, 0, 38);
    car.add(cabin);


    const wheelX = 35; 
    const wheelY = 25; 
    const wheelPositions = [
        { x: wheelX, y: wheelY }, // frente direita
        { x: wheelX, y: -wheelY }, // trás direita
        { x: -wheelX, y: wheelY }, // frente esquerda
        { x: -wheelX, y: -wheelY } // trás esquerda
    ];

    wheelPositions.forEach((pos) => {
        const wheel = Wheel();

        wheel.position.set(pos.x, pos.y, 8);
        car.add(wheel);
    });


    const hoodPivot = new THREE.Group();
    hoodPivot.position.set(15.5, 0, 28); 
    
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(34, 48, 2), 
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    hood.position.set(17, 0, 0);
    hoodPivot.add(hood);
    car.add(hoodPivot);

    
    const leftDoorGroup = new THREE.Group();
    const leftDoor = new THREE.Mesh(
        new THREE.BoxGeometry(40, 1.5, 15), 
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );

    leftDoor.position.set(-20, 0, 7.5); // posiçao da porta relativa ao grupo 
    leftDoorGroup.add(leftDoor);
    leftDoorGroup.position.set(15, 25, 12); // posiçao do grupo e relativa ao centro do carro
    car.add(leftDoorGroup);

    const rightDoorGroup = new THREE.Group();
    const rightDoor = new THREE.Mesh(
        new THREE.BoxGeometry(40, 1.5, 15),
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );

    rightDoor.position.set(-20, 0, 7.5);
    rightDoorGroup.add(rightDoor);
    rightDoorGroup.position.set(15, -25, 12);
    car.add(rightDoorGroup);

    const farolGeometry = new THREE.SphereGeometry(4, 16, 16);
    const farolMaterial = new THREE.MeshPhongMaterial({ // reage com luz
        color: 0xffffaa, //cor base do farol
        emissive: 0xffff00, // cor da luz emitida
        emissiveIntensity: 0.3 //intensidade do brilho
    });


    const farolEsquerdo = new THREE.Mesh(farolGeometry, farolMaterial);
    farolEsquerdo.position.set(50, -18, 20);
    car.add(farolEsquerdo);
    

    const farolDireito = new THREE.Mesh(farolGeometry, farolMaterial);
    farolDireito.position.set(50, 18, 20);
    car.add(farolDireito);


    const matriculadaFrenteTextura = texturaMatriculas("84-57-OM");
    const matriculaFrente = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 8),
        new THREE.MeshLambertMaterial({ map: matriculadaFrenteTextura })
    );

    matriculaFrente.position.set(50.5, 0, 12); // Frente do carro, centro, abaixo dos faróis
    matriculaFrente.rotation.y = Math.PI / 2; // Rodar para ficar virado para a frente
    matriculaFrente.rotation.z = Math.PI / 2; // Rodar 90 graus no eixo Z
    car.add(matriculaFrente);


    const matriculadaTrasTextura = texturaMatriculas("84-57-OM");
    const matriculaTras = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 8),
        new THREE.MeshLambertMaterial({ map: matriculadaTrasTextura })
    );

    matriculaTras.position.set(-50.5, 0, 12); // Trás do carro, centro
    matriculaTras.rotation.y = -Math.PI / 2; // Rodar para ficar virado para trás
    matriculaTras.rotation.z = Math.PI / 2 + Math.PI; //270 graus no eixo Z
    car.add(matriculaTras);

 
    const wiperMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    // Escova esquerda
    const leftWiperBase = new THREE.Group();

    leftWiperBase.position.set(13, -15, 32); // Ligeiramente para fora
    leftWiperBase.rotation.y = Math.PI / 2; // Virado para a frente
    
    //Base 
    const leftWiperBaseMesh = new THREE.Mesh( //base pregada ao carro
        new THREE.BoxGeometry(0.5, 0.5, 3), 
        wiperMaterial
    );
    leftWiperBaseMesh.position.z = 1.5; // Base na parte inferior
    leftWiperBase.add(leftWiperBaseMesh);
    
    // Grupo para a parte superior que roda (pivot na base)
    const leftWiperRotating = new THREE.Group(); // Tudo o que estiver aqui dentro vai girar a partir deste ponto
    leftWiperRotating.position.z = 3; // sem geometria, apenas o ponto de rotação
    leftWiperBase.add(leftWiperRotating);
    
    // Parte superior da escova tamanho e material
    const leftWiperTop = new THREE.Mesh(
        new THREE.BoxGeometry(20, 2, 0.5), // Parte superior da escova
        wiperMaterial
    );
    leftWiperTop.position.z = 0;
    leftWiperRotating.add(leftWiperTop);

    // dava para por o top e o rotating juntos mas teria de usar .geometry.translate, fiz assim pois se quisesse aumentar a escova era mais facil ou o ponto de rotaçao
    
    car.add(leftWiperBase);

    // Escova direita
    const rightWiperBase = new THREE.Group();

    rightWiperBase.position.set(13, 15, 32); 
    rightWiperBase.rotation.y = Math.PI / 2; 
    
    
    const rightWiperBaseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 3),
        wiperMaterial
    );
    rightWiperBaseMesh.position.z = 1.5; 
    rightWiperBase.add(rightWiperBaseMesh);
    
    
    const rightWiperRotating = new THREE.Group();
    rightWiperRotating.position.z = 3; 
    rightWiperBase.add(rightWiperRotating);
    
    // Parte superior da escova que roda
    const rightWiperTop = new THREE.Mesh(
        new THREE.BoxGeometry(20, 2, 0.5), 
        wiperMaterial
    );
    rightWiperTop.position.z = 0; 
    rightWiperRotating.add(rightWiperTop);
    
    car.add(rightWiperBase);

    return { //foi feito assim para facilitar a animaçao das portas e capo e escovas
        mesh: car, //pai
        leftDoor: leftDoorGroup,
        rightDoor: rightDoorGroup,
        hoodPivot: hoodPivot,                   //filhos
        leftWiperRotating: leftWiperRotating,
        rightWiperRotating: rightWiperRotating,
    };
}
//.............................................................logica
const carro = Car();
scene.add(carro.mesh);


let hoodOpen = false;
let doorsOpen = false;

const maxHoodAngle = Math.PI * 0.4; //70 graus
const maxDoorAngle = Math.PI * 0.4; //70 graus

document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'c') {
        hoodOpen = !hoodOpen; //capo aberto passa para fechado
    }
    if (event.key.toLowerCase() === 'p') {
        doorsOpen = !doorsOpen; //Portas abertas passam para fechado
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.003; //usei para animaçao das escovas para nao ter de escrever escova vai para a direita(angulo) 
    //quando chegar a direita vais ate a esquerda(angulo negativo)

    let targetDoorAngle;

    if (doorsOpen === true) {
        targetDoorAngle = maxDoorAngle; // Abre a porta até ao ângulo máximo
    } else {
        targetDoorAngle = 0;  // Fecha a porta (ângulo zero)
    } 

    // Interpolação - vai do angulo atual,no caso 0, para o angulo alvo (maxDoorAngle(70) ou 0)
    carro.leftDoor.rotation.z = THREE.MathUtils.lerp( //lerp(valor atual, valor alvo, velocidade) lerp do three.js
        carro.leftDoor.rotation.z, 
        -targetDoorAngle, // Negativo para abrir para fora
        0.1
    );
    
    carro.rightDoor.rotation.z = THREE.MathUtils.lerp( //O lerp é a fórmula matemática que calcula onde o objeto deve estar em cada frame dessa animação
        carro.rightDoor.rotation.z,
        targetDoorAngle, // Positivo para abrir para fora
        0.1
    );
    
    
    let targetHoodAngle;

    if (hoodOpen === true) {
        targetHoodAngle = maxHoodAngle;
    } else {
        targetHoodAngle = 0;
    }
    
    carro.hoodPivot.rotation.y = THREE.MathUtils.lerp(
        carro.hoodPivot.rotation.y, 
        -targetHoodAngle, 
        0.1
    );
    
    
    const wiperSpeed = time * 1.5; // Velocidade das escovas
    const wiperSin = Math.sin(wiperSpeed); //funçao seno, tanto faz ser seno como cosseno, so quero um valor que oscile entre -1 e 1
    const maxAngle = 0.85; // 49 graus
    
    // Escova esquerda - apenas a parte superior roda (a base fica fixa)
    carro.leftWiperRotating.rotation.z = wiperSin * maxAngle;
    
    // Escova direita - movimento igual à esquerda (ambas na mesma direção)
    carro.rightWiperRotating.rotation.z = wiperSin * maxAngle;
    
    controls.update();
    renderer.render(scene, camera);
}

animate();