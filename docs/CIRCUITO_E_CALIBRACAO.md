# ⚡ Esquema Elétrico e Calibração dos Sensores (ESP32)

Este documento traz os detalhes elétricos, diagrama esquemático, cálculo de resistores e o procedimento de calibração do sensor TCRT5000.

---

## 📌 1. Tabela de Pinos do ESP32 (4 Setores)

| Setor | Pino ESP32 | Função | Componente Conectado | Configuração de Software |
| :---: | :---: | :---: | :---: | :---: |
| **Setor 0** | **GPIO 18** | Entrada Digital | Sensor TCRT5000 #0 (Pino `DO`) | `INPUT_PULLUP` (Lógica LOW = Carro) |
| | **GPIO 25** | Saída PWM | LEDs Postes 0A e 0B (Ânodo `+`) | Canal LEDC 0 (5.000 Hz, 8 bits) |
| **Setor 1** | **GPIO 19** | Entrada Digital | Sensor TCRT5000 #1 (Pino `DO`) | `INPUT_PULLUP` (Lógica LOW = Carro) |
| | **GPIO 26** | Saída PWM | LEDs Postes 1A e 1B (Ânodo `+`) | Canal LEDC 1 (5.000 Hz, 8 bits) |
| **Setor 2** | **GPIO 21** | Entrada Digital | Sensor TCRT5000 #2 (Pino `DO`) | `INPUT_PULLUP` (Lógica LOW = Carro) |
| | **GPIO 27** | Saída PWM | LEDs Postes 2A e 2B (Ânodo `+`) | Canal LEDC 2 (5.000 Hz, 8 bits) |
| **Setor 3** | **GPIO 22** | Entrada Digital | Sensor TCRT5000 #3 (Pino `DO`) | `INPUT_PULLUP` (Lógica LOW = Carro) |
| | **GPIO 14** | Saída PWM | LEDs Postes 3A e 3B (Ânodo `+`) | Canal LEDC 3 (5.000 Hz, 8 bits) |
| **Alimentação** | **3V3** | 3.3V DC | Pinos `VCC` de todos os 4 Sensores | Linha de alimentação segura 3.3V |
| **Terra** | **GND** | 0V (Comum) | Pinos `GND` dos Sensores e Cátodos dos LEDs | Barramento de Terra Unificado |

> [!IMPORTANT]
> **Atenção:** Os sensores TCRT5000 devem ser alimentados pelo pino **3V3** do ESP32 (e **NÃO** pelo pino 5V/VIN). Isso garante que o sinal digital que sai do sensor (`DO`) nunca ultrapasse 3.3V, protegendo os pinos de entrada do ESP32 contra sobretensão!

---

## 🔌 2. Esquema Elétrico de Conexão

```text
                  +-------------------------------+
                  |      ESP32 NodeMCU WROOM      |
                  +---------------+---------------+
                                  |
   [Pino 3V3] --------------------+----------> VCC dos 4 Sensores TCRT5000
   [Pino GND] --------------------+----------> GND dos 4 Sensores & Cátodos dos LEDs
                                  |
   [GPIO 18]  <-------------------+----------- Sinal DO do Sensor 0
   [GPIO 25]  --------------------+
                                  |
                                  +----------+
                                  |          |
                              [Resistor] [Resistor] (220Ω cada)
                                  |          |
                                ( + )      ( + )   Ânodo dos LEDs
                               [Poste A]  [Poste B]
                                ( - )      ( - )   Cátodo dos LEDs
                                  |          |
                                  +----+-----+
                                       |
                                       v
                                  [Pino GND]
```

### Por que cada LED precisa do seu próprio resistor?
Quando colocamos dois LEDs em paralelo no mesmo pino do ESP32, cada um deve ter o seu **resistor individual de 220Ω ou 330Ω**. Se usássemos apenas um resistor para os dois LEDs juntos, o LED com menor tensão de condução "roubaria" mais corrente, fazendo com que um ficasse mais brilhante que o outro. Com resistores separados, os dois postes iluminam com exatamente o mesmo brilho!

---

## 🎛️ 3. Como Regular a Sensibilidade do Sensor (Trimpot)

O módulo TCRT5000 possui um comparador analógico LM393 e um potenciômetro multivoltas azul:

1. **LED de Energia (Power):** Fica aceso direto indicando que a placa está recebendo 3.3V.
2. **LED de Detecção (Signal):** Só deve acender quando um obstáculo estiver presente.
3. **Procedimento de Ajuste Fino:**
   - Coloque a maquete sob a luz ambiente real da feira (lâmpadas fluorescentes, LEDs de teto ou luz de janela).
   - Com a **pista vazia**, se o LED de sinal estiver aceso, pegue uma chavinha de fenda e gire o parafusinho azul no **sentido anti-horário** até que o LED apague.
   - Passe o carrinho de brinquedo sobre o sensor na altura real da pista (5 mm a 10 mm).
   - O LED de sinal precisa acender imediatamente. Se não acender, gire um pouquinho no **sentido horário** até atingir a sensibilidade perfeita.
   - Repita para os 4 módulos.
