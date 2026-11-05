/**
 * ============================================================================
 * NAVEGADOR DE CÓDIGO DIDÁTICO E EXPLICATIVO
 * ============================================================================
 * Trechos de código em C++ com sintaxe colorida e explicações
 * focadas na lógica de funcionamento dos 4 postes inteligentes.
 * ============================================================================
 */

const CODE_TOPICS = {
    debounce: {
        file: "main.cpp",
        title: "Filtro de Ruído Digital (Debounce)",
        explanation: `<strong>Objetivo:</strong> O ESP32 valida a detecção apenas após o sinal do sensor permanecer estável por mais de <strong>30 milissegundos</strong>, eliminando falsos disparos causados pela luz ambiente.`,
        snippet: `<span class="code-comment">// 1. Leitura do Sensor com Filtro de Ruído Digital (30ms)</span>
<span class="code-type">int</span> <span class="code-var">leitura</span> = <span class="code-func">digitalRead</span>(p.pinoSensor);
<span class="code-keyword">if</span> (<span class="code-var">leitura</span> != p.ultimaLeituraBruta) {
    p.ultimaLeituraBruta = <span class="code-var">leitura</span>;
    p.momentoFiltro = <span class="code-var">agora</span>;
}
<span class="code-line-highlight"><span class="code-keyword">if</span> ((<span class="code-var">agora</span> - p.momentoFiltro) >= <span class="code-var">TEMPO_FILTRO_MS</span>) {
    p.leituraEstavel = p.ultimaLeituraBruta;
}

<span class="code-comment">// Com INPUT_PULLUP: LOW = carro refletindo o feixe infravermelho</span>
p.carroDetectado = (p.leituraEstavel == LOW);</span>`
    },
    regra25: {
        file: "main.cpp",
        title: "Temporizador de Travessia (2,5s)",
        explanation: `<strong>Objetivo:</strong> Mantém o poste em 100% de brilho por <strong>2.500 milissegundos</strong> após a saída do veículo, garantindo a travessia segura antes de iniciar a economia de energia.`,
        snippet: `<span class="code-comment">// 2. Temporizador de Segurança (2,5 segundos)</span>
<span class="code-keyword">if</span> (p.carroDetectado) {
<span class="code-line-highlight">    p.brilhoDesejado = <span class="code-var">BRILHO_MAXIMO</span>; <span class="code-comment">// 255 (100% de luz)</span>
    p.momentoSaida = <span class="code-var">agora</span>;           <span class="code-comment">// Guarda o momento da saída</span></span>
} <span class="code-keyword">else</span> {
<span class="code-line-highlight">    <span class="code-keyword">if</span> ((<span class="code-var">agora</span> - p.momentoSaida) < <span class="code-var">TEMPO_SEGURANCA_MS</span>) {
        p.brilhoDesejado = <span class="code-var">BRILHO_MAXIMO</span>; <span class="code-comment">// Mantém 100% pelos 2,5s</span>
    } <span class="code-keyword">else</span> {
        p.brilhoDesejado = <span class="code-var">BRILHO_LUA</span>;    <span class="code-comment">// Retorna ao modo econômico (14%)</span>
    }</span>
}`
    },
    fade: {
        file: "main.cpp",
        title: "Dimerização Gradual (Fade Suave)",
        explanation: `<strong>Objetivo:</strong> Altera o brilho em passos controlados a cada 15 milissegundos, gerando uma transição visual confortável e sem oscilações bruscas na rede.`,
        snippet: `<span class="code-comment">// 3. Efeito Fade (Dimerização Suave a cada 15ms)</span>
<span class="code-keyword">if</span> ((<span class="code-var">agora</span> - p.momentoFade) >= <span class="code-var">TEMPO_FADE_MS</span>) {
    p.momentoFade = <span class="code-var">agora</span>;
<span class="code-line-highlight">    <span class="code-keyword">if</span> (p.brilhoAtual < p.brilhoDesejado) {
        p.brilhoAtual = <span class="code-func">min</span>(p.brilhoDesejado, p.brilhoAtual + <span class="code-var">PASSO_ACENDER</span>);
        <span class="code-func">enviarPwm</span>(p.pinoLed, p.canalPwm, p.brilhoAtual);
    } <span class="code-keyword">else if</span> (p.brilhoAtual > p.brilhoDesejado) {
        p.brilhoAtual = <span class="code-func">max</span>(p.brilhoDesejado, p.brilhoAtual - <span class="code-var">PASSO_APAGAR</span>);
        <span class="code-func">enviarPwm</span>(p.pinoLed, p.canalPwm, p.brilhoAtual);
    }</span>
}`
    },
    millis: {
        file: "main.cpp",
        title: "Multitarefa em Tempo Real com millis()",
        explanation: `<strong>Objetivo:</strong> O uso de <code>millis()</code> substitui pausas bloqueantes de <code>delay()</code>, permitindo que os 4 postes operem simultaneamente sem perda de sincronismo.`,
        snippet: `<span class="code-comment">// LOOP: Monitora os 4 postes continuamente sem travar o ESP32</span>
<span class="code-type">void</span> <span class="code-func">loop</span>() {
<span class="code-line-highlight">    <span class="code-keyword">const</span> <span class="code-type">unsigned long</span> <span class="code-var">agora</span> = <span class="code-func">millis</span>();</span>

    <span class="code-comment">// 1. Atualiza cada um dos 4 postes de forma independente</span>
    <span class="code-keyword">for</span> (<span class="code-type">int</span> <span class="code-var">i</span> = 0; <span class="code-var">i</span> < <span class="code-var">TOTAL_POSTES</span>; <span class="code-var">i</span>++) {
        <span class="code-func">atualizarPoste</span>(postes[<span class="code-var">i</span>], <span class="code-var">agora</span>);
    }

    <span class="code-comment">// 2. Relatório de Telemetria no Monitor Serial a cada 500ms</span>
    <span class="code-keyword">if</span> ((<span class="code-var">agora</span> - ultimoRelatorio) >= <span class="code-var">INTERVALO_SERIAL_MS</span>) {
        <span class="code-func">imprimirStatus</span>(<span class="code-var">agora</span>);
    }
}`
    },
    pwmwrite: {
        file: "main.cpp",
        title: "Geração de Pulsos PWM (5.000 Hz)",
        explanation: `<strong>Objetivo:</strong> A função <code>ledcWrite()</code> ajusta o ciclo de trabalho de 0 a 255 diretamente no hardware do ESP32, sem sobrecarregar o processador principal.`,
        snippet: `<span class="code-comment">// Envia valor PWM (0 a 255) para o hardware do ESP32</span>
<span class="code-type">void</span> <span class="code-func">enviarPwm</span>(<span class="code-type">int</span> <span class="code-var">pinoLed</span>, <span class="code-type">int</span> <span class="code-var">canalPwm</span>, <span class="code-type">int</span> <span class="code-var">brilho</span>) {
<span class="code-line-highlight">#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    <span class="code-func">ledcWrite</span>(<span class="code-var">pinoLed</span>, <span class="code-var">brilho</span>);
#else
    <span class="code-func">ledcWrite</span>(<span class="code-var">canalPwm</span>, <span class="code-var">brilho</span>);
#endif</span>
}`
    }
};

function showCodeTopic(topicKey, targetBtn) {
    document.querySelectorAll('.code-menu-btn').forEach(b => b.classList.remove('active'));
    
    if (targetBtn) {
        targetBtn.classList.add('active');
    } else {
        const defaultBtn = document.querySelector(`.code-menu-btn[data-topic="${topicKey}"]`);
        if (defaultBtn) defaultBtn.classList.add('active');
    }

    const topic = CODE_TOPICS[topicKey];
    if (!topic) return;

    const fileLabel = document.getElementById('codeFileLabel');
    const explBanner = document.getElementById('codeExplanation');
    const snippetArea = document.getElementById('codeSnippetArea');

    if (fileLabel) fileLabel.innerText = `📄 ${topic.file}`;
    if (explBanner) explBanner.innerHTML = topic.explanation;
    if (snippetArea) snippetArea.innerHTML = topic.snippet;
}
