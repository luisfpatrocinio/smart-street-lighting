/**
 * ============================================================================
 * SIMULADOR 3D DA PISTA INTELIGENTE (THREE.JS)
 * ============================================================================
 * Simula em tempo real a rodovia em escala com:
 * - 4 setores autônomos
 * - 8 postes de iluminação pública com lâmpadas LED emissivas
 * - 4 módulos de sensores ópticos reflexivos infravermelhos TCRT5000
 * - Carrinho que percorre a via e dispara os sensores
 * ============================================================================
 */

let scene, camera, renderer, controls;
let carGroup, carPos = -18;
let isDriving = true;
let isNight = true;
let dirLight, hemiLight;

// Dados dos 4 Setores da Maquete (sincronizados com Config.hpp)
const SECTORS_DATA = [
    { id: 0, xMin: -16, xMax: -8,  poleX: -12, lightA: null, lightB: null, curDuty: 35, targetDuty: 35, detected: false, holdTimer: 0 },
    { id: 1, xMin: -8,  xMax: 0,   poleX: -4,  lightA: null, lightB: null, curDuty: 35, targetDuty: 35, detected: false, holdTimer: 0 },
    { id: 2, xMin: 0,   xMax: 8,   poleX: 4,   lightA: null, lightB: null, curDuty: 35, targetDuty: 35, detected: false, holdTimer: 0 },
    { id: 3, xMin: 8,   xMax: 16,  poleX: 12,  lightA: null, lightB: null, curDuty: 35, targetDuty: 35, detected: false, holdTimer: 0 }
];

const sensorMeshes = [];
const lampBulbMeshes = [];

function init3D() {
    const container = document.querySelector('.viewport-3d-wrapper');
    const canvas = document.getElementById('canvas3d');
    if (!container || !canvas) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.025);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 18, 28);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 1, 0);

    // Iluminação ambiental suave
    hemiLight = new THREE.HemisphereLight(0x334466, 0x05070a, 0.3);
    scene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0x7799bb, 0.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    buildRoadway();
    buildStreetlamps();
    buildSensors();
    buildCar();
}

function buildRoadway() {
    // Pista de Asfalto
    const roadGeo = new THREE.PlaneGeometry(44, 8);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x181c24, roughness: 0.8 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);

    // Calçadas laterais (Curb)
    const curbGeo = new THREE.BoxGeometry(44, 0.3, 1.2);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    
    const curbNorth = new THREE.Mesh(curbGeo, curbMat);
    curbNorth.position.set(0, 0.15, -4.6);
    scene.add(curbNorth);

    const curbSouth = new THREE.Mesh(curbGeo, curbMat);
    curbSouth.position.set(0, 0.15, 4.6);
    scene.add(curbSouth);

    // Faixas centrais tracejadas
    for (let x = -19; x <= 19; x += 3.5) {
        const stripeGeo = new THREE.PlaneGeometry(1.8, 0.2);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(x, 0.01, 0);
        scene.add(stripe);
    }

    // Canteiro de grama lateral
    const grassGeo = new THREE.PlaneGeometry(80, 50);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x0a140d, roughness: 0.95 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    scene.add(grass);
}

function buildStreetlamps() {
    SECTORS_DATA.forEach(sec => {
        // 2 postes por setor (um em cada calçada)
        [-4.6, 4.6].forEach((zPos, idx) => {
            const postGroup = new THREE.Group();
            postGroup.position.set(sec.poleX, 0, zPos);

            // Coluna vertical do poste
            const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 5.5, 16);
            const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.y = 2.75;
            postGroup.add(pole);

            // Braço curvo superior
            const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 12);
            const arm = new THREE.Mesh(armGeo, poleMat);
            arm.rotation.x = (zPos > 0) ? -Math.PI / 3 : Math.PI / 3;
            arm.position.set(0, 5.2, (zPos > 0) ? -0.6 : 0.6);
            postGroup.add(arm);

            // Cúpula do poste
            const capGeo = new THREE.ConeGeometry(0.35, 0.3, 16);
            const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
            const cap = new THREE.Mesh(capGeo, capMat);
            cap.position.set(0, 5.7, (zPos > 0) ? -1.3 : 1.3);
            cap.rotation.x = Math.PI;
            postGroup.add(cap);

            // Bulbo emissivo (LED)
            const bulbGeo = new THREE.SphereGeometry(0.18, 16, 16);
            const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe6aa });
            const bulb = new THREE.Mesh(bulbGeo, bulbMat);
            bulb.position.set(0, 5.55, (zPos > 0) ? -1.3 : 1.3);
            postGroup.add(bulb);
            lampBulbMeshes.push({ mesh: bulb, sectorId: sec.id });

            // Ponto de luz SpotLight dinâmico iluminando o asfalto
            const spot = new THREE.SpotLight(0xfff3d1, 0.4, 18, Math.PI / 3.5, 0.4, 1);
            spot.position.set(sec.poleX, 5.5, (zPos > 0) ? zPos - 1.3 : zPos + 1.3);
            spot.target.position.set(sec.poleX, 0, (zPos > 0) ? zPos - 2.5 : zPos + 2.5);
            scene.add(spot);
            scene.add(spot.target);

            if (idx === 0) sec.lightA = spot;
            else sec.lightB = spot;

            scene.add(postGroup);
        });
    });
}

