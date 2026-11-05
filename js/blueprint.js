/**
 * ============================================================================
 * GUIA DE MONTAGEM FÍSICA: PLANTA BAIXA & CHECKLIST INTERATIVO
 * ============================================================================
 * Renderização gráfica em Canvas 2D da maquete de 80 x 30 cm mostrando a
 * instalação dos sensores TCRT5000 nas LATERAIS da pista (calçada), controle
 * de expansão de etapas (accordion) e checklist dinâmico de bancada.
 * ============================================================================
 */

function renderBlueprint() {
    const canvas = document.getElementById('blueprintCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Margens
    const marginX = 30, marginY = 30;
    const boardW = w - marginX * 2;
    const boardH = h - marginY * 2;

    // Fundo da base da maquete (Foam Board / Madeira)
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.fillRect(marginX, marginY, boardW, boardH);
    ctx.strokeRect(marginX, marginY, boardW, boardH);

    // Faixa central de asfalto preto (12 cm proporcionais)
    const roadH = boardH * 0.45;
    const roadY = marginY + (boardH - roadH) / 2;
    ctx.fillStyle = "#090d16";
    ctx.fillRect(marginX, roadY, boardW, roadH);

    // Calçadas norte e sul
    ctx.fillStyle = "rgba(51, 65, 85, 0.4)";
    ctx.fillRect(marginX, marginY, boardW, roadY - marginY);
    ctx.fillRect(marginX, roadY + roadH, boardW, marginY + boardH - (roadY + roadH));

    // Faixa central tracejada
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(marginX, roadY + roadH / 2);
    ctx.lineTo(marginX + boardW, roadY + roadH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Posições dos 4 Setores (10 cm, 30 cm, 50 cm, 70 cm de 80 cm totais)
    const sensorOffsets = [0.125, 0.375, 0.625, 0.875];

    sensorOffsets.forEach((ratio, idx) => {
        const posX = marginX + boardW * ratio;

        // Postes Norte e Sul (Círculos Amarelos com borda branca)
        ctx.fillStyle = "#fcd34d";
        ctx.beginPath();
        ctx.arc(posX, roadY - 14, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(posX, roadY + roadH + 18, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Sensor TCRT5000 LATERAL na Calçada Sul (apontando horizontalmente para a pista)
        const sensorX = posX - 12;
        const sensorY = roadY + roadH + 2;
        const sensorW = 24;
        const sensorH = 12;

        ctx.fillStyle = "#ef4444";
        ctx.fillRect(sensorX, sensorY, sensorW, sensorH);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sensorX, sensorY, sensorW, sensorH);

        // Feixe óptico horizontal que cruza a faixa da pista
        ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(posX, sensorY);
        ctx.lineTo(posX, roadY + roadH / 2 + 4);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rótulos de Setor
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 11px Plus Jakarta Sans";
        ctx.fillText(`SETOR ${idx}`, posX - 24, marginY + 16);

        // Distância na régua
        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px JetBrains Mono";
        const cmPos = 10 + idx * 20;
        ctx.fillText(`${cmPos} cm`, posX - 14, marginY + boardH - 8);
    });

    // Legenda inferior
    ctx.fillStyle = "#fcd34d";
    ctx.fillText("🟡 Poste de LED", marginX + 10, h - 8);
    ctx.fillStyle = "#ef4444";
    ctx.fillText("🟥 Sensor Lateral (Calçada)", marginX + 120, h - 8);
    ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
    ctx.fillText("┄ Feixe Horizontal", marginX + 290, h - 8);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Base: 80 cm x 30 cm", w - 160, h - 8);
}

function toggleStep(stepIdx) {
    const accordions = document.querySelectorAll('.step-accordion');
    accordions.forEach((acc, i) => {
        if (i === stepIdx) acc.classList.toggle('active');
        else acc.classList.remove('active');
    });
}

function toggleCheckItem(labelEl) {
    const checkbox = labelEl.querySelector('input');
    labelEl.classList.toggle('done', checkbox.checked);
}
