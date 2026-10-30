#include "Config.hpp"
#include "SectorController.hpp"
#include <Arduino.h>

// ============================================================================
// PROJETO DE ROBÓTICA: ILUMINAÇÃO INTELIGENTE PARA CIDADES DO FUTURO (SMART CITY)
// Apresentação: Alunos do 6º ao 8º ano
// Placa: ESP32 NodeMCU
// ============================================================================

// Criamos a lista dos 4 setores da nossa maquete
ControladorSetor setores[TOTAL_SETORES] = {
    ControladorSetor(LISTA_SETORES[0]),
    ControladorSetor(LISTA_SETORES[1]),
    ControladorSetor(LISTA_SETORES[2]),
    ControladorSetor(LISTA_SETORES[3])
};

// Variável para controlar o tempo do envio de mensagens para o computador
uint32_t momentoUltimoRelatorio = 0;

// Função que imprime um painel de boas-vindas no Monitor Serial
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
    Serial.println(F("--------------------------------------------------------------------"));
    Serial.println(F(" Mapeamento dos Pinos no ESP32:"));
    for (size_t i = 0; i < TOTAL_SETORES; ++i) {
        const auto& cfg = setores[i].obterConfig();
        Serial.printf("  [Setor %u] Sensor Infravermelho: GPIO %2u  |  LEDs dos Postes: GPIO %2u\n",
                      cfg.id, cfg.pinoSensor, cfg.pinoLed);
    }
    Serial.println(F("===================================================================="));
    Serial.println(F(" SISTEMA LIGADO! PISTA MONITORADA EM TEMPO REAL...\n"));
}

// Função que envia o status de cada setor para a tela do computador
void imprimirStatusNaTela(uint32_t tempoAtualMs) {
    // Só envia mensagem a cada meio segundo (500 ms) para não poluir a tela
    if ((tempoAtualMs - momentoUltimoRelatorio) < INTERVALO_MENSAGENS_MS) {
        return;
    }
    momentoUltimoRelatorio = tempoAtualMs;

    Serial.printf("[%6lu s] ", static_cast<unsigned long>(tempoAtualMs / 1000));

    for (size_t i = 0; i < TOTAL_SETORES; ++i) {
        bool temCarro = setores[i].temCarro();
        uint8_t porcentagem = setores[i].obterPorcentagemBrilho();

        // Mostra o setor, se tem carrinho ou pista livre, e a porcentagem de luz
        Serial.printf("Setor %u:[%s|%3u%%|%s]   ",
                      setores[i].obterConfig().id,
                      temCarro ? "🚗 CARRO" : "--- LIVRE",
                      porcentagem,
                      setores[i].obterNomeEstado());
    }
    Serial.println();
}

// ============================================================================
// SETUP: Roda apenas UMA VEZ quando o ESP32 é ligado na tomada ou USB
// ============================================================================
void setup() {
    // Inicia a comunicação com o computador a 115200 bits por segundo
    Serial.begin(115200);

    // Pequena pausa de meio segundo para estabilizar a porta USB
    delay(500);

    // Liga e prepara cada um dos 4 setores da maquete
    for (size_t i = 0; i < TOTAL_SETORES; ++i) {
        setores[i].iniciar();
    }

    // Mostra as informações do projeto no Monitor Serial do computador
    imprimirPainelInicial();
}

// ============================================================================
// LOOP: Fica rodando SEM PARAR (milhares de vezes por segundo)
// ATENÇÃO: Nunca usamos delay() aqui dentro para o sistema não travar!
// ============================================================================
void loop() {
    // Pegamos o relógio interno do ESP32 (tempo desde que ligou)
    const uint32_t tempoAtualMs = millis();

    // Atualiza a lógica de cada um dos setores da pista
    for (size_t i = 0; i < TOTAL_SETORES; ++i) {
        setores[i].atualizar(tempoAtualMs);
    }

    // Mostra as leituras e gráficos de status no computador
    imprimirStatusNaTela(tempoAtualMs);
}
