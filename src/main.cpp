/**
 * @file main.cpp
 * @brief Programa principal do sistema de Iluminação Pública Inteligente.
 * @project Iluminação Pública Inteligente (Smart City) — Feira de Robótica
 * @target Microcontrolador ESP32 NodeMCU (WROOM-32)
 * 
 * Executa a inicialização de todos os setores e processa o loop de controle
 * de forma contínua e 100% não-bloqueante, sem nenhuma chamada a delay().
 */

#include "Config.hpp"
#include "SectorController.hpp"
#include <Arduino.h>

using namespace SmartLighting;

// ============================================================================
// INSTANCIAÇÃO DOS SETORES DA MAQUETE
// ============================================================================
// Cria o arranjo contendo o Setor 0 para validação na bancada
ControladorSetor setores[TOTAL_SETORES] = {
    ControladorSetor(LISTA_SETORES[0])
};

// Variável para controle da taxa de atualização do monitor serial
uint32_t momentoUltimoRelatorio = 0;

/**
 * @brief Imprime o cabeçalho descritivo com os dados de calibração do sistema.
 */
void imprimirPainelInicial() {
    Serial.println();
    Serial.println(F("===================================================================="));
    Serial.println(F("     PROJETO DE ROBÓTICA: POSTES INTELIGENTES (SMART STREET LIGHT)   "));
    Serial.println(F("===================================================================="));
    Serial.printf(" Quantidade de Setores : %u\n", static_cast<unsigned int>(TOTAL_SETORES));
    Serial.printf(" Frequencia do PWM     : %lu Hz (sem cintilacao no olho humano)\n", static_cast<unsigned long>(FREQUENCIA_PWM_HZ));
    Serial.printf(" Brilho Noturno (Lua)  : %u (~14%% de energia consumida)\n", BRILHO_LUA);
    Serial.printf(" Brilho com Carro      : %u (100%% de potencia)\n", BRILHO_MAXIMO);
    Serial.printf(" Tempo Aceso na Saida  : %lu ms (2,5 segundos de seguranca)\n", static_cast<unsigned long>(TEMPO_MANTER_ACESO_MS));
    Serial.printf(" Filtro de Ruido (IR)  : %lu ms (software debounce)\n", static_cast<unsigned long>(TEMPO_FILTRO_RUIDO_MS));
    Serial.println(F("--------------------------------------------------------------------"));
    Serial.println(F(" Mapeamento dos Pinos no ESP32:"));
    for (size_t i = 0; i < TOTAL_SETORES; ++i) {
        const auto& cfg = setores[i].obterConfig();
        Serial.printf("  [Setor %u] Sensor Infravermelho: GPIO %2u  |  LEDs dos Postes: GPIO %2u  |  Canal PWM %u\n",
                      cfg.id, cfg.pinoSensor, cfg.pinoLed, cfg.canalPwm);
    }
    Serial.println(F("===================================================================="));
    Serial.println(F(" SISTEMA LIGADO! PISTA MONITORADA EM TEMPO REAL...\n"));
}

/**
 * @brief Transmite telemetria formatada a cada 500 ms para visualização no computador.
 * @param tempoAtualMs Tempo atual em milissegundos retornado por millis().
 */
void imprimirStatusNaTela(uint32_t tempoAtualMs) {
    if ((tempoAtualMs - momentoUltimoRelatorio) < INTERVALO_MENSAGENS_MS) {
        return;
    }
    momentoUltimoRelatorio = tempoAtualMs;

    Serial.printf("[%6lu s] (D18_RAW=%d) ", 
                  static_cast<unsigned long>(tempoAtualMs / 1000), 
                  digitalRead(18));

    for (size_t i = 0; i < TOTAL_SETORES; ++i) {
        bool carroDetectado = setores[i].temCarro();
        uint8_t porcentagem = setores[i].obterPorcentagemBrilho();

        Serial.printf("Setor %u:[%s|%3u%%|%s]   ",
                      setores[i].obterConfig().id,
                      carroDetectado ? "🚗 CARRO" : "--- LIVRE",
                      porcentagem,
                      setores[i].obterNomeEstado());
    }
    Serial.println();
}

// ============================================================================
// SETUP: Executado uma única vez ao ligar o ESP32
// ============================================================================
void setup() {
    Serial.begin(115200);

    // Aguarda estabilização da porta de comunicação serial
    delay(500);

    // Inicializa cada um dos 4 setores da maquete
    for (size_t i = 0; i < TOTAL_SETORES; ++i) {
        setores[i].iniciar();
    }

    imprimirPainelInicial();
}

// ============================================================================
// LOOP: Executado continuamente milhares de vezes por segundo
// ============================================================================
void loop() {
    // Amostra o relógio interno do microcontrolador
    const uint32_t tempoAtualMs = millis();

    // Atualiza a máquina de estados e temporizadores de cada setor
    for (size_t i = 0; i < TOTAL_SETORES; ++i) {
        setores[i].atualizar(tempoAtualMs);
    }

    // Emite os dados de monitoramento via Serial
    imprimirStatusNaTela(tempoAtualMs);
}
