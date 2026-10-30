/**
 * ============================================================================
 * CIRCUITO ELÉTRICO & OSCILOSCÓPIO PWM (CANVAS 2D)
 * ============================================================================
 * Animação interativa do fluxo de elétrons do ESP32 para os LEDs e
 * visualização da onda quadrada em 5.000 Hz variando o Duty Cycle.
 * ============================================================================
 */

let currentPwmPct = 14;
let electronPhase = 0;
let scopeOffset = 0;

function initCircuits() {
    renderCircuit();
    renderPwmScope();
}

function resizeCircuits() {
    const circCanvas = document.getElementById('circuitCanvas');
    const pwmCanvas = document.getElementById('pwmCanvas');

    if (circCanvas && circCanvas.parentElement) {
        circCanvas.width = circCanvas.parentElement.clientWidth;
        circCanvas.height = circCanvas.parentElement.clientHeight;
    }
    if (pwmCanvas && pwmCanvas.parentElement) {
        pwmCanvas.width = pwmCanvas.parentElement.clientWidth;
        pwmCanvas.height = pwmCanvas.parentElement.clientHeight;
    }
}

function renderCircuit() {
    const canvas = document.getElementById('circuitCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const espX = 40, espY = 60, espW = 100, espH = 160;
    const resX = 220, resY = 90;
    const ledX = 340, ledY = 90;

    // 1. ESP32 NodeMCU
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#00f2fe";
    ctx.lineWidth = 2;
    ctx.fillRect(espX, espY, espW, espH);
    ctx.strokeRect(espX, espY, espW, espH);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Plus Jakarta Sans";
    ctx.fillText("ESP32", espX + 26, espY + 30);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Plus Jakarta Sans";
    ctx.fillText("NodeMCU", espX + 22, espY + 48);

    ctx.fillStyle = "#38bdf8";
    ctx.fillText("GPIO 25 ●", espX + 35, espY + 85);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("GND     ●", espX + 35, espY + 140);

    // 2. Fio Superior (GPIO 25 -> Resistor -> LED)
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.moveTo(espX + espW, espY + 80);
    ctx.lineTo(resX - 30, espY + 80);
    ctx.stroke();

    // Resistor 220Ω (Zigzag)
    ctx.beginPath();
    ctx.strokeStyle = "#fcd34d";
    ctx.lineWidth = 3;
    let rx = resX - 30;
    ctx.moveTo(rx, espY + 80);
    for (let i = 0; i < 6; i++) {
        rx += 10;
        ctx.lineTo(rx, (i % 2 === 0) ? espY + 70 : espY + 90);
    }
    rx += 10;
    ctx.lineTo(rx, espY + 80);
    ctx.stroke();

    ctx.fillStyle = "#fcd34d";
    ctx.font = "bold 11px Plus Jakarta Sans";
    ctx.fillText("Resistor 220Ω", resX - 20, espY + 58);

    // Fio Resistor -> LED
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.moveTo(rx, espY + 80);
    ctx.lineTo(ledX, espY + 80);
    ctx.stroke();

    // Símbolo do LED com brilho proporcional
    ctx.fillStyle = (currentPwmPct > 0) ? `rgba(255, 230, 150, ${0.3 + (currentPwmPct / 100) * 0.7})` : "#334155";
    ctx.beginPath();
    ctx.arc(ledX + 20, espY + 80, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fcd34d";
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px Plus Jakarta Sans";
    ctx.fillText("💡 LED POSTE", ledX - 10, espY + 120);

    // 3. Fio GND de Retorno
    ctx.beginPath();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.moveTo(ledX + 36, espY + 80);
    ctx.lineTo(w - 40, espY + 80);
    ctx.lineTo(w - 40, espY + 135);
    ctx.lineTo(espX + espW, espY + 135);
    ctx.stroke();

    // 4. Animação dos Elétrons
    if (currentPwmPct > 0) {
        electronPhase += (currentPwmPct / 100) * 4;
        ctx.fillStyle = "#00f2fe";

        const points = [
            { x1: espX + espW, y1: espY + 80, x2: resX - 30, y2: espY + 80 },
            { x1: rx, y1: espY + 80, x2: ledX, y2: espY + 80 },
            { x1: ledX + 36, y1: espY + 80, x2: w - 40, y2: espY + 80 },
            { x1: w - 40, y1: espY + 80, x2: w - 40, y2: espY + 135 },
            { x1: w - 40, y1: espY + 135, x2: espX + espW, y2: espY + 135 }
        ];

        points.forEach(seg => {
            const dx = seg.x2 - seg.x1;
            const dy = seg.y2 - seg.y1;
            const dist = Math.hypot(dx, dy);
            const steps = Math.floor(dist / 22);

            for (let s = 0; s < steps; s++) {
                const progress = ((s * 22 + electronPhase) % dist) / dist;
                const px = seg.x1 + dx * progress;
                const py = seg.y1 + dy * progress;
                ctx.beginPath();
                ctx.arc(px, py, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    requestAnimationFrame(renderCircuit);
}

function renderPwmScope() {
    const canvas = document.getElementById('pwmCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Grade do Osciloscópio
    ctx.strokeStyle = "#132035";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(w, y);
        ctx.stroke();
    }

    const yHigh = 70;
    const yLow = 190;

    ctx.fillStyle = "#64748b";
    ctx.font = "11px JetBrains Mono";
    ctx.fillText("+3.3V (Ligado)", 15, yHigh - 8);
    ctx.fillText(" 0.0V (Desligado)", 15, yLow + 18);

    // Onda Quadrada
    scopeOffset += 3.5;
    const period = 120;
    const onTime = period * (currentPwmPct / 100);

    ctx.beginPath();
    ctx.strokeStyle = "#00f2fe";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#00f2fe";
    ctx.shadowBlur = 10;

    let firstPoint = true;
    for (let x = -period; x < w + period; x += 1) {
        const phase = (x + scopeOffset) % period;
        const y = (phase < onTime) ? yHigh : yLow;

        if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Telemetria textual do sinal
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px JetBrains Mono";
    ctx.fillText(`Frequencia: 5.000 Hz   |   Periodo: 200 µs   |   Ligado: ${currentPwmPct}%   |   Desligado: ${100 - currentPwmPct}%`, 20, h - 18);

    requestAnimationFrame(renderPwmScope);
}

function updatePwmDemo(val) {
    currentPwmPct = parseInt(val);
    const label = document.getElementById('pwmValueLabel');
    if (!label) return;

    if (currentPwmPct === 14) {
        label.innerText = `14% (Brilho Noturno da Lua)`;
    } else if (currentPwmPct === 100) {
        label.innerText = `100% (Carro Detectado!)`;
    } else {
        label.innerText = `${currentPwmPct}%`;
    }
}

function setPwmPreset(val) {
    const slider = document.getElementById('pwmSlider');
    if (slider) slider.value = val;
    updatePwmDemo(val);
}
