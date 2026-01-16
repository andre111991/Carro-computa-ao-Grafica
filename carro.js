import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Configuração da Cena e Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xddeeff);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
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

// 4. Funções de Textura
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
        new THREE.MeshLambertMaterial({ color: 0x111111 }), // Lateral do pneu
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
    canvas.width = 128; canvas.height = 64;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 128, 64);
    context.fillStyle = "#333333";
    context.fillRect(10, 10, 108, 44); 
    return new THREE.CanvasTexture(canvas);
}

function SideTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256; canvas.height = 64;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 256, 64);
    context.fillStyle = "#333333";
    context.fillRect(15, 10, 100, 44);
    context.fillRect(130, 10, 110, 44);
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

    // 2. Configuração das Texturas da Cabine
    const TexturaFrenteCarro = FrontTexture();
    TexturaFrenteCarro.center.set(0.5, 0.5);
    TexturaFrenteCarro.rotation = Math.PI / 2;

    const TexturaTrasCarro = FrontTexture();
    TexturaTrasCarro.center.set(0.5, 0.5); 
    TexturaTrasCarro.rotation = -Math.PI / 2;

    const TexturaLadoEsquerdoCarro = SideTexture();
    TexturaLadoEsquerdoCarro.flipY = false;

    const TexturaLadoDireitoCarro = SideTexture();
    // Se precisares de ajustar o lado direito especificamente:
    // TexturaLadoDireitoCarro.flipY = false; 

    // Mapeamento de Materiais (Z-UP):
    // faces: 0: Frente(+X), 1: Trás(-X), 2: Esquerda(+Y), 3: Direita(-Y), 4: Cima(+Z), 5: Baixo(-Z)
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

    // 3. Rodas (Cilindros na Vertical)
    // 3. Rodas (Corrigidas para ficarem viradas para os lados)
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
    const doorYPos = 25;
    const doorZPos = 12;

    const leftDoorGroup = new THREE.Group();
    const leftDoorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(40, 1.5, 15), 
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    leftDoorMesh.position.set(-20, 0, 7.5); 
    leftDoorGroup.add(leftDoorMesh);
    leftDoorGroup.position.set(15, doorYPos, doorZPos);
    car.add(leftDoorGroup);

    const rightDoorGroup = new THREE.Group();
    const rightDoorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(40, 1.5, 15),
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    rightDoorMesh.position.set(-20, 0, 7.5);
    rightDoorGroup.add(rightDoorMesh);
    rightDoorGroup.position.set(15, -doorYPos, doorZPos);
    car.add(rightDoorGroup);

    return {
        mesh: car,
        leftDoor: leftDoorGroup,
        rightDoor: rightDoorGroup,
        hoodPivot: hoodPivot,
    };
}
// 6. Instanciar e Animar
const carData = Car();
scene.add(carData.mesh);

// 7. Controlo do Capô
let hoodOpen = false;
const maxHoodAngle = Math.PI * 0.4; // ~70 graus

document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'c') {
        hoodOpen = !hoodOpen;
    }
});

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.003;
    const angle = (Math.sin(time) + 1) * 0.5; // Varia de 0 a 1 radiano aproximadamente

    // Portas abrem para fora
    carData.leftDoor.rotation.z = -angle; 
    carData.rightDoor.rotation.z = angle;
    
    // Capô abre/fecha com a tecla "c" (abre em direção à frente do carro)
    const targetHoodAngle = hoodOpen ? maxHoodAngle : 0;
    // Interpolação suave para movimento natural
    // Rotação no eixo Y para abrir para a frente do carro (não para o lado)
    carData.hoodPivot.rotation.y = THREE.MathUtils.lerp(
        carData.hoodPivot.rotation.y, 
        -targetHoodAngle, // Negativo para abrir para fora (contrário de dentro)
        0.1
    );
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});