#pragma once

#include <Arduino.h>

// ============================================================================
// PROJETO: ILUMINAÇÃO PÚBLICA INTELIGENTE (SMART CITY)
// Nível: Feira de Ciências e Robótica - Ensino Fundamental (6º ao 8º ano)
// ============================================================================
// Este arquivo guarda as configurações principais do nosso sistema:
// - Quais pinos do ESP32 usamos
// - O brilho das luzes (fraco ou forte)
// - Os tempos de espera e transição (em milissegundos)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. CONFIGURAÇÕES DE BRILHO E PWM
// PWM (Modulação por Largura de Pulso) é o jeito que o ESP32 usa para
// controlar o brilho do LED sem precisar de potenciômetro mecânico.
// Os valores vão de 0 (totalmente apagado) a 255 (brilho máximo).
// ----------------------------------------------------------------------------
constexpr uint32_t FREQUENCIA_PWM_HZ   = 5000; // 5000 Hz: bem rápido para não piscar no olho humano
constexpr uint8_t  RESOLUCAO_PWM_BITS  = 8;    // 8 bits = valores de 0 a 255
constexpr uint8_t  BRILHO_LUA          = 35;   // ~14% de brilho (Modo Noturno / Ecológico)
constexpr uint8_t  BRILHO_MAXIMO       = 255;  // 100% de brilho (Quando passa um carro)

// Velocidade com que a luz clareia e escurece (suavidade)
constexpr uint8_t  PASSO_ACENDER       = 8;    // Quanto aumenta o brilho a cada passo
constexpr uint8_t  PASSO_APAGAR        = 3;    // Quanto diminui o brilho a cada passo (mais lento e suave)

// ----------------------------------------------------------------------------
// 2. TEMPOS DO SISTEMA (EM MILISSEGUNDOS)
// Dica para a feira: 1000 milissegundos = 1 segundo.
// Usamos a função millis() para não travar o cérebro do ESP32!
// ----------------------------------------------------------------------------
constexpr uint32_t TEMPO_MANTER_ACESO_MS  = 2500; // Mantém a luz 100% por 2,5 segundos após o carro passar
constexpr uint32_t INTERVALO_EFEITO_MS    = 15;   // Atualiza a transição suave a cada 15 milissegundos
constexpr uint32_t TEMPO_FILTRO_RUIDO_MS  = 30;   // Filtro de 30ms para evitar falsos alarmes no sensor IR
constexpr uint32_t INTERVALO_MENSAGENS_MS = 500;  // Envia dados para o computador na tela a cada meio segundo

// ----------------------------------------------------------------------------
// 3. COMO O SENSOR TCRT5000 FUNCIONA?
// O sensor de obstáculo infravermelho funciona com lógica "ativo em nível baixo":
// - Sem carro na frente: a saída fica em HIGH (3.3V)
// - Com carro na frente: a saída vai para LOW (0V)
// ----------------------------------------------------------------------------
constexpr uint8_t SENSOR_CARRO_PRESENTE = LOW;

// ----------------------------------------------------------------------------
// 4. ESTRUTURA DE UM SETOR DA PISTA (POSTE + SENSOR)
// Cada setor da nossa maquete tem 1 sensor de pista e 1 par de postes de luz.
// ----------------------------------------------------------------------------
struct SetorPoste {
    uint8_t id;         // Número do setor (0, 1, 2 ou 3)
    uint8_t pinoSensor; // Pino do ESP32 ligado no pino DO do sensor TCRT5000
    uint8_t pinoLed;    // Pino do ESP32 ligado no polo positivo dos LEDs
    uint8_t canalPwm;   // Canal interno do ESP32 para controlar a intensidade
};

// Quantidade de setores na nossa maquete
constexpr size_t TOTAL_SETORES = 4;

// Mapeamento dos pinos do ESP32 para cada setor:
// Setor 0: Sensor no GPIO 18 | LEDs no GPIO 25 | Canal PWM 0
// Setor 1: Sensor no GPIO 19 | LEDs no GPIO 26 | Canal PWM 1
// Setor 2: Sensor no GPIO 21 | LEDs no GPIO 27 | Canal PWM 2
// Setor 3: Sensor no GPIO 22 | LEDs no GPIO 14 | Canal PWM 3
constexpr SetorPoste LISTA_SETORES[TOTAL_SETORES] = {
    {0, 18, 25, 0},
    {1, 19, 26, 1},
    {2, 21, 27, 2},
    {3, 22, 14, 3}
};
