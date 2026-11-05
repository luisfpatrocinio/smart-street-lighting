/**
 * ============================================================================
 * PROJETO: Postes Inteligentes (Smart Street Lighting)
 * Plataforma: ESP32 NodeMCU
 * Feira de Robótica / Smart City
 * ============================================================================
 * 
 * O sistema controla 4 postes ao longo da via. Cada setor possui:
 * - 1 Sensor Infravermelho (TCRT5000) na calçada lateral (com INPUT_PULLUP)
 * - 1 Poste de iluminação com LED controlado por PWM (5 kHz)
 * 
 * Lógica de Operação:
 * - Em repouso: brilho noturno econômico em 14% (~35/255).
 * - Ao detectar veículo: sobe rapidamente para 100% (255/255).
 * - Após o veículo passar: sustenta 100% por 2,5 segundos e dimeriza suavemente.
 * 
 * Mapeamento dos Pinos no ESP32:
 * - Poste 1: Sensor GPIO 18 | LED GPIO 2  | Canal PWM 0
 * - Poste 2: Sensor GPIO 19 | LED GPIO 4  | Canal PWM 1
 * - Poste 3: Sensor GPIO 21 | LED GPIO 5  | Canal PWM 2
 * - Poste 4: Sensor GPIO 22 | LED GPIO 23 | Canal PWM 3
 * ============================================================================
 */

#include <Arduino.h>

// ============================================================================
// PARÂMETROS DO SISTEMA
// ============================================================================
const int TOTAL_POSTES           = 4;

const int BRILHO_LUA             = 35;   // ~14% - Modo Noturno Econômico
const int BRILHO_MAXIMO          = 255;  // 100% - Potência máxima com veículo

const int PASSO_ACENDER          = 8;    // Rampa de subida rápida (+8 a cada 15ms)
const int PASSO_APAGAR           = 3;    // Rampa de descida suave (-3 a cada 15ms)

const unsigned long TEMPO_SEGURANCA_MS = 2500; // Mantém 100% por 2,5s após o carro sair
const unsigned long TEMPO_FADE_MS      = 15;   // Intervalo de ajuste suave do brilho
const unsigned long TEMPO_FILTRO_MS    = 30;   // Filtro de ruído do sensor (debounce)
const unsigned long INTERVALO_SERIAL_MS= 500;  // Telemetria serial 2x por segundo

