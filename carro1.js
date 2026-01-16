function Car() {
    const car = new THREE.Group();
    const CorCarro = Colors(ListaCores);

    // 1. Corpo Principal (Aumentado de 60 para 100)
    const mainWidth = 100;
    const mainHeight = 50;
    const mainDepth = 25;
    
    const main = new THREE.Mesh(
        new THREE.BoxGeometry(mainWidth, mainHeight, mainDepth),
        new THREE.MeshLambertMaterial({ color: CorCarro })
    );
    main.position.z = mainDepth / 2; // Senta o carro no "chão"
    car.add(main);

    // 2. Ajuste de Texturas para a Cabine Maior
    const TexturaFrenteCarro = FrontTexture();
    TexturaFrenteCarro.center.set(0.5, 0.5);
    TexturaFrenteCarro.rotation = Math.PI / 2;

    const TexturaTrasCarro = FrontTexture();
    TexturaTrasCarro.center.set(0.5, 0.5);
    TexturaTrasCarro.rotation = -Math.PI / 2;

    const TexturaLadoEsquerdoCarro = SideTexture();
    // Como a cabine aumentou, podemos repetir a textura para não esticar tanto
    TexturaLadoEsquerdoCarro.wrapS = THREE.RepeatWrapping;
    TexturaLadoEsquerdoCarro.repeat.x = 1; 
    TexturaLadoEsquerdoCarro.flipY = false;

    const TexturaLadoDireitoCarro = SideTexture();

    // 3. Cabine Aumentada (Proporcional ao corpo)
    const cabinWidth = 55;
    const cabinHeight = 42;
    const cabinDepth = 20;
    
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinDepth), [
        new THREE.MeshLambertMaterial({ map: TexturaLadoEsquerdoCarro }), // Lado 1
        new THREE.MeshLambertMaterial({ map: TexturaLadoDireitoCarro }),  // Lado 2
        new THREE.MeshLambertMaterial({ color: 0xffffff }),              // Topo
        new THREE.MeshLambertMaterial({ color: 0xffffff }),              // Baixo
        new THREE.MeshLambertMaterial({ map: TexturaFrenteCarro }),      // Frente
        new THREE.MeshLambertMaterial({ map: TexturaTrasCarro })         // Trás
    ]);

    // Posicionamento da cabine (ajustado para o novo tamanho)
    cabin.position.set(-10, 0, mainDepth + (cabinDepth / 2));
    car.add(cabin);

    // 4. Rodas (Aumentadas proporcionalmente)
    const wheelGeo = new THREE.BoxGeometry(20, mainHeight + 4, 20);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.position.set(25, 0, 10);
    car.add(frontWheel);
    
    const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
    backWheel.position.set(-30, 0, 10);
    car.add(backWheel);

    // 5. Capô Homogéneo (Usa CorCarro e ajusta posição)
    const hoodGroup = new THREE.Group();
    const hood = new THREE.Mesh(
        new THREE.BoxGeometry(40, mainHeight - 2, 4), // Ligeiramente mais estreito que o corpo
        new THREE.MeshLambertMaterial({ color: CorCarro })
    );
    hood.position.set(20, 0, 2); 
    hoodGroup.add(hood);
    
    hoodGroup.position.set(8, 0, mainDepth); // Encaixa no topo do corpo
    car.add(hoodGroup);

    // 6. Portas Homogéneas (Usa CorCarro e evita Z-fighting)
    const doorGeo = new THREE.BoxGeometry(35, 2, 20);
    const doorMat = new THREE.MeshLambertMaterial({ color: CorCarro });

    // Porta Esquerda
    const leftDoorGroup = new THREE.Group();
    const leftDoor = new THREE.Mesh(doorGeo, doorMat);
    leftDoor.position.set(0, 0, 10); 
    leftDoorGroup.add(leftDoor);
    leftDoorGroup.position.set(-10, (mainHeight/2) + 0.1, 5); // 0.1 evita que as faces se sobreponham
    car.add(leftDoorGroup);

    // Porta Direita
    const rightDoorGroup = new THREE.Group();
    const rightDoor = new THREE.Mesh(doorGeo, doorMat);
    rightDoor.position.set(0, 0, 10);
    rightDoorGroup.add(rightDoor);
    rightDoorGroup.position.set(-10, -(mainHeight/2) - 0.1, 5);
    car.add(rightDoorGroup);

    return car;
}