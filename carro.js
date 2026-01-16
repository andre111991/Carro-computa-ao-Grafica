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
    canvas.width = 64; canvas.height = 32;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff"; context.fillRect(0, 0, 64, 32);
    context.fillStyle = "#666666"; context.fillRect(8, 8, 48, 24);
    return new THREE.CanvasTexture(canvas);
}

function SideTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128; canvas.height = 32;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff"; context.fillRect(0, 0, 128, 32);
    context.fillStyle = "#666666"; context.fillRect(10, 8, 38, 24);
    context.fillRect(58, 8, 60, 24);
    return new THREE.CanvasTexture(canvas);
}

function Wheel() {
    return new THREE.Mesh(
        new THREE.BoxGeometry(12, 33, 12),
        new THREE.MeshLambertMaterial({ color: 0x333333 })
    );
}

// 5. Construção do Carro
function Car() {
    const car = new THREE.Group();
    const CorCarro = Colors(ListaCores);

    // Corpo Principal
    const main = new THREE.Mesh(
        new THREE.BoxGeometry(60, 30, 15),
        new THREE.MeshLambertMaterial({ color: CorCarro })
    );
    main.position.z = 12;
    car.add(main);

    const TexturaFrenteCarro = FrontTexture();
    TexturaFrenteCarro.center = new THREE.Vector2(0.5, 0.5);
    TexturaFrenteCarro.rotation = Math.PI / 2;

    const TexturaTrasCarro = FrontTexture();
    TexturaTrasCarro.center = new THREE.Vector2(0.5, 0.5); // usei para poder rodar a textura senao ele roda como eixo no canto inferior esquerdo e para poder rodar a textura no meio
    TexturaTrasCarro.rotation = -Math.PI / 2;

    const TexturaLadoEsquerdoCarro = SideTexture();
    TexturaLadoEsquerdoCarro.flipY = false;

    const TexturaLadoDireitoCarro = SideTexture();

    // Rodas
    const frontWheel = Wheel()
    frontWheel.position.x = 18;
    car.add(frontWheel);
    
    const backWheel = Wheel()
    backWheel.position.x = -18
    car.add(backWheel);


    // Cabine com Texturas
    const cabin = new THREE.Mesh( new THREE.BoxGeometry(33,24,12),[   // map é usado como o color só que serve para embrulhar um objeto 2d em 3d (Canvas das janelas do carro)
        new THREE.MeshLambertMaterial({ map: TexturaFrenteCarro }),
        new THREE.MeshLambertMaterial({ map: TexturaTrasCarro }),
        new THREE.MeshLambertMaterial({ map: TexturaLadoEsquerdoCarro }),
        new THREE.MeshLambertMaterial({ map: TexturaLadoDireitoCarro }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }), // teto
        new THREE.MeshLambertMaterial({ color: 0xffffff }) // debaixo do cubo
    ]);

    cabin.position.set(-6, 0, 25.5);
    car.add(cabin);

    const hoodGroup = new THREE.Group();
        const hood = new THREE.Mesh(
            new THREE.BoxGeometry(25, 30, 3), 
            new THREE.MeshLambertMaterial({ color: 0x000000 })
        );
        hood.position.x = 12.5; // Metade do comprimento do capô (centro do capô)
        hood.position.y = 0;
        hood.position.z = 1.5; // Metade da altura do capô
        hoodGroup.add(hood);
        
        hoodGroup.position.x = 5; // Parte traseira do capô (beira do vidro)
        hoodGroup.position.y = 0;
        hoodGroup.position.z = 19.5; // Parte superior do carro (topo do main)
        hoodGroup.rotation.y = 0; // Inicialmente fechado (rotação em Y, negativo abre para cima)
        car.add(hoodGroup);

        const leftDoorGroup = new THREE.Group();
        const leftDoor = new THREE.Mesh(
            new THREE.BoxGeometry(3, 20, 12), // Largura, altura, profundidade
            new THREE.MeshLambertMaterial({ color: 0x000000 })
        );
        
        leftDoor.position.x = 0;
        leftDoor.position.y = 1.5; 
        leftDoor.position.z = 6; 
        leftDoorGroup.add(leftDoor);
        
        leftDoorGroup.position.x = 0;
        leftDoorGroup.position.y = -15; 
        leftDoorGroup.position.z = 0;
        leftDoorGroup.rotation.z = 0; 
        car.add(leftDoorGroup);

        
        const rightDoorGroup = new THREE.Group();
        const rightDoor = new THREE.Mesh(
            new THREE.BoxGeometry(3, 20, 12),
            new THREE.MeshLambertMaterial({ color: CorCarro })
        );
        
        rightDoor.position.x = 0;
        rightDoor.position.y = -1.5; 
        rightDoor.position.z = 6; 
        rightDoorGroup.add(rightDoor);
        
        rightDoorGroup.position.x = 0;
        rightDoorGroup.position.y = 15; 
        rightDoorGroup.position.z = 0;
        rightDoorGroup.rotation.z = 0; 
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