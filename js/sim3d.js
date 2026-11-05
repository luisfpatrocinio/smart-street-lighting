/**
 * ============================================================================
 * SIMULADOR 3D DA PISTA INTELIGENTE (THREE.JS)
 * ============================================================================
 * Simula em tempo real a rodovia em escala com:
 * - 4 setores autônomos
 * - 8 postes de iluminação pública com lâmpadas LED emissivas
 * - 4 totens com sensores ópticos TCRT5000 montados nas laterais da pista (calçada)
 * - Modo Único (Noite / Demonstração) com iluminação atmosférica realista
 * - Toggle Interativo: "Maquete 3D" vs "Exibição de Fios em 3D" (Raio-X da fiação)
 * ============================================================================
 */

let scene, camera, renderer, controls;
let carGroup, carPos = -18;
let isDriving = true;
let isWireView = false;
let dirLight, hemiLight;

// Grupos e coleções para alternância de visualização
let wiringGroup;
const sceneryMeshes = [];
const sensorMeshes = [];
const lampBulbMeshes = [];

// Material translúcido estilo Raio-X / Blueprint técnico para o modo de fiação
const wireframeTranslucentMaterial = new THREE.MeshStandardMaterial({
    color: 0x111c2e,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.22,
    wireframe: false
});

// Dados dos 4 Setores da Maquete (sincronizados com Config.hpp)
const SECTORS_DATA = [
    { id: 0, xMin: -16, xMax: -8,  poleX: -12, light: null, curDuty: 35, targetDuty: 35, detected: false, holdTimer: 0 },
    { id: 1, xMin: -8,  xMax: 0,   poleX: -4,  light: null, curDuty: 35, targetDuty: 35, detected: false, holdTimer: 0 },
    { id: 2, xMin: 0,   xMax: 8,   poleX: 4,   light: null, curDuty: 35, targetDuty: 35, detected: false, holdTimer: 0 },
    { id: 3, xMin: 8,   xMax: 16,  poleX: 12,  light: null, curDuty: 35, targetDuty: 35, detected: false, holdTimer: 0 }
];

function init3D() {
    const container = document.querySelector('.viewport-3d-wrapper');
    const canvas = document.getElementById('canvas3d');
    if (!container || !canvas) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.025);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 16, 26);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 1, 0);

    // Iluminação noturna fixa e calibrada para destaque das luzes dos postes
    hemiLight = new THREE.HemisphereLight(0x334466, 0x05070a, 0.35);
    scene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0x7799bb, 0.25);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    buildRoadway();
    buildStreetlamps();
    buildSensors();
    buildCar();
    buildWiring();
}

function registerScenery(mesh, originalMat) {
    mesh.userData.origMat = originalMat;
    sceneryMeshes.push(mesh);
}

function buildRoadway() {
    // Pista de Asfalto
    const roadGeo = new THREE.PlaneGeometry(44, 8);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x181c24, roughness: 0.8 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    registerScenery(road, roadMat);
    scene.add(road);

    // Calçadas laterais (Curb)
    const curbGeo = new THREE.BoxGeometry(44, 0.35, 1.4);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    
    const curbNorth = new THREE.Mesh(curbGeo, curbMat);
    curbNorth.position.set(0, 0.175, -4.7);
    registerScenery(curbNorth, curbMat);
    scene.add(curbNorth);

    const curbSouth = new THREE.Mesh(curbGeo, curbMat);
    curbSouth.position.set(0, 0.175, 4.7);
    registerScenery(curbSouth, curbMat);
    scene.add(curbSouth);

    // Faixas centrais tracejadas
    for (let x = -19; x <= 19; x += 3.5) {
        const stripeGeo = new THREE.PlaneGeometry(1.8, 0.2);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(x, 0.01, 0);
        registerScenery(stripe, stripeMat);
        scene.add(stripe);
    }

    // Canteiro de grama lateral
    const grassGeo = new THREE.PlaneGeometry(80, 50);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x0a140d, roughness: 0.95 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    registerScenery(grass, grassMat);
    scene.add(grass);
}

