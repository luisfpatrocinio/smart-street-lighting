/**
 * @file Config.hpp
 * @brief Configurações globais, pinagem do ESP32 e parâmetros de iluminação.
 * @project Iluminação Pública Inteligente (Smart City) — Feira de Robótica
 * @author Equipe de Robótica / Engenharia Embarcada
 * 
 * Este cabeçalho centraliza todas as definições de constantes de hardware e software:
 * - Atribuição de pinos GPIO para sensores TCRT5000 e acionamento de LEDs
 * - Resolução e frequência de hardware PWM (LEDC)
 * - Níveis de duty cycle (Modo Noturno Econômico vs Potência Máxima)
 * - Janelas de temporização não-bloqueante (millis) para debounce, fade e hold
 */

#pragma once

#include <Arduino.h>
#include <cstdint>
#include <cstddef>

namespace SmartLighting {

// ============================================================================
// 1. CONFIGURAÇÕES DE BRILHO E PWM (MODULAÇÃO POR LARGURA DE PULSO)
// ============================================================================

/**
 * @brief Frequência da onda quadrada do periférico LEDC em Hertz (5 kHz).
 * Evita qualquer zumbido mecânico audível e impede o efeito de linhas onduladas (rolling shutter)
 * quando os jurados e visitantes gravam vídeos da maquete com a câmera do celular.
 */
constexpr uint32_t FREQUENCIA_PWM_HZ   = 5000;

/**
 * @brief Resolução em bits para o periférico de PWM do ESP32.
 * 8 bits = 2^8 = 256 níveis possíveis (valores inteiros de 0 a 255).
 */
constexpr uint8_t  RESOLUCAO_PWM_BITS  = 8;

/**
 * @brief Brilho Noturno / Modo Lua (~13,7% da potência máxima).
 * Valor 35 de 255. Mantém a rua iluminada para pedestres na madrugada
 * gerando uma economia de até 80% de eletricidade quando a via está deserta.
 */
constexpr uint8_t  BRILHO_LUA          = 35;

/**
 * @brief Brilho Máximo acionado quando um veículo é detectado (100% de potência).
 * Valor 255 de 255. Iluminação total para segurança e visibilidade do tráfego.
 */
constexpr uint8_t  BRILHO_MAXIMO       = 255;

/**
 * @brief Taxa de incremento do brilho por ciclo de atualização (Fade In).
 * Incrementa 8 níveis a cada 15 ms, clareando o poste de forma rápida e segura.
 */
constexpr uint8_t  PASSO_ACENDER       = 8;

/**
 * @brief Taxa de decremento do brilho por ciclo de atualização (Fade Out).
 * Reduz 3 níveis a cada 15 ms, escurecendo a luz de forma suave para não ofuscar motoristas.
 */
constexpr uint8_t  PASSO_APAGAR        = 3;

// ============================================================================
// 2. TEMPOS DO SISTEMA (EM MILISSEGUNDOS — CONTROLADOS COM millis())
// ============================================================================

/**
 * @brief Tempo de permanência do poste em 100% após a saída do veículo (2,5 segundos).
 * Garante que o motorista complete a travessia de todo o setor antes da luz começar a diminuir.
 */
constexpr uint32_t TEMPO_MANTER_ACESO_MS  = 2500;

/**
 * @brief Intervalo de tempo entre cada pequeno ajuste na rampa de brilho (15 milissegundos).
 * Proporciona uma animação contínua e visualmente agradável ao olho humano.
 */
constexpr uint32_t INTERVALO_EFEITO_MS    = 15;

/**
 * @brief Janela de estabilidade do filtro de ruído digital (Software Debounce) em 30 ms.
 * Rejeita oscilações rápidas causadas pela iluminação fluorescente ou sombras do ambiente.
 */
constexpr uint32_t TEMPO_FILTRO_RUIDO_MS  = 30;

/**
 * @brief Taxa de transmissão de telemetria diagnóstica na porta serial (500 ms).
 * Atualiza o Monitor Serial duas vezes por segundo para visualização no computador da feira.
 */
constexpr uint32_t INTERVALO_MENSAGENS_MS = 500;

// ============================================================================
// 3. LÓGICA DO SENSOR ÓPTICO TCRT5000
// ============================================================================

/**
 * @brief Nível lógico do pino DO (Digital Output) quando um objeto reflete o feixe IR.
 * O comparador LM393 da plaquinha chaveia para nível lógico BAIXO (0V / LOW) ao detectar o carro.
 */
constexpr uint8_t SENSOR_CARRO_PRESENTE = LOW;

// ============================================================================
// 4. ESTRUTURA DE DEFINIÇÃO DE HARDWARE POR SETOR
// ============================================================================

/**
 * @struct SetorPoste
 * @brief Encapsula os pinos e canais de hardware atribuídos a um setor da pista.
 */
struct SetorPoste {
    uint8_t id;         ///< Identificador numérico do setor (0 a 3)
    uint8_t pinoSensor; ///< Pino GPIO do ESP32 ligado na saída digital (DO) do TCRT5000
    uint8_t pinoLed;    ///< Pino GPIO do ESP32 conectado aos ânodos dos LEDs através de 220Ω
    uint8_t canalPwm;   ///< Canal interno do periférico LEDC (0 a 15) no Arduino Core 2.x
};

/**
 * @brief Número total de setores independentes distribuídos ao longo da pista da maquete.
 */
constexpr size_t TOTAL_SETORES = 4;

/**
 * @brief Mapeamento de pinos padrão para a maquete de 4 setores:
 * - Setor 0: Sensor no GPIO 18 | LEDs no GPIO 25 | Canal PWM 0
 * - Setor 1: Sensor no GPIO 19 | LEDs no GPIO 26 | Canal PWM 1
 * - Setor 2: Sensor no GPIO 21 | LEDs no GPIO 27 | Canal PWM 2
 * - Setor 3: Sensor no GPIO 22 | LEDs no GPIO 14 | Canal PWM 3
 */
constexpr SetorPoste LISTA_SETORES[TOTAL_SETORES] = {
    {0, 18, 25, 0},
    {1, 19, 26, 1},
    {2, 21, 27, 2},
    {3, 22, 14, 3}
};

} // namespace SmartLighting
