/**
 * ============================================================================
 * ORQUESTRADOR PRINCIPAL DA APLICAÇÃO WEB (SMART STREET LIGHTING)
 * ============================================================================
 * Gerencia a navegação por abas, dimensionamento responsivo dos canvases
 * e disparo dos ciclos de inicialização dos módulos.
 * ============================================================================
 */

function switchTab(tabId) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('main > section').forEach(sec => sec.classList.remove('active'));

    const targetSec = document.getElementById(`sec-${tabId}`);
    const targetLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);

    if (targetSec) targetSec.classList.add('active');
    if (targetLink) targetLink.classList.add('active');

    if (tabId === 'sim3d') {
        resize3D();
    } else if (tabId === 'circuito') {
        resizeCircuits();
    } else if (tabId === 'montagem') {
        const bpCanvas = document.getElementById('blueprintCanvas');
        if (bpCanvas && bpCanvas.parentElement) {
            bpCanvas.width = bpCanvas.parentElement.clientWidth;
            bpCanvas.height = bpCanvas.parentElement.clientHeight;
        }
        renderBlueprint();
    }
}

function handleGlobalResize() {
    resize3D();
    resizeCircuits();

    const bpCanvas = document.getElementById('blueprintCanvas');
    if (bpCanvas && bpCanvas.parentElement) {
        bpCanvas.width = bpCanvas.parentElement.clientWidth;
        bpCanvas.height = bpCanvas.parentElement.clientHeight;
        renderBlueprint();
    }
}

// Inicialização de todos os módulos ao carregar a página
window.addEventListener('load', () => {
    // 1. Inicializa Maquete 3D
    init3D();
    animate3D(performance.now());

    // 2. Inicializa Circuitos e Osciloscópio
    resizeCircuits();
    initCircuits();

    // 3. Inicializa Tópico Padrão do Código
    showCodeTopic('debounce');

    // 4. Inicializa Canvas de Montagem
    const bpCanvas = document.getElementById('blueprintCanvas');
    if (bpCanvas && bpCanvas.parentElement) {
        bpCanvas.width = bpCanvas.parentElement.clientWidth;
        bpCanvas.height = bpCanvas.parentElement.clientHeight;
    }
    renderBlueprint();
});

window.addEventListener('resize', handleGlobalResize);