function buildSensors() {
    SECTORS_DATA.forEach(sec => {
        // Gabinete do sensor TCRT5000 rente ao piso
        const boxGeo = new THREE.BoxGeometry(0.6, 0.1, 0.9);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
        const sensorBox = new THREE.Mesh(boxGeo, boxMat);
        sensorBox.position.set(sec.poleX, 0.05, 1.2);
        scene.add(sensorBox);

        // LED Emissor (Azul claro/invisível) e Fototransistor Receptor (Preto)
        const eyeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 12);
        const eyeEmitMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const eyeRecMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

        const eye1 = new THREE.Mesh(eyeGeo, eyeEmitMat);
        eye1.position.set(sec.poleX - 0.15, 0.12, 1.2);
        scene.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeo, eyeRecMat);
        eye2.position.set(sec.poleX + 0.15, 0.12, 1.2);
        scene.add(eye2);

        // Feixe visual indicador de detecção (ativo quando o carrinho passa)
        const beamGeo = new THREE.CylinderGeometry(0.02, 0.3, 1.8, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.0 });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(sec.poleX, 0.9, 1.2);
        scene.add(beam);

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

    // Movimentação do veículo
    if (isDriving && carGroup) {
        carPos += 7.0 * dt;
        if (carPos > 20) {
            carPos = -20;
        }
        carGroup.position.x = carPos;
    }

    let activeSectorCount = 0;

    SECTORS_DATA.forEach(sec => {
        const carNearSensor = Math.abs(carPos - sec.poleX) < 1.4;

        if (carNearSensor) {
            sec.detected = true;
            sec.targetDuty = 255;
            sec.holdTimer = now;
            activeSectorCount++;
        } else {
            sec.detected = false;
            // Regra dos 2,5 segundos
            if (now - sec.holdTimer < 2500) {
                sec.targetDuty = 255;
            } else {
                sec.targetDuty = 35; // Modo Noturno
            }
        }

        // Transição de fade suave
        if (sec.curDuty < sec.targetDuty) {
            sec.curDuty = Math.min(sec.targetDuty, sec.curDuty + 350 * dt);
        } else if (sec.curDuty > sec.targetDuty) {
            sec.curDuty = Math.max(sec.targetDuty, sec.curDuty - 140 * dt);
        }

        const intensityRatio = sec.curDuty / 255.0;
        const lightPower = 0.2 + intensityRatio * 2.8;

        if (sec.lightA) sec.lightA.intensity = lightPower;
        if (sec.lightB) sec.lightB.intensity = lightPower;

        const sensorObj = sensorMeshes.find(s => s.sectorId === sec.id);
        if (sensorObj) {
            sensorObj.beamMat.opacity = THREE.MathUtils.lerp(sensorObj.beamMat.opacity, sec.detected ? 0.75 : 0.0, 0.2);
        }

        lampBulbMeshes.filter(b => b.sectorId === sec.id).forEach(b => {
            b.mesh.material.color.setRGB(1.0, 0.9 + 0.1 * intensityRatio, 0.4 + 0.6 * intensityRatio);
        });

        updateSectorTelemetryUI(sec);
    });

    const badge = document.getElementById('simBadge');
    if (badge) {
        if (activeSectorCount > 0) {
            badge.innerText = "🚗 VEÍCULO NA PISTA • ILUMINAÇÃO TOTAL NO SETOR ATIVO";
            badge.style.color = "#fcd34d";
        } else {
            badge.innerText = "🌙 PISTA LIVRE • MODO NOTURNO (14% DE LUZ ECONOMIZANDO ENERGIA)";
            badge.style.color = "var(--accent-cyan)";
        }
    }

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
    const state = document.getElementById(`state-sec-${sec.id}`);
    const pct = document.getElementById(`pct-sec-${sec.id}`);

    if (!card || !tag || !meter || !state || !pct) return;

    const pctValue = Math.round((sec.curDuty / 255) * 100);
    meter.style.width = `${pctValue}%`;
    pct.innerText = `${pctValue}%`;

    if (sec.detected) {
        tag.innerText = "🚗 CARRO!";
        tag.className = "sensor-tag detected";
        state.innerText = "CARRO NA FRENTE";
        card.classList.add('active-sector');
    } else if (sec.targetDuty === 255) {
        tag.innerText = "LIVRE";
        tag.className = "sensor-tag";
        state.innerText = "MANTENDO ACESO (2,5s)";
        card.classList.add('active-sector');
    } else if (sec.curDuty > 36) {
        tag.innerText = "LIVRE";
        tag.className = "sensor-tag";
        state.innerText = "APAGANDO DEVAGAR";
        card.classList.remove('active-sector');
    } else {
        tag.innerText = "LIVRE";
        tag.className = "sensor-tag";
        state.innerText = "MODO ECONOMICO";
        card.classList.remove('active-sector');
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

function toggleNight() {
    isNight = !isNight;
    const btn = document.getElementById('btnNight');
    if (btn) {
        btn.innerText = isNight ? "🌙 Modo Noite" : "☀️ Modo Dia";
    }
    
    if (isNight) {
        scene.background.setHex(0x060913);
        scene.fog.color.setHex(0x060913);
        hemiLight.intensity = 0.3;
        dirLight.intensity = 0.2;
    } else {
        scene.background.setHex(0x87ceeb);
        scene.fog.color.setHex(0x87ceeb);
        hemiLight.intensity = 0.9;
        dirLight.intensity = 0.8;
    }
}

function resetCamera() {
    if (!camera || !controls) return;
    camera.position.set(0, 18, 28);
    controls.target.set(0, 1, 0);
}