function buildStreetlamps() {
    SECTORS_DATA.forEach(sec => {
        // 1 poste por setor ao longo da calçada (Total = 4 Postes)
        const zPos = 4.7;
        const postGroup = new THREE.Group();
        postGroup.position.set(sec.poleX, 0, zPos);

        // Coluna vertical do poste
        const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 5.5, 16);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 2.75;
        registerScenery(pole, poleMat);
        postGroup.add(pole);

        // Braço curvo superior direcionado para a pista
        const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.8, 12);
        const arm = new THREE.Mesh(armGeo, poleMat);
        arm.rotation.x = -Math.PI / 3;
        arm.position.set(0, 5.2, -0.7);
        registerScenery(arm, poleMat);
        postGroup.add(arm);

        // Cúpula do poste
        const capGeo = new THREE.ConeGeometry(0.35, 0.3, 16);
        const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(0, 5.7, -1.4);
        cap.rotation.x = Math.PI;
        registerScenery(cap, capMat);
        postGroup.add(cap);

        // Bulbo emissivo (LED)
        const bulbGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe6aa });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(0, 5.55, -1.4);
        postGroup.add(bulb);
        lampBulbMeshes.push({ mesh: bulb, sectorId: sec.id });

        // Ponto de luz SpotLight dinâmico iluminando o asfalto
        const spot = new THREE.SpotLight(0xfff3d1, 0.5, 20, Math.PI / 3.2, 0.4, 1);
        spot.position.set(sec.poleX, 5.5, zPos - 1.4);
        spot.target.position.set(sec.poleX, 0, 0); // Foco no centro da via
        scene.add(spot);
        scene.add(spot.target);

        sec.light = spot;
        scene.add(postGroup);
    });
}

function buildSensors() {
    SECTORS_DATA.forEach(sec => {
        const totemGroup = new THREE.Group();
        const lateralZ = 3.8;
        const sensorY = 0.55;

        totemGroup.position.set(sec.poleX, 0, lateralZ);

        // Pedestal / Totem de Suporte na Calçada
        const pedestalGeo = new THREE.BoxGeometry(0.3, 0.45, 0.3);
        const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.5 });
        const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
        pedestal.position.y = 0.225;
        registerScenery(pedestal, pedestalMat);
        totemGroup.add(pedestal);

        // Gabinete do Sensor TCRT5000
        const sensorBodyGeo = new THREE.BoxGeometry(0.5, 0.35, 0.3);
        const sensorBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
        const sensorBody = new THREE.Mesh(sensorBodyGeo, sensorBodyMat);
        sensorBody.position.y = sensorY;
        registerScenery(sensorBody, sensorBodyMat);
        totemGroup.add(sensorBody);

        // Duas lentes apontando horizontalmente para a pista (-Z)
        const eyeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.12, 12);
        const eyeEmitMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const eyeRecMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

        const eye1 = new THREE.Mesh(eyeGeo, eyeEmitMat);
        eye1.rotation.x = Math.PI / 2;
        eye1.position.set(-0.12, sensorY, -0.16);
        totemGroup.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeo, eyeRecMat);
        eye2.rotation.x = Math.PI / 2;
        eye2.position.set(0.12, sensorY, -0.16);
        totemGroup.add(eye2);

        // Feixe óptico horizontal indicador
        const beamLength = 2.6;
        const beamGeo = new THREE.ConeGeometry(0.4, beamLength, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({ 
            color: 0xef4444, 
            transparent: true, 
            opacity: 0.05,
            side: THREE.DoubleSide
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.rotation.x = -Math.PI / 2;
        beam.position.set(sec.poleX, sensorY, lateralZ - (beamLength / 2));
        scene.add(beam);

        scene.add(totemGroup);
        sensorMeshes.push({ sectorId: sec.id, beamMat: beamMat });
    });
}

function buildCar() {
    carGroup = new THREE.Group();

    // Carroceria
    const bodyGeo = new THREE.BoxGeometry(2.4, 0.7, 1.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.6, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;
    carGroup.add(body);

    // Cabine
    const cabinGeo = new THREE.BoxGeometry(1.3, 0.55, 1.0);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-0.2, 1.1, 0);
    carGroup.add(cabin);

    // Faróis dianteiros
    const lightGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headL = new THREE.Mesh(lightGeo, lightMat);
    headL.position.set(1.22, 0.55, 0.4);
    const headR = new THREE.Mesh(lightGeo, lightMat);
    headR.position.set(1.22, 0.55, -0.4);
    carGroup.add(headL);
    carGroup.add(headR);

    // 4 Rodas
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
    const wheelsPos = [
        [-0.7, 0.28, 0.6], [0.7, 0.28, 0.6],
        [-0.7, 0.28, -0.6], [0.7, 0.28, -0.6]
    ];
    wheelsPos.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(pos[0], pos[1], pos[2]);
        carGroup.add(wheel);
    });

    carGroup.position.set(carPos, 0, 1.2);
    scene.add(carGroup);
}

/**
 * ============================================================================
 * CONSTRUÇÃO DA FIAÇÃO 3D (CABOS ELÉTRICOS & CENTRAL ESP32)
 * ============================================================================
 */
