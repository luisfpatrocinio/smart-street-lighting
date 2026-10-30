#include "SectorController.hpp"
#include <esp_arduino_version.h>

// Construtor: inicia as variáveis com valores seguros ao ligar a placa
ControladorSetor::ControladorSetor(const SetorPoste& configSetor)
    : config(configSetor),
      brilhoAtual(BRILHO_LUA),
      brilhoDesejado(BRILHO_LUA),
      leituraBrutaSensor(HIGH),
      leituraEstavelSensor(HIGH),
      momentoFiltro(0),
      momentoCarroSaiu(0),
      momentoFade(0) {
}

void ControladorSetor::iniciar() {
    // 1. Configura o pino do sensor como ENTRADA com resistor de puxar para cima (PULL-UP)
    // Isso evita que o pino fique "flutuando" ou dando leituras malucas
    pinMode(config.pinoSensor, INPUT_PULLUP);

    // 2. Configura a saída PWM do ESP32 para o pino dos LEDs
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    ledcAttach(config.pinoLed, FREQUENCIA_PWM_HZ, RESOLUCAO_PWM_BITS);
#else
    ledcSetup(config.canalPwm, FREQUENCIA_PWM_HZ, RESOLUCAO_PWM_BITS);
    ledcAttachPin(config.pinoLed, config.canalPwm);
#endif

    // 3. Acende o poste no modo noturno inicial (brilho suave)
    enviarPwmParaLed(brilhoAtual);

    // 4. Faz a primeira leitura do sensor
    leituraBrutaSensor = digitalRead(config.pinoSensor);
    leituraEstavelSensor = leituraBrutaSensor;
}

void ControladorSetor::atualizar(uint32_t tempoAtualMs) {
    // Passo 1: Lê o sensor e remove ruídos elétricos ou luz da sala
    filtrarLeituraSensor(tempoAtualMs);

    // Passo 2: Decide se o poste precisa ficar forte (carro) ou fraco (economia)
    decidirBrilhoDesejado(tempoAtualMs);

    // Passo 3: Faz a transição de brilho acontecer de forma suave, sem piscar
    ajustarBrilhoSuave(tempoAtualMs);
}

void ControladorSetor::filtrarLeituraSensor(uint32_t tempoAtualMs) {
    bool leituraAgora = digitalRead(config.pinoSensor);

    // Se o sensor mudou de valor, reiniciamos o cronômetro do filtro
    if (leituraAgora != leituraBrutaSensor) {
        leituraBrutaSensor = leituraAgora;
        momentoFiltro = tempoAtualMs;
    }

    // Se o valor ficou parado por mais de 30 milissegundos, é um carro de verdade!
    if ((tempoAtualMs - momentoFiltro) >= TEMPO_FILTRO_RUIDO_MS) {
        leituraEstavelSensor = leituraBrutaSensor;
    }
}

void ControladorSetor::decidirBrilhoDesejado(uint32_t tempoAtualMs) {
    if (temCarro()) {
        // Situação A: Tem carrinho passando no setor!
        brilhoDesejado = BRILHO_MAXIMO;
        momentoCarroSaiu = tempoAtualMs; // Guarda o momento para contar os 2,5 segundos depois
    } else {
        // Situação B: O carrinho já saiu da frente do sensor.
        // Calculamos quanto tempo se passou desde a saída:
        uint32_t tempoDesdeQuePassou = tempoAtualMs - momentoCarroSaiu;

        if (tempoDesdeQuePassou < TEMPO_MANTER_ACESO_MS) {
            // Ainda está nos 2,5 segundos de segurança: mantém luz total!
            brilhoDesejado = BRILHO_MAXIMO;
        } else {
            // Já passou o tempo de segurança: volta para a luz noturna econômica
            brilhoDesejado = BRILHO_LUA;
        }
    }
}

void ControladorSetor::ajustarBrilhoSuave(uint32_t tempoAtualMs) {
    // Só damos um passinho de fade a cada 15 milissegundos (para o olho ver suave)
    if ((tempoAtualMs - momentoFade) < INTERVALO_EFEITO_MS) {
        return;
    }

    momentoFade = tempoAtualMs;

    if (brilhoAtual < brilhoDesejado) {
        // Aumenta o brilho aos pouquinhos (fade in rápido)
        uint16_t proximo = static_cast<uint16_t>(brilhoAtual) + PASSO_ACENDER;
        brilhoAtual = (proximo >= brilhoDesejado) ? brilhoDesejado : static_cast<uint8_t>(proximo);
        enviarPwmParaLed(brilhoAtual);
    } else if (brilhoAtual > brilhoDesejado) {
        // Diminui o brilho aos pouquinhos (fade out suave e bonito)
        int16_t proximo = static_cast<int16_t>(brilhoAtual) - PASSO_APAGAR;
        brilhoAtual = (proximo <= brilhoDesejado) ? brilhoDesejado : static_cast<uint8_t>(proximo);
        enviarPwmParaLed(brilhoAtual);
    }
}

void ControladorSetor::enviarPwmParaLed(uint8_t brilho) {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    ledcWrite(config.pinoLed, brilho);
#else
    ledcWrite(config.canalPwm, brilho);
#endif
}

bool ControladorSetor::temCarro() const {
    return (leituraEstavelSensor == SENSOR_CARRO_PRESENTE);
}

uint8_t ControladorSetor::obterBrilhoAtual() const {
    return brilhoAtual;
}

uint8_t ControladorSetor::obterPorcentagemBrilho() const {
    return static_cast<uint8_t>((brilhoAtual * 100U) / 255U);
}

const SetorPoste& ControladorSetor::obterConfig() const {
    return config;
}

const char* ControladorSetor::obterNomeEstado() const {
    if (temCarro()) {
        return "CARRO NA FRENTE";
    }
    if (brilhoDesejado == BRILHO_MAXIMO) {
        return "MANTENDO ACESO";
    }
    if (brilhoAtual > BRILHO_LUA) {
        return "APAGANDO DEVAGAR";
    }
    return "MODO ECONOMICO";
}
