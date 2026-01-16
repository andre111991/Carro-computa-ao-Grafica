import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0xddeeff);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Luzes
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(100, 200, 300);
scene.add(directionalLight);

// 3. Câmera e Controlos
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 2000);

camera.up.set(0, 0, 1); 
camera.position.set(150, -150, 100); 

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 15);
controls.update();


const ListaCores = [0x00F5FF, 0xFF00FF, 0x7000FF, 0xFF5F1F, 0x39FF14, 0xFF3131];

function Colors(array) {
    return array[Math.floor(Math.random() * array.length)];
}

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
    // A geometria do cilindro é criada no eixo Y por padrão
    const geometry = new THREE.CylinderGeometry(8, 8, 15, 32);
    const texturaRoda = WheelTexture();
    const materiais = [
        new THREE.MeshLambertMaterial({ color: 0xddeeff }), // Lateral do pneu
        new THREE.MeshLambertMaterial({ map: texturaRoda }), // Face externa
        new THREE.MeshLambertMaterial({ map: texturaRoda })  // Face interna
    ];
    const wheel = new THREE.Mesh(geometry, materiais);
    
    // Rotacionamos a malha para que ela fique virada para o lado
    // No sistema Z-up, rotacionamos no eixo Y para ficar de lado
    wheel.rotation.y = Math.PI / 2;
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
    context.fillRect(0, 0, 256, 64);

    context.fillStyle = "#333333";
    context.fillRect(15, 10, 100, 44);
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
    context.font = "bold 20px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 64, 20);
    
    return new THREE.CanvasTexture(canvas);
}

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
        { x: wheelX, y: wheelY }, { x: wheelX, y: -wheelY },
        { x: -wheelX, y: wheelY }, { x: -wheelX, y: -wheelY }
    ];

    wheelPositions.forEach((pos) => {
        const wheel = Wheel();
        
        // 1. Primeiro, deitamos o cilindro no eixo X
        wheel.rotation.x = Math.PI / 2;
        
        // 2. Agora, rodamos 90 graus no eixo Z (que é o seu eixo "Cima")
        // Isso faz com que as jantes fiquem viradas para os lados do carro
        wheel.rotation.z = Math.PI / 2;

        wheel.position.set(pos.x, pos.y, 8);
        car.add(wheel);
    });

    // 4. Capô
    const hoodLength = 34;
    const hoodPivot = new THREE.Group();
    hoodPivot.position.set(15.5, 0, 28); 
    
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(hoodLength, 48, 2), 
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    hood.position.set(hoodLength / 2, 0, 0);
    hoodPivot.add(hood);
    car.add(hoodPivot);

    // 5. Portas
    const leftDoorGroup = new THREE.Group();
    const leftDoorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(40, 1.5, 15), 
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    leftDoorMesh.position.set(-20, 0, 7.5); 
    leftDoorGroup.add(leftDoorMesh);
    leftDoorGroup.position.set(15, 25, 12);
    car.add(leftDoorGroup);

    const rightDoorGroup = new THREE.Group();
    const rightDoorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(40, 1.5, 15),
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    rightDoorMesh.position.set(-20, 0, 7.5);
    rightDoorGroup.add(rightDoorMesh);
    rightDoorGroup.position.set(15, -25, 12);
    car.add(rightDoorGroup);

    // 6. Faróis na frente do carro
    const farolGeometry = new THREE.SphereGeometry(4, 16, 16);
    const farolMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffaa,
        emissive: 0xffff00,
        emissiveIntensity: 0.3
    });
    
    // Farol esquerdo
    const farolEsquerdo = new THREE.Mesh(farolGeometry, farolMaterial);
    farolEsquerdo.position.set(50, -18, 20);
    car.add(farolEsquerdo);
    
    //Farol direito
    const farolDireito = new THREE.Mesh(farolGeometry, farolMaterial);
    farolDireito.position.set(50, 18, 20);
    car.add(farolDireito);

    // 7. Matrícula da frente
    const matriculadaFrenteTextura = texturaMatriculas("84-57-OM");
    const matriculaFrente = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 8),
        new THREE.MeshLambertMaterial({ map: matriculadaFrenteTextura })
    );
    matriculaFrente.position.set(50.5, 0, 12); // Frente do carro, centro, abaixo dos faróis
    matriculaFrente.rotation.y = Math.PI / 2; // Rodar para ficar virado para a frente
    matriculaFrente.rotation.z = Math.PI / 2; // Rodar 90 graus no eixo Z
    car.add(matriculaFrente);

    // 8. Matrícula de trás
    const matriculadaTrasTextura = texturaMatriculas("84-57-OM");
    const matriculaTras = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 8),
        new THREE.MeshLambertMaterial({ map: matriculadaTrasTextura })
    );
    matriculaTras.position.set(-50.5, 0, 12); // Trás do carro, centro
    matriculaTras.rotation.y = -Math.PI / 2; // Rodar para ficar virado para trás
    matriculaTras.rotation.z = Math.PI / 2 + Math.PI; // Rodar 90 graus + 180 graus (total 270 graus) no eixo Z
    car.add(matriculaTras);

    // 9. Escovas de limpa-vidros (base fixa no capô, parte superior roda)
    const wiperMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    // Escova esquerda
    const leftWiperBase = new THREE.Group();

    leftWiperBase.position.set(13, -15, 32); // Ligeiramente para fora
    leftWiperBase.rotation.y = Math.PI / 2; // Virado para a frente
    
    // Base fixa (parte inferior que fica fixa no capô)
    const leftWiperBaseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 3), // Base pequena fixa
        wiperMaterial
    );
    leftWiperBaseMesh.position.z = 1.5; // Base na parte inferior
    leftWiperBase.add(leftWiperBaseMesh);
    
    // Grupo para a parte superior que roda (pivot na base)
    const leftWiperRotating = new THREE.Group();
    leftWiperRotating.position.z = 3; // Pivot na parte superior da base
    leftWiperBase.add(leftWiperRotating);
    
    // Parte superior da escova que roda
    const leftWiperTop = new THREE.Mesh(
        new THREE.BoxGeometry(20, 2, 0.5), // Parte superior da escova
        wiperMaterial
    );
    leftWiperTop.position.z = 0; // Começa na posição da base
    leftWiperRotating.add(leftWiperTop);
    
    car.add(leftWiperBase);

    // Escova direita
    const rightWiperBase = new THREE.Group();

    rightWiperBase.position.set(13, 15, 32); 
    rightWiperBase.rotation.y = Math.PI / 2; 
    
    // Base fixa (parte inferior que fica fixa no capô)
    const rightWiperBaseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 3), // Base pequena fixa
        wiperMaterial
    );
    rightWiperBaseMesh.position.z = 1.5; // Base na parte inferior
    rightWiperBase.add(rightWiperBaseMesh);
    
    // Grupo para a parte superior que roda (pivot na base)
    const rightWiperRotating = new THREE.Group();
    rightWiperRotating.position.z = 3; // Pivot na parte superior da base
    rightWiperBase.add(rightWiperRotating);
    
    // Parte superior da escova que roda
    const rightWiperTop = new THREE.Mesh(
        new THREE.BoxGeometry(20, 2, 0.5), // Parte superior da escova
        wiperMaterial
    );
    rightWiperTop.position.z = 0; // Começa na posição da base
    rightWiperRotating.add(rightWiperTop);
    
    car.add(rightWiperBase);

    return {
        mesh: car,
        leftDoor: leftDoorGroup,
        rightDoor: rightDoorGroup,
        hoodPivot: hoodPivot,
        leftWiperRotating: leftWiperRotating,
        rightWiperRotating: rightWiperRotating,
    };
}
// 6. Instanciar e Animar
const carData = Car();
scene.add(carData.mesh);

