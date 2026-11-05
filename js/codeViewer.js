/**
 * ============================================================================
 * NAVEGADOR DE CÓDIGO DIDÁTICO E EXPLICATIVO
 * ============================================================================
 * Contém os trechos de código em C++ com sintaxe colorida e explicações
 * pedagógicas focadas na apresentação para juízes e feiras escolares.
 * ============================================================================
 */

const CODE_TOPICS = {
    debounce: {
        file: "SectorController.cpp",
        title: "Filtro de Ruído Digital (Debounce)",
        explanation: `<strong>Objetivo:</strong> O ESP32 valida a detecção apenas após o sinal do sensor permanecer estável por mais de <strong>30 milissegundos</strong>, eliminando falsos disparos causados pela luz ambiente.`,
        snippet: `<span class="code-comment">// Lê o sensor e remove ruídos ou oscilações da luz ambiente</span>
<span class="code-type">void</span> <span class="code-func">ControladorSetor::filtrarLeituraSensor</span>(<span class="code-type">uint32_t</span> <span class="code-var">tempoAtualMs</span>) {
    <span class="code-type">bool</span> <span class="code-var">leituraAgora</span> = <span class="code-func">digitalRead</span>(config.pinoSensor);

    <span class="code-comment">// Se a leitura mudou, reiniciamos o cronômetro do filtro</span>
    <span class="code-keyword">if</span> (<span class="code-var">leituraAgora</span> != leituraBrutaSensor) {
        leituraBrutaSensor = <span class="code-var">leituraAgora</span>;
        momentoFiltro = <span class="code-var">tempoAtualMs</span>;
    }

<span class="code-line-highlight">    <span class="code-comment">// Confirma detecção após 30ms de sinal estável</span>
    <span class="code-keyword">if</span> ((<span class="code-var">tempoAtualMs</span> - momentoFiltro) >= <span class="code-var">TEMPO_FILTRO_RUIDO_MS</span>) {
        leituraEstavelSensor = leituraBrutaSensor;
    }</span>
}`
    },
    regra25: {
        file: "SectorController.cpp",
        title: "Temporizador de Travessia (2,5s)",
        explanation: `<strong>Objetivo:</strong> Mantém o setor em 100% de brilho por <strong>2.500 milissegundos</strong> após a saída do veículo, garantindo a travessia segura antes de iniciar a economia de energia.`,
        snippet: `<span class="code-comment">// Decide se o poste precisa ficar forte (carro) ou fraco (economia)</span>
<span class="code-type">void</span> <span class="code-func">ControladorSetor::decidirBrilhoDesejado</span>(<span class="code-type">uint32_t</span> <span class="code-var">tempoAtualMs</span>) {
    <span class="code-keyword">if</span> (<span class="code-func">temCarro</span>()) {
<span class="code-line-highlight">        brilhoDesejado = <span class="code-var">BRILHO_MAXIMO</span>; <span class="code-comment">// 255 (100% de luz)</span>
        momentoCarroSaiu = <span class="code-var">tempoAtualMs</span>; <span class="code-comment">// Guarda o momento da saída</span></span>
    } <span class="code-keyword">else</span> {
        <span class="code-comment">// Calcula quanto tempo se passou desde que o carro saiu</span>
        <span class="code-type">uint32_t</span> <span class="code-var">tempoDesdeQuePassou</span> = <span class="code-var">tempoAtualMs</span> - momentoCarroSaiu;

<span class="code-line-highlight">        <span class="code-keyword">if</span> (<span class="code-var">tempoDesdeQuePassou</span> < <span class="code-var">TEMPO_MANTER_ACESO_MS</span>) {
            brilhoDesejado = <span class="code-var">BRILHO_MAXIMO</span>; <span class="code-comment">// Mantém 100% pelos 2,5s</span>
        } <span class="code-keyword">else</span> {
            brilhoDesejado = <span class="code-var">BRILHO_LUA</span>;     <span class="code-comment">// Volta aos 14% econômicos</span>
        }</span>
    }
}`
    },
    fade: {
        file: "SectorController.cpp",
        title: "Dimerização Gradual (Fade Suave)",
        explanation: `<strong>Objetivo:</strong> Altera o brilho em passos controlados a cada 15 milissegundos, gerando uma transição visual confortável e sem oscilações bruscas na rede.`,
        snippet: `<span class="code-comment">// Faz a transição de brilho acontecer gradualmente</span>
<span class="code-type">void</span> <span class="code-func">ControladorSetor::ajustarBrilhoSuave</span>(<span class="code-type">uint32_t</span> <span class="code-var">tempoAtualMs</span>) {
    <span class="code-comment">// Só dá um passo de ajuste a cada 15 milissegundos</span>
    <span class="code-keyword">if</span> ((<span class="code-var">tempoAtualMs</span> - momentoFade) < <span class="code-var">INTERVALO_EFEITO_MS</span>) <span class="code-keyword">return</span>;
    momentoFade = <span class="code-var">tempoAtualMs</span>;

<span class="code-line-highlight">    <span class="code-keyword">if</span> (brilhoAtual < brilhoDesejado) {
        <span class="code-comment">// Clareia rápido (+8 por passo)</span>
        brilhoAtual = <span class="code-func">min</span>((<span class="code-type">int</span>)brilhoDesejado, (<span class="code-type">int</span>)brilhoAtual + <span class="code-var">PASSO_ACENDER</span>);
        <span class="code-func">enviarPwmParaLed</span>(brilhoAtual);
    } <span class="code-keyword">else if</span> (brilhoAtual > brilhoDesejado) {
        <span class="code-comment">// Escurece devagar e suave (-3 por passo)</span>
        brilhoAtual = <span class="code-func">max</span>((<span class="code-type">int</span>)brilhoDesejado, (<span class="code-type">int</span>)brilhoAtual - <span class="code-var">PASSO_APAGAR</span>);
        <span class="code-func">enviarPwmParaLed</span>(brilhoAtual);
    }</span>
}`
    },
    millis: {
        file: "main.cpp",
        title: "Multitarefa em Tempo Real com millis()",
        explanation: `<strong>Objetivo:</strong> O uso de <code>millis()</code> substitui pausas bloqueantes de <code>delay()</code>, permitindo que os 4 setores da pista operem simultaneamente sem perda de sincronismo.`,
        snippet: `<span class="code-comment">// O loop principal nunca para e nunca congela o processador</span>
<span class="code-type">void</span> <span class="code-func">loop</span>() {
<span class="code-line-highlight">    <span class="code-comment">// Lê o cronômetro contínuo do ESP32</span>
    <span class="code-keyword">const</span> <span class="code-type">uint32_t</span> <span class="code-var">tempoAtualMs</span> = <span class="code-func">millis</span>();</span>

    <span class="code-comment">// Atualiza os 4 setores da pista de forma simultânea</span>
    <span class="code-keyword">for</span> (<span class="code-type">size_t</span> <span class="code-var">i</span> = 0; <span class="code-var">i</span> < <span class="code-var">TOTAL_SETORES</span>; ++<span class="code-var">i</span>) {
        setores[<span class="code-var">i</span>].<span class="code-func">atualizar</span>(<span class="code-var">tempoAtualMs</span>);
    }

    <span class="code-comment">// Envia telemetria serial</span>
    <span class="code-func">imprimirStatusNaTela</span>(<span class="code-var">tempoAtualMs</span>);
}`
    },
    pwmwrite: {
        file: "SectorController.cpp",
        title: "Geração de Pulsos PWM (5.000 Hz)",
        explanation: `<strong>Objetivo:</strong> A função <code>ledcWrite()</code> ajusta o ciclo de trabalho de 0 a 255 diretamente no hardware do ESP32, sem sobrecarregar o processador principal.`,
        snippet: `<span class="code-comment">// Envia o valor de brilho de 0 a 255 para o gerador de pulsos de hardware</span>
<span class="code-type">void</span> <span class="code-func">ControladorSetor::enviarPwmParaLed</span>(<span class="code-type">uint8_t</span> <span class="code-var">brilho</span>) {
<span class="code-line-highlight">#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    <span class="code-comment">// Versão moderna do Arduino ESP32</span>
    <span class="code-func">ledcWrite</span>(config.pinoLed, <span class="code-var">brilho</span>);
#else
    <span class="code-comment">// Versão clássica do Arduino ESP32</span>
    <span class="code-func">ledcWrite</span>(config.canalPwm, <span class="code-var">brilho</span>);
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
    const explanationEl = document.getElementById('codeExplanation');
    const snippetEl = document.getElementById('codeSnippetArea');

    if (fileLabel) fileLabel.innerText = `📄 ${topic.file}`;
    if (explanationEl) explanationEl.innerHTML = topic.explanation;
    if (snippetEl) snippetEl.innerHTML = topic.snippet;
}