function createWireTube(points, colorHex, emissiveHex, radius = 0.042) {
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, 36, radius, 8, false);
    const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: emissiveHex,
        roughness: 0.3,
        metalness: 0.2
    });
    return new THREE.Mesh(geo, mat);
}

function buildWiring() {
    wiringGroup = new THREE.Group();

    // 1. Placa Central de Controle (ESP32 NodeMCU) na lateral da maquete
    const espBaseGeo = new THREE.BoxGeometry(3.0, 0.25, 2.0);
    const espBaseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const espBase = new THREE.Mesh(espBaseGeo, espBaseMat);
    espBase.position.set(0, 0.125, 6.2);
    wiringGroup.add(espBase);

    // Módulo Metálico do ESP32
    const chipGeo = new THREE.BoxGeometry(1.6, 0.15, 1.0);
    const chipMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(0, 0.25, 6.2);
    wiringGroup.add(chip);

    // LED de Power do ESP32 (Vermelho aceso)
    const ledPwrGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const ledPwrMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const ledPwr = new THREE.Mesh(ledPwrGeo, ledPwrMat);
    ledPwr.position.set(-0.5, 0.35, 6.2);
    wiringGroup.add(ledPwr);

    // Cores padrão de fiação da norma do projeto:
    const COLOR_VCC = 0xef4444; // Vermelho (3.3V)
    const COLOR_GND = 0x3b82f6; // Azul (Terra comum)
    const COLOR_PWM = 0x10b981; // Verde (PWM dos Postes)
    const COLOR_SIG = 0xfbbf24; // Amarelo (Sinal dos Sensores)

    // 2. Barramento Tronco 3.3V (Vermelho) conectando os 4 sensores
    SECTORS_DATA.forEach(sec => {
        // Cabo Vermelho (3.3V) do ESP32 até cada totem lateral
        const wireVcc = createWireTube([
            new THREE.Vector3(-0.4, 0.25, 6.0),
            new THREE.Vector3(-0.4, 0.1, 4.8),
            new THREE.Vector3(sec.poleX - 0.15, 0.1, 4.2),
            new THREE.Vector3(sec.poleX - 0.1, 0.5, 3.8)
        ], COLOR_VCC, 0x7f1d1d);
        wiringGroup.add(wireVcc);

        // Cabo Amarelo (Sinal do Sensor TCRT5000) até o GPIO correspondente
        const wireSig = createWireTube([
            new THREE.Vector3(0.2, 0.25, 6.0),
            new THREE.Vector3(0.2, 0.1, 4.7),
            new THREE.Vector3(sec.poleX + 0.15, 0.1, 4.1),
            new THREE.Vector3(sec.poleX + 0.1, 0.5, 3.8)
        ], COLOR_SIG, 0x78350f);
        wiringGroup.add(wireSig);

        // Cabo Verde (PWM) para o Poste de Iluminação
        const wirePwm = createWireTube([
            new THREE.Vector3(0.0, 0.25, 6.0),
            new THREE.Vector3(0.0, 0.1, 5.0),
            new THREE.Vector3(sec.poleX, 0.1, 4.7),
            new THREE.Vector3(sec.poleX, 5.2, 4.7),
            new THREE.Vector3(sec.poleX, 5.5, 3.4)
        ], COLOR_PWM, 0x064e3b);
        wiringGroup.add(wirePwm);

        // Cabo Azul (GND Terra Comum) para os postes e sensores
        const wireGnd = createWireTube([
            new THREE.Vector3(0.5, 0.25, 6.0),
            new THREE.Vector3(0.5, 0.05, 5.1),
            new THREE.Vector3(sec.poleX + 0.2, 0.05, 4.7),
            new THREE.Vector3(sec.poleX + 0.2, 0.45, 3.8)
        ], COLOR_GND, 0x1e3a8a);
        wiringGroup.add(wireGnd);
    });

    // Inicialmente oculto (visível apenas ao ativar o toggle de fiação)
    wiringGroup.visible = false;
    scene.add(wiringGroup);
}

