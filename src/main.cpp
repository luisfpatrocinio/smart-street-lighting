/**
 * ============================================================================
 * PROJETO: Postes Inteligentes (Smart Street Lighting)
 * Plataforma: ESP32 NodeMCU
 * Feira de Robótica / Smart City
 * ============================================================================
 * 
 * O sistema controla 4 setores ao longo da via:
 * - 4 Sensores Infravermelhos (TCRT5000) nas calçadas laterais (1 por setor)
 * - 8 Postes de iluminação com LEDs (2 postes em paralelo por setor, um em cada calçada)
 * 
 * Lógica de Operação:
 * - Em repouso: brilho noturno econômico em 14% (~35/255).
 * - Ao detectar veículo: os 2 postes do setor sobem rapidamente para 100%.
 * - Após o veículo passar: sustenta 100% por 2,5 segundos e dimeriza suavemente.
 * 
 * Mapeamento dos Pinos no ESP32:
 * - Setor 1: Sensor GPIO 18 | Postes GPIO 2  | Canal PWM 0
 * - Setor 2: Sensor GPIO 19 | Postes GPIO 4  | Canal PWM 1
 * - Setor 3: Sensor GPIO 21 | Postes GPIO 5  | Canal PWM 2
 * - Setor 4: Sensor GPIO 22 | Postes GPIO 23 | Canal PWM 3
 * ============================================================================
 */

#include <Arduino.h>

// ============================================================================
// PARÂMETROS DO SISTEMA
// ============================================================================
const int TOTAL_SETORES          = 4;

const int BRILHO_LUA             = 35;   // ~14% - Modo Noturno Econômico
const int BRILHO_MAXIMO          = 255;  // 100% - Potência máxima com veículo

const int PASSO_ACENDER          = 8;    // Rampa de subida rápida (+8 a cada 15ms)
const int PASSO_APAGAR           = 3;    // Rampa de descida suave (-3 a cada 15ms)

const unsigned long TEMPO_SEGURANCA_MS = 2500; // Mantém 100% por 2,5s após o carro sair
const unsigned long TEMPO_FADE_MS      = 15;   // Intervalo de ajuste suave do brilho
const unsigned long TEMPO_FILTRO_MS    = 30;   // Filtro de ruído do sensor (debounce)
const unsigned long INTERVALO_SERIAL_MS= 500;  // Telemetria serial 2x por segundo

// ============================================================================
// ESTRUTURA DE CONTROLE DE CADA SETOR (1 SENSOR + 2 POSTES EM PARALELO)
// ============================================================================
struct Setor {
    int pinoSensor;
    int pinoLed;
    int canalPwm;

    int brilhoAtual;
    int brilhoDesejado;

    unsigned long momentoSaida;
    unsigned long momentoFade;
    unsigned long momentoFiltro;

    int ultimaLeituraBruta;
    int leituraEstavel;
    bool carroDetectado;
};

// Inicialização dos 4 Setores (8 postes no total)
Setor setores[TOTAL_SETORES] = {
    {18,  2, 0, BRILHO_LUA, BRILHO_LUA, 0, 0, 0, HIGH, HIGH, false}, // Setor 1
    {19,  4, 1, BRILHO_LUA, BRILHO_LUA, 0, 0, 0, HIGH, HIGH, false}, // Setor 2
    {21,  5, 2, BRILHO_LUA, BRILHO_LUA, 0, 0, 0, HIGH, HIGH, false}, // Setor 3
    {22, 23, 3, BRILHO_LUA, BRILHO_LUA, 0, 0, 0, HIGH, HIGH, false}  // Setor 4
};

// ============================================================================
// FUNÇÃO AUXILIAR: Envia valor PWM aos LEDs do Setor
// ============================================================================
void enviarPwm(int pinoLed, int canalPwm, int brilho) {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    ledcWrite(pinoLed, brilho);
#else
    ledcWrite(canalPwm, brilho);
#endif
}

