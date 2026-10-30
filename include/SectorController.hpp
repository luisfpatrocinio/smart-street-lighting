#pragma once

#include "Config.hpp"
#include <Arduino.h>

// ============================================================================
// CLASSE: ControladorSetor
// Representa 1 setor da maquete (1 sensor infravermelho + 1 par de postes).
// Essa classe cuida de:
// 1. Ler o sensor sem travar a placa.
// 2. Acender os postes quando um carrinho passar.
// 3. Fazer o efeito suave de acender e apagar devagarzinho (fade).
// ============================================================================
class ControladorSetor {
public:
    // Construtor: recebe as configurações do pino deste setor
    explicit ControladorSetor(const SetorPoste& configSetor);

    // Configura os pinos de entrada e saída no início do programa
    void iniciar();

    // Esta função roda milhares de vezes por segundo no loop()
    void atualizar(uint32_t tempoAtualMs);

    // Métodos para consultar o estado do setor (usados para mostrar na tela)
    bool temCarro() const;
    uint8_t obterBrilhoAtual() const;
    uint8_t obterPorcentagemBrilho() const;
    const char* obterNomeEstado() const;
    const SetorPoste& obterConfig() const;

private:
    // Funções internas que dividem o trabalho
    void filtrarLeituraSensor(uint32_t tempoAtualMs);
    void decidirBrilhoDesejado(uint32_t tempoAtualMs);
    void ajustarBrilhoSuave(uint32_t tempoAtualMs);
    void enviarPwmParaLed(uint8_t brilho);

    SetorPoste config;

    uint8_t brilhoAtual;        // Brilho que está saindo no LED agora (0 a 255)
    uint8_t brilhoDesejado;     // Brilho para onde o LED deve ir (35 ou 255)

    bool leituraBrutaSensor;    // O que o pino acabou de ler
    bool leituraEstavelSensor;  // Leitura confirmada pelo filtro de ruído

    uint32_t momentoFiltro;     // Cronômetro do filtro de ruído
    uint32_t momentoCarroSaiu;  // Cronômetro para contar os 2,5 segundos
    uint32_t momentoFade;       // Cronômetro da animação de clarear/apagar
};