function toggleWireView() {
    isWireView = !isWireView;
    const btn = document.getElementById('btnWireView');
    const legend = document.getElementById('wiringLegend');

    if (isWireView) {
        // Ativa Modo Fiação 3D
        wiringGroup.visible = true;

        // Torna a pista e postes translúcidos no estilo Raio-X
        sceneryMeshes.forEach(mesh => {
            mesh.material = wireframeTranslucentMaterial;
        });

        if (btn) {
            btn.innerText = "🏙️ Ver Maquete 3D";
            btn.classList.add('active');
        }
        if (legend) legend.style.display = 'flex';
    } else {
        // Retorna ao Modo Maquete Realista
        wiringGroup.visible = false;

        // Restaura os materiais opacos originais
        sceneryMeshes.forEach(mesh => {
            if (mesh.userData.origMat) {
                mesh.material = mesh.userData.origMat;
            }
        });

        if (btn) {
            btn.innerText = "🔌 Ver Fiação 3D";
            btn.classList.remove('active');
        }
        if (legend) legend.style.display = 'none';
    }
}

function resize3D() {
    const container = document.querySelector('.viewport-3d-wrapper');
    if (!container || !renderer || !camera) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

let lastTime = performance.now();

function animate3D(now) {
    requestAnimationFrame(animate3D);
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // Movimentação contínua do veículo pela faixa
    if (isDriving && carGroup) {
        carPos += 7.0 * dt;
        if (carPos > 20) {
            carPos = -20;
        }
        carGroup.position.x = carPos;
    }

    SECTORS_DATA.forEach(sec => {
        // Detecção lateral por proximidade do totem na calçada
        const carInFrontOfSensor = Math.abs(carPos - sec.poleX) < 1.6;

        if (carInFrontOfSensor) {
            sec.detected = true;
            sec.targetDuty = 255;
            sec.holdTimer = now;
        } else {
            sec.detected = false;
            // Cooldown de 2,5 segundos
            if (now - sec.holdTimer < 2500) {
                sec.targetDuty = 255;
            } else {
                sec.targetDuty = 35; // Modo Noturno Econômico (14%)
            }
        }

        // Transição suave de fade
        if (sec.curDuty < sec.targetDuty) {
            sec.curDuty = Math.min(sec.targetDuty, sec.curDuty + 350 * dt);
        } else if (sec.curDuty > sec.targetDuty) {
            sec.curDuty = Math.max(sec.targetDuty, sec.curDuty - 140 * dt);
        }

        const intensityRatio = sec.curDuty / 255.0;
        const lightPower = 0.2 + intensityRatio * 2.8;

        if (sec.light) sec.light.intensity = lightPower;

        // Visualização do feixe horizontal infravermelho
        const sensorObj = sensorMeshes.find(s => s.sectorId === sec.id);
        if (sensorObj) {
            sensorObj.beamMat.opacity = THREE.MathUtils.lerp(
                sensorObj.beamMat.opacity, 
                sec.detected ? 0.75 : 0.05, 
                0.2
            );
        }

        lampBulbMeshes.filter(b => b.sectorId === sec.id).forEach(b => {
            b.mesh.material.color.setRGB(1.0, 0.9 + 0.1 * intensityRatio, 0.4 + 0.6 * intensityRatio);
        });

        updateSectorTelemetryUI(sec);
    });

    const clock = document.getElementById('liveClock');
    if (clock) {
        const secTime = Math.floor(now / 1000);
        const mins = String(Math.floor(secTime / 60)).padStart(2, '0');
        const secs = String(secTime % 60).padStart(2, '0');
        clock.innerText = `${mins}:${secs}`;
    }

    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

function updateSectorTelemetryUI(sec) {
    const card = document.getElementById(`card-sec-${sec.id}`);
    const tag = document.getElementById(`tag-sec-${sec.id}`);
    const meter = document.getElementById(`meter-sec-${sec.id}`);
    const pct = document.getElementById(`pct-sec-${sec.id}`);

    if (!card || !tag || !meter || !pct) return;

    const pctValue = Math.round((sec.curDuty / 255) * 100);
    meter.style.width = `${pctValue}%`;
    pct.innerText = `${pctValue}%`;

    if (sec.detected) {
        tag.innerText = "CARRO";
        tag.className = "sensor-tag detected";
        card.classList.add('active-sector');
    } else {
        tag.innerText = "LIVRE";
        tag.className = "sensor-tag";
        if (sec.targetDuty === 255) {
            card.classList.add('active-sector');
        } else {
            card.classList.remove('active-sector');
        }
    }
}

function toggleDrive() {
    isDriving = !isDriving;
    const btn = document.getElementById('btnDrive');
    if (btn) {
        btn.innerText = isDriving ? "⏸ Pausar Carrinho" : "▶ Iniciar Carrinho";
        btn.classList.toggle('active', isDriving);
    }
}

function resetCar() {
    carPos = -19;
    if (carGroup) carGroup.position.x = carPos;
}

function resetCamera() {
    if (!camera || !controls) return;
    camera.position.set(0, 16, 26);
    controls.target.set(0, 1, 0);
}