// ============================================================================
// ESTRUTURA DE CONTROLE DE CADA POSTE
// ============================================================================
struct Poste {
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

// Inicialização dos 4 Postes
Poste postes[TOTAL_POSTES] = {
    {18,  2, 0, BRILHO_LUA, BRILHO_LUA, 0, 0, 0, HIGH, HIGH, false}, // Poste 1
    {19,  4, 1, BRILHO_LUA, BRILHO_LUA, 0, 0, 0, HIGH, HIGH, false}, // Poste 2
    {21,  5, 2, BRILHO_LUA, BRILHO_LUA, 0, 0, 0, HIGH, HIGH, false}, // Poste 3
    {22, 23, 3, BRILHO_LUA, BRILHO_LUA, 0, 0, 0, HIGH, HIGH, false}  // Poste 4
};

// ============================================================================
// FUNÇÃO AUXILIAR: Envia valor PWM ao LED do Poste
// ============================================================================
void enviarPwm(int pinoLed, int canalPwm, int brilho) {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    ledcWrite(pinoLed, brilho);
#else
    ledcWrite(canalPwm, brilho);
#endif
}

// ============================================================================
// FUNÇÃO: Atualiza a lógica de 1 poste (não-bloqueante via millis)
// ============================================================================
void atualizarPoste(Poste &p, unsigned long agora) {
    // 1. Leitura do Sensor com Filtro de Ruído Digital (30ms)
    int leitura = digitalRead(p.pinoSensor);
    if (leitura != p.ultimaLeituraBruta) {
        p.ultimaLeituraBruta = leitura;
        p.momentoFiltro = agora;
    }
    if ((agora - p.momentoFiltro) >= TEMPO_FILTRO_MS) {
        p.leituraEstavel = p.ultimaLeituraBruta;
    }

    // Com INPUT_PULLUP: LOW = carro refletindo o feixe infravermelho
    p.carroDetectado = (p.leituraEstavel == LOW);

    // 2. Temporizador de Segurança (2,5 segundos)
    if (p.carroDetectado) {
        p.brilhoDesejado = BRILHO_MAXIMO;
        p.momentoSaida = agora;
    } else {
        if ((agora - p.momentoSaida) < TEMPO_SEGURANCA_MS) {
            p.brilhoDesejado = BRILHO_MAXIMO; // Continua aceso
        } else {
            p.brilhoDesejado = BRILHO_LUA;    // Retorna ao modo econômico
        }
    }

    // 3. Efeito Fade (Dimerização Suave a cada 15ms)
    if ((agora - p.momentoFade) >= TEMPO_FADE_MS) {
        p.momentoFade = agora;
        if (p.brilhoAtual < p.brilhoDesejado) {
            p.brilhoAtual = min(p.brilhoDesejado, p.brilhoAtual + PASSO_ACENDER);
            enviarPwm(p.pinoLed, p.canalPwm, p.brilhoAtual);
        } else if (p.brilhoAtual > p.brilhoDesejado) {
            p.brilhoAtual = max(p.brilhoDesejado, p.brilhoAtual - PASSO_APAGAR);
            enviarPwm(p.pinoLed, p.canalPwm, p.brilhoAtual);
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
    Serial.println(F("   POSTES INTELIGENTES (SMART STREET LIGHTING - 4P)   "));
    Serial.println(F("======================================================"));
    Serial.println(F(" Modo Noturno (Lua) : 14%"));
    Serial.println(F(" Brilho com Carro   : 100%"));
    Serial.println(F(" Tempo de Seguranca : 2,5 segundos"));
    Serial.println(F(" Frequencia PWM     : 5.000 Hz"));
    Serial.println(F("------------------------------------------------------"));

    for (int i = 0; i < TOTAL_POSTES; i++) {
        // Sensor TCRT5000 com resistor pull-up interno ativado
        pinMode(postes[i].pinoSensor, INPUT_PULLUP);

        // Configuração do canal PWM para o LED do poste
#if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
        ledcAttach(postes[i].pinoLed, 5000, 8);
#else
        ledcSetup(postes[i].canalPwm, 5000, 8);
        ledcAttachPin(postes[i].pinoLed, postes[i].canalPwm);
#endif
        // Inicia em modo econômico (14%)
        enviarPwm(postes[i].pinoLed, postes[i].canalPwm, BRILHO_LUA);

        Serial.printf(" [Poste %d] Sensor: GPIO %2d  |  LED: GPIO %2d  |  PWM: %d\n",
                      i + 1, postes[i].pinoSensor, postes[i].pinoLed, postes[i].canalPwm);
    }

    Serial.println(F("======================================================"));
    Serial.println(F(" SISTEMA LIGADO! PISTA MONITORADA EM TEMPO REAL...\n"));
}

// ============================================================================
// LOOP: Monitora os 4 postes continuamente sem travar o ESP32
// ============================================================================
unsigned long ultimoRelatorio = 0;

void loop() {
    const unsigned long agora = millis();

    // 1. Atualiza cada um dos 4 postes
    for (int i = 0; i < TOTAL_POSTES; i++) {
        atualizarPoste(postes[i], agora);
    }

    // 2. Relatório de Telemetria no Monitor Serial a cada 500ms
    if ((agora - ultimoRelatorio) >= INTERVALO_SERIAL_MS) {
        ultimoRelatorio = agora;

        Serial.printf("[%6lu s] ", agora / 1000);
        for (int i = 0; i < TOTAL_POSTES; i++) {
            int pct = (postes[i].brilhoAtual * 100) / 255;
            Serial.printf("P%d:[%s|%3d%%]  ",
                          i + 1,
                          postes[i].carroDetectado ? "CARRO" : "LIVRE",
                          pct);
        }
        Serial.println();
    }
}