// 7. Controlo do Capô e Portas
let hoodOpen = false;
const maxHoodAngle = Math.PI * 0.4; //70 graus

let doorsOpen = false;
const maxDoorAngle = Math.PI * 0.4; //70 graus

document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'c') {
        hoodOpen = !hoodOpen;
    }
    if (event.key.toLowerCase() === 'p') {
        doorsOpen = !doorsOpen;
    }
});

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.003;

    // Portas abrem/fecham com a tecla "p" (abrem para fora)
    const targetDoorAngle = doorsOpen ? maxDoorAngle : 0;
    // Interpolação suave para movimento natural
    carData.leftDoor.rotation.z = THREE.MathUtils.lerp(
        carData.leftDoor.rotation.z,
        -targetDoorAngle, // Negativo para abrir para fora
        0.1
    );
    carData.rightDoor.rotation.z = THREE.MathUtils.lerp(
        carData.rightDoor.rotation.z,
        targetDoorAngle, // Positivo para abrir para fora
        0.1
    );
    
    // Capô abre/fecha com a tecla "c" (abre em direção à frente do carro)
    const targetHoodAngle = hoodOpen ? maxHoodAngle : 0;
    // Interpolação suave para movimento natural
    // Rotação no eixo Y para abrir para a frente do carro (não para o lado)
    carData.hoodPivot.rotation.y = THREE.MathUtils.lerp(
        carData.hoodPivot.rotation.y, 
        -targetHoodAngle, // Negativo para abrir para fora (contrário de dentro)
        0.1
    );
    
    // Animação das escovas de limpa-vidros (movimento de vaivém em arco)
    const wiperSpeed = time * 1.5; // Velocidade das escovas
    // Movimento de vaivém: sin vai de -1 a 1, criando movimento cíclico
    const wiperSin = Math.sin(wiperSpeed);
    // O movimento vai de -máximo a +máximo, criando o vaivém em arco
    // Apenas a parte superior da escova roda (a base fica fixa no capô)
    const maxAngle = 0.85; // ~49 graus
    
    // Escova esquerda - apenas a parte superior roda (a base fica fixa)
    carData.leftWiperRotating.rotation.z = wiperSin * maxAngle;
    
    // Escova direita - movimento igual à esquerda (ambas na mesma direção)
    carData.rightWiperRotating.rotation.z = wiperSin * maxAngle;
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});