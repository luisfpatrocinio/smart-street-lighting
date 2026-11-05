/**
 * @file SectorController.cpp
 * @brief Implementação dos métodos da classe ControladorSetor.
 * @project Iluminação Pública Inteligente (Smart City) — Feira de Robótica
 */

#include "SectorController.hpp"
#include <esp_arduino_version.h>

namespace SmartLighting {

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
    // 1. Ativa o resistor interno de 45kΩ do ESP32 (INPUT_PULLUP)
    pinMode(config.pinoSensor, INPUT_PULLUP);

    // 2. Configura a saída PWM do ESP32 de acordo com a versão do framework Arduino
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    // Arduino ESP32 Core 3.x: API moderna baseada no pino diretamente
    ledcAttach(config.pinoLed, FREQUENCIA_PWM_HZ, RESOLUCAO_PWM_BITS);
#else
    // Arduino ESP32 Core 2.x: API clássica baseada em canal de hardware (0-15)
    ledcSetup(config.canalPwm, FREQUENCIA_PWM_HZ, RESOLUCAO_PWM_BITS);
    ledcAttachPin(config.pinoLed, config.canalPwm);
#endif

    // 3. Aplica o brilho noturno econômico inicial nos LEDs
    enviarPwmParaLed(brilhoAtual);

    // 4. Captura a primeira amostra do sensor para inicialização do filtro
    leituraBrutaSensor = digitalRead(config.pinoSensor);
    leituraEstavelSensor = leituraBrutaSensor;
}

void ControladorSetor::atualizar(uint32_t tempoAtualMs) {
    // Passo 1: Lê o sensor e remove ruídos transitórios ou oscilações da iluminação da sala
    filtrarLeituraSensor(tempoAtualMs);

    // Passo 2: Avalia a presença do veículo e aplica a regra de segurança dos 2,5 segundos
    decidirBrilhoDesejado(tempoAtualMs);

    // Passo 3: Interpola o brilho atual suavemente em direção à meta (rampa de aceleração óptica)
    ajustarBrilhoSuave(tempoAtualMs);
}

void ControladorSetor::filtrarLeituraSensor(uint32_t tempoAtualMs) {
    bool leituraAgora = digitalRead(config.pinoSensor);

    // Se o estado instantâneo mudou, reinicia a contagem da janela de confirmação
    if (leituraAgora != leituraBrutaSensor) {
        leituraBrutaSensor = leituraAgora;
        momentoFiltro = tempoAtualMs;
    }

    // Se a leitura permaneceu idêntica e contínua por mais de 30 ms, é uma detecção real!
    if ((tempoAtualMs - momentoFiltro) >= TEMPO_FILTRO_RUIDO_MS) {
        leituraEstavelSensor = leituraBrutaSensor;
    }
}

void ControladorSetor::decidirBrilhoDesejado(uint32_t tempoAtualMs) {
    if (temCarro()) {
        // Situação A: O carrinho está ativamente sobre o sensor deste setor
        brilhoDesejado = BRILHO_MAXIMO;
        momentoCarroSaiu = tempoAtualMs; // Armazena a marcação de tempo para iniciar os 2,5s
    } else {
        // Situação B: O carrinho já passou pelo sensor óptico
        uint32_t tempoDesdeQuePassou = tempoAtualMs - momentoCarroSaiu;

        if (tempoDesdeQuePassou < TEMPO_MANTER_ACESO_MS) {
            // Janela de retenção de 2,5 segundos: mantém 100% de luz para segurança do trânsito
            brilhoDesejado = BRILHO_MAXIMO;
        } else {
            // Tempo de retenção esgotado: comanda retorno suave ao modo noturno ecológico (14%)
            brilhoDesejado = BRILHO_LUA;
        }
    }
}

void ControladorSetor::ajustarBrilhoSuave(uint32_t tempoAtualMs) {
    // Executa um passo da rampa óptica apenas a cada 15 milissegundos
    if ((tempoAtualMs - momentoFade) < INTERVALO_EFEITO_MS) {
        return;
    }

    momentoFade = tempoAtualMs;

    if (brilhoAtual < brilhoDesejado) {
        // Fade In: aumenta o brilho (+8 por ciclo) de forma rápida e segura
        uint16_t proximo = static_cast<uint16_t>(brilhoAtual) + PASSO_ACENDER;
        brilhoAtual = (proximo >= brilhoDesejado) ? brilhoDesejado : static_cast<uint8_t>(proximo);
        enviarPwmParaLed(brilhoAtual);
    } else if (brilhoAtual > brilhoDesejado) {
        // Fade Out: reduz o brilho (-3 por ciclo) de forma lenta e confortável para a visão
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
        return "MANTENDO ACESO (2.5s)";
    }
    if (brilhoAtual > BRILHO_LUA) {
        return "APAGANDO DEVAGAR";
    }
    return "MODO ECONOMICO";
}

} // namespace SmartLighting
