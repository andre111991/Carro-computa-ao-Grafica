import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Configuração da Cena e Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xddeeff); // Um cinza escuro ajuda a ver melhor as sombras

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Melhora a nitidez em ecrãs Retina/4K
document.body.appendChild(renderer.domElement);

// 2. Luzes
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(100, 200, 300); // Ajustado para iluminar melhor de cima
scene.add(directionalLight);

// 3. Câmera e Controlos
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 2000);

camera.up.set(0, 0, 1); 
camera.position.set(150, -150, 100); 

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Torna o movimento suave
controls.target.set(0, 0, 15); // Olha para o centro da cabine
controls.update();


// 4. Funções de Textura e Utilitários
const ListaCores = [0x00F5FF, 0xFF00FF, 0x7000FF, 0xFF5F1F, 0x39FF14, 0xFF3131];

function Colors(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function FrontTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128; // Dobrada a resolução
    canvas.height = 64;
    const context = canvas.getContext("2d");

    // Fundo (Cor do carro/Estrutura)
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 128, 64);

    // Vidro (Janela)
    context.fillStyle = "#333333";
    // x, y, largura, altura
    context.fillRect(10, 10, 108, 44); 
    
    return new THREE.CanvasTexture(canvas);
}

function SideTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256; // Aumentado para manter nitidez
    canvas.height = 64;
    const context = canvas.getContext("2d");

    // Fundo
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 256, 64);

    // Janela 1 (Frente)
    context.fillStyle = "#333333";
    context.fillRect(15, 10, 100, 44);

    // Janela 2 (Trás)
    context.fillRect(130, 10, 110, 44);

    return new THREE.CanvasTexture(canvas);
}

function WheelTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");

    // Pneu (Fundo Preto)
    context.fillStyle = "#111111";
    context.fillRect(0, 0, 128, 128);

    // Jante (Círculo Cinza)
    context.beginPath();
    context.arc(64, 64, 45, 0, Math.PI * 2);
    context.fillStyle = "#666666";
    context.fill();

    // Detalhe central (Círculo mais escuro)
    context.beginPath();
    context.arc(64, 64, 10, 0, Math.PI * 2);
    context.fillStyle = "#333333";
    context.fill();

    return new THREE.CanvasTexture(canvas);
}

function Wheel() {
    const geometry = new THREE.CylinderGeometry(8, 8, 15, 32);
    const texturaRoda = WheelTexture();

    const materiais = [
        new THREE.MeshLambertMaterial({ color: 0x111111 }), // Lateral (pneu)
        new THREE.MeshLambertMaterial({ map: texturaRoda }), // Topo (jante)
        new THREE.MeshLambertMaterial({ map: texturaRoda })  // Base (jante)
    ];

    const wheel = new THREE.Mesh(geometry, materiais);
    return wheel;
}

function Car() {
    const car = new THREE.Group();
    const CorCarro = Colors(ListaCores);

    // 1. Corpo Principal (Chassi)
    // Subi o chassi para Z=18 para dar espaço às rodas em baixo
    const main = new THREE.Mesh(
        new THREE.BoxGeometry(100, 50, 20),
        new THREE.MeshLambertMaterial({ color: CorCarro })
    );
    main.position.z = 18; 
    car.add(main);

    // 2. Cabine
    const TexturaFrenteCarro = FrontTexture();
    TexturaFrenteCarro.center.set(0.5, 0.5);
    TexturaFrenteCarro.rotation = Math.PI / 2;

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(55, 45, 20), [
        new THREE.MeshLambertMaterial({ map: TexturaFrenteCarro }),
        new THREE.MeshLambertMaterial({ map: FrontTexture() }),
        new THREE.MeshLambertMaterial({ map: SideTexture() }),
        new THREE.MeshLambertMaterial({ map: SideTexture() }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }), 
        new THREE.MeshLambertMaterial({ color: 0xffffff })  
    ]);
    cabin.position.set(-12, 0, 38); // Acompanha a subida do chassi
    car.add(cabin);

    // 3. RODAS (Ajustadas para baixo)
    const wheelX = 38; 
    const wheelY = 22; 
    const wheelPositions = [
        { x: wheelX, y: wheelY }, { x: wheelX, y: -wheelY },
        { x: -wheelX, y: wheelY }, { x: -wheelX, y: -wheelY }
    ];

    wheelPositions.forEach(pos => {
        const wheel = Wheel();
        // Z menor faz a roda ficar mais para baixo em relação ao corpo
        // Em 7.5 ela toca o ponto zero da cena
        wheel.position.set(pos.x, pos.y, 7.5); 
        car.add(wheel);
    });

    // 4. Capô (Acompanha a altura do chassi)
    const hoodLength = 34; 
    const hoodGroup = new THREE.Group();
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(hoodLength, 48, 2), 
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    
    hood.position.x = hoodLength / 2;
    hoodGroup.add(hood);
    hoodGroup.position.set(15.5, 0, 28); // Ajustado para o topo do chassi
    car.add(hoodGroup);

    // 5. Portas (Ajustadas para a nova altura do chassi)
    const doorYPos = 25;
    const doorZPos = 10; // Subiu junto com o chassi

    const leftDoorGroup = new THREE.Group();
    const leftDoor = new THREE.Mesh(
        new THREE.BoxGeometry(40, 1.5, 15), 
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    leftDoor.position.set(-20, 0, 7.5); 
    leftDoorGroup.add(leftDoor);
    leftDoorGroup.position.set(15, doorYPos, doorZPos);
    car.add(leftDoorGroup);

    const rightDoorGroup = new THREE.Group();
    const rightDoor = new THREE.Mesh(
        new THREE.BoxGeometry(40, 1.5, 15),
        new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    rightDoor.position.set(-20, 0, 7.5);
    rightDoorGroup.add(rightDoor);
    rightDoorGroup.position.set(15, -doorYPos, doorZPos);
    car.add(rightDoorGroup);

    return car;
}

// 6. Adicionar à Cena e Animar
const playerCar = Car();
scene.add(playerCar);



function animate() {
    requestAnimationFrame(animate);
    
    // Atualiza os controlos (necessário para o damping/suavização)
    controls.update();
    
    renderer.render(scene, camera);
}

animate();

// Ajuste de janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});