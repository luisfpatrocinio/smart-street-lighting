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
        title: "Como funciona o Filtro de Ruído (Software Debounce)?",
        explanation: `<strong>🛡️ Problema:</strong> Na feira de ciências, lâmpadas do teto e sombras de pessoas passando podem enganar o sensor infravermelho.<br>
        <strong>💡 A Solução no Código:</strong> O ESP32 só aceita que é um carro de verdade se a leitura ficar firme e estável por mais de <strong>30 milissegundos</strong> seguidos!`,
        snippet: `<span class="code-comment">// Lê o sensor e remove ruídos ou piscadas da luz ambiente</span>
<span class="code-type">void</span> <span class="code-func">ControladorSetor::filtrarLeituraSensor</span>(<span class="code-type">uint32_t</span> <span class="code-var">tempoAtualMs</span>) {
    <span class="code-type">bool</span> <span class="code-var">leituraAgora</span> = <span class="code-func">digitalRead</span>(config.pinoSensor);

    <span class="code-comment">// Se a leitura mudou, reiniciamos o cronômetro do filtro</span>
    <span class="code-keyword">if</span> (<span class="code-var">leituraAgora</span> != leituraBrutaSensor) {
        leituraBrutaSensor = <span class="code-var">leituraAgora</span>;
        momentoFiltro = <span class="code-var">tempoAtualMs</span>;
    }

<span class="code-line-highlight">    <span class="code-comment">// Se ficou estável por 30ms, confirmamos que é um carro de verdade!</span>
    <span class="code-keyword">if</span> ((<span class="code-var">tempoAtualMs</span> - momentoFiltro) >= <span class="code-var">TEMPO_FILTRO_RUIDO_MS</span>) {
        leituraEstavelSensor = leituraBrutaSensor;
    }</span>
}`
    },
    regra25: {
        file: "SectorController.cpp",
        title: "Como funciona a Regra de Segurança dos 2,5 Segundos?",
        explanation: `<strong>⏱️ Segurança no Trânsito:</strong> Se a luz apagasse no mesmo milissegundo em que o carro saísse do sensor, o motorista ficaria no escuro!<br>
        <strong>💡 A Solução no Código:</strong> Guardamos o instante exato em que o carro passou. O poste só começa a apagar depois de <strong>2.500 milissegundos</strong>.`,
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
            brilhoDesejado = <span class="code-var">BRILHO_LUA</span>;     <span class="code-comment">// Volta aos 14% ecológicos</span>
        }</span>
    }
}`
    },
    fade: {
        file: "SectorController.cpp",
        title: "Como funciona o Efeito Suave de Acender e Apagar (Fade)?",
        explanation: `<strong>✨ Conforto Visual:</strong> Lâmpadas que acendem em um tranco repentino cegam o motorista.<br>
        <strong>💡 A Solução no Código:</strong> A cada 15 milissegundos, aumentamos ou diminuímos apenas alguns passinhos do brilho, criando uma curva suave e bonita!`,
        snippet: `<span class="code-comment">// Faz a transição de brilho acontecer devagar e com elegância</span>
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
        title: "Por que usamos millis() e NUNCA delay()?",
        explanation: `<strong>⏳ O Grande Erro do delay():</strong> O comando <code>delay()</code> congela todo o cérebro do ESP32. Se um carro passar no Setor 3 enquanto a placa está esperando um delay no Setor 1, o sensor perde o carro!<br>
        <strong>💡 O Segredo do millis():</strong> A função <code>millis()</code> lê o cronômetro interno do ESP32 sem parar o código. Assim, todos os 4 setores rodam ao mesmo tempo!`,
        snippet: `<span class="code-comment">// O loop principal nunca para e nunca congela o processador</span>
<span class="code-type">void</span> <span class="code-func">loop</span>() {
<span class="code-line-highlight">    <span class="code-comment">// Pegamos o relógio do ESP32 (milissegundos desde que foi ligado)</span>
    <span class="code-keyword">const</span> <span class="code-type">uint32_t</span> <span class="code-var">tempoAtualMs</span> = <span class="code-func">millis</span>();</span>

    <span class="code-comment">// Atualiza os 4 setores da pista de forma independente e simultânea</span>
    <span class="code-keyword">for</span> (<span class="code-type">size_t</span> <span class="code-var">i</span> = 0; <span class="code-var">i</span> < <span class="code-var">TOTAL_SETORES</span>; ++<span class="code-var">i</span>) {
        setores[<span class="code-var">i</span>].<span class="code-func">atualizar</span>(<span class="code-var">tempoAtualMs</span>);
    }

    <span class="code-comment">// Mostra os dados na tela do computador da feira</span>
    <span class="code-func">imprimirStatusNaTela</span>(<span class="code-var">tempoAtualMs</span>);
}`
    },
    pwmwrite: {
        file: "SectorController.cpp",
        title: "Como o comando ledcWrite comanda a potência?",
        explanation: `<strong>💡 Controle do Hardware:</strong> A função <code>ledcWrite()</code> escreve um valor entre <strong>0</strong> (totalmente apagado) e <strong>255</strong> (100% aceso). O ESP32 gera a onda quadrada na frequência de 5.000 Hz automaticamente pelo chip!`,
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
