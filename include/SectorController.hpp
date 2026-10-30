/**
 * @file SectorController.hpp
 * @brief Declaração da classe controladora de um setor de iluminação da maquete.
 * @project Iluminação Pública Inteligente (Smart City) — Feira de Robótica
 * 
 * Cada instância da classe ControladorSetor é responsável por um par de postes
 * e um sensor infravermelho de chão, executando filtros de sinal, máquina de estados
 * de iluminação e geração de sinal PWM de forma totalmente não-bloqueante.
 */

#pragma once

#include "Config.hpp"
#include <Arduino.h>

namespace SmartLighting {

/**
 * @class ControladorSetor
 * @brief Gerencia o ciclo de vida, debounce, temporização e brilho de 1 setor rodoviário.
 */
class ControladorSetor {
public:
    /**
     * @brief Construtor da classe.
     * @param configSetor Estrutura com id, pinoSensor, pinoLed e canalPwm do setor.
     */
    explicit ControladorSetor(const SetorPoste& configSetor);

    /**
     * @brief Inicializa os pinos de GPIO como entrada com pull-up e configura o periférico PWM LEDC.
     * Deve ser chamada na função setup() do Arduino.
     */
    void iniciar();

    /**
     * @brief Ciclo de execução periódica não-bloqueante do setor.
     * Deve ser chamada a cada iteração do loop() principal passando o millis() atual.
     * @param tempoAtualMs Carimbo de tempo do relógio da CPU em milissegundos.
     */
    void atualizar(uint32_t tempoAtualMs);

    /**
     * @brief Indica se há um veículo confirmado na frente do sensor óptico.
     * @return true se o veículo estiver presente (sensor estável em LOW), false caso contrário.
     */
    bool temCarro() const;

    /**
     * @brief Retorna o valor absoluto atual do ciclo de trabalho PWM do LED.
     * @return Valor no intervalo de 0 (desligado) a 255 (potência máxima).
     */
    uint8_t obterBrilhoAtual() const;

    /**
     * @brief Retorna o percentual atual de potência entregue aos postes deste setor.
     * @return Valor percentual de 0% a 100%.
     */
    uint8_t obterPorcentagemBrilho() const;

    /**
     * @brief Retorna uma string descritiva amigável do estado atual do setor.
     * @return "CARRO NA FRENTE", "MANTENDO ACESO", "APAGANDO DEVAGAR" ou "MODO ECONOMICO".
     */
    const char* obterNomeEstado() const;

    /**
     * @brief Retorna a referência de configuração de pinagem do setor.
     */
    const SetorPoste& obterConfig() const;

private:
    /**
     * @brief Filtra ruídos transitórios e ruído óptico ambiente do sensor (Debounce).
     * @param tempoAtualMs Carimbo de tempo em milissegundos.
     */
    void filtrarLeituraSensor(uint32_t tempoAtualMs);

    /**
     * @brief Avalia o estado do tráfego e atualiza o brilhoDesejado com base na regra de 2,5s.
     * @param tempoAtualMs Carimbo de tempo em milissegundos.
     */
    void decidirBrilhoDesejado(uint32_t tempoAtualMs);

    /**
     * @brief Interpola suavemente o brilhoAtual em direção ao brilhoDesejado (Fade In/Fade Out).
     * @param tempoAtualMs Carimbo de tempo em milissegundos.
     */
    void ajustarBrilhoSuave(uint32_t tempoAtualMs);

    /**
     * @brief Escreve o ciclo de trabalho PWM diretamente no periférico de hardware do ESP32.
     * @param brilho Valor entre 0 e 255.
     */
    void enviarPwmParaLed(uint8_t brilho);

    SetorPoste config;          ///< Dados de pinagem e canais deste setor

    uint8_t brilhoAtual;        ///< Duty cycle efetivo sendo emitido nos LEDs (0 a 255)
    uint8_t brilhoDesejado;     ///< Duty cycle meta (BRILHO_LUA ou BRILHO_MAXIMO)

    bool leituraBrutaSensor;    ///< Amostra instantânea lida na porta digital
    bool leituraEstavelSensor;  ///< Valor validado após confirmação pela janela de 30 ms

    uint32_t momentoFiltro;     ///< Cronômetro da janela do filtro de ruído
    uint32_t momentoCarroSaiu;  ///< Momento exato em que o carro deixou o sensor (base dos 2,5s)
    uint32_t momentoFade;       ///< Cronômetro do intervalo de interpolação da luz (15 ms)
};

} // namespace SmartLighting