// ============================================================================
// FUNÇÃO: Atualiza a lógica de 1 setor (não-bloqueante via millis)
// ============================================================================
void atualizarSetor(Setor &s, unsigned long agora) {
    // 1. Leitura do Sensor com Filtro de Ruído Digital (30ms)
    int leitura = digitalRead(s.pinoSensor);
    if (leitura != s.ultimaLeituraBruta) {
        s.ultimaLeituraBruta = leitura;
        s.momentoFiltro = agora;
    }
    if ((agora - s.momentoFiltro) >= TEMPO_FILTRO_MS) {
        s.leituraEstavel = s.ultimaLeituraBruta;
    }

    // Com INPUT_PULLUP: LOW = carro refletindo o feixe infravermelho
    s.carroDetectado = (s.leituraEstavel == LOW);

    // 2. Temporizador de Segurança (2,5 segundos)
    if (s.carroDetectado) {
        s.brilhoDesejado = BRILHO_MAXIMO;
        s.momentoSaida = agora;
    } else {
        if ((agora - s.momentoSaida) < TEMPO_SEGURANCA_MS) {
            s.brilhoDesejado = BRILHO_MAXIMO; // Continua aceso
        } else {
            s.brilhoDesejado = BRILHO_LUA;    // Retorna ao modo econômico
        }
    }

    // 3. Efeito Fade (Dimerização Suave a cada 15ms)
    if ((agora - s.momentoFade) >= TEMPO_FADE_MS) {
        s.momentoFade = agora;
        if (s.brilhoAtual < s.brilhoDesejado) {
            s.brilhoAtual = min(s.brilhoDesejado, s.brilhoAtual + PASSO_ACENDER);
            enviarPwm(s.pinoLed, s.canalPwm, s.brilhoAtual);
        } else if (s.brilhoAtual > s.brilhoDesejado) {
            s.brilhoAtual = max(s.brilhoDesejado, s.brilhoAtual - PASSO_APAGAR);
            enviarPwm(s.pinoLed, s.canalPwm, s.brilhoAtual);
        }
    }
}

// ============================================================================
// SETUP: Configura pinos e periféricos PWM
// ============================================================================
void setup() {
    Serial.begin(115200);
    delay(500);

    Serial.println();
    Serial.println(F("======================================================"));
    Serial.println(F("   POSTES INTELIGENTES (SMART STREET LIGHTING)        "));
    Serial.println(F("   4 Setores | 4 Sensores | 8 Postes de Iluminação    "));
    Serial.println(F("======================================================"));
    Serial.println(F(" Modo Noturno (Lua) : 14%"));
    Serial.println(F(" Brilho com Carro   : 100%"));
    Serial.println(F(" Tempo de Seguranca : 2,5 segundos"));
    Serial.println(F(" Frequencia PWM     : 5.000 Hz"));
    Serial.println(F("------------------------------------------------------"));

    for (int i = 0; i < TOTAL_SETORES; i++) {
        // Sensor TCRT5000 com resistor pull-up interno ativado
        pinMode(setores[i].pinoSensor, INPUT_PULLUP);

        // Configuração do canal PWM para os LEDs dos postes do setor
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
        ledcAttach(setores[i].pinoLed, 5000, 8);
#else
        ledcSetup(setores[i].canalPwm, 5000, 8);
        ledcAttachPin(setores[i].pinoLed, setores[i].canalPwm);
#endif
        // Inicia em modo econômico (14%)
        enviarPwm(setores[i].pinoLed, setores[i].canalPwm, BRILHO_LUA);

        Serial.printf(" [Setor %d] Sensor: GPIO %2d  |  LEDs Postes: GPIO %2d  |  PWM: %d\n",
                      i + 1, setores[i].pinoSensor, setores[i].pinoLed, setores[i].canalPwm);
    }

    Serial.println(F("======================================================"));
    Serial.println(F(" SISTEMA LIGADO! PISTA MONITORADA EM TEMPO REAL...\n"));
}

// ============================================================================
// LOOP: Monitora os 4 setores continuamente sem travar o ESP32
// ============================================================================
unsigned long ultimoRelatorio = 0;

void loop() {
    const unsigned long agora = millis();

    // 1. Atualiza cada um dos 4 setores
    for (int i = 0; i < TOTAL_SETORES; i++) {
        atualizarSetor(setores[i], agora);
    }

    // 2. Relatório de Telemetria no Monitor Serial a cada 500ms
    if ((agora - ultimoRelatorio) >= INTERVALO_SERIAL_MS) {
        ultimoRelatorio = agora;

        Serial.printf("[%6lu s] ", agora / 1000);
        for (int i = 0; i < TOTAL_SETORES; i++) {
            int pct = (setores[i].brilhoAtual * 100) / 255;
            Serial.printf("S%d:[%s|%3d%%]  ",
                          i + 1,
                          setores[i].carroDetectado ? "CARRO" : "LIVRE",
                          pct);
        }
        Serial.println();
    }
}

