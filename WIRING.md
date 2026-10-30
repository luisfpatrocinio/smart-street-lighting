# 🔌 Guia Rápido de Ligação Elétrica & Hardware

Este arquivo serve como sumário e referência rápida para as conexões físicas do projeto. Para manuais completos e ilustrados, consulte a pasta [`docs/`](./docs/):

- 🛠️ [**Manual de Montagem da Maquete (Passo a Passo)**](./docs/MONTAGEM_MAQUETE.md)
- ⚡ [**Esquema Elétrico Detalhado e Calibração dos Sensores**](./docs/CIRCUITO_E_CALIBRACAO.md)
- 🎤 [**Roteiro de Apresentação para os Alunos na Feira**](./docs/ROTEIRO_APRESENTACAO.md)

---

## 📌 Tabela Rápida de Pinos (ESP32 NodeMCU)

| Setor | Sensor TCRT5000 (`DO`) | LEDs dos Postes (`+`) | Canal PWM |
| :---: | :---: | :---: | :---: |
| **Setor 0** | **GPIO 18** | **GPIO 25** | Canal 0 |
| **Setor 1** | **GPIO 19** | **GPIO 26** | Canal 1 |
| **Setor 2** | **GPIO 21** | **GPIO 27** | Canal 2 |
| **Setor 3** | **GPIO 22** | **GPIO 14** | Canal 3 |
| **Alimentação** | Pino **3V3** (3.3V DC) | Resistor 220Ω / 330Ω por LED | — |
| **Terra** | Pino **GND** | Pino **GND** | — |

---

## 🎨 Código de Cores Sugerido para os Fios

- **Vermelho:** Alimentação 3.3V (`3V3` do ESP32 para o `VCC` dos 4 sensores).
- **Preto ou Marrom:** Terra comum (`GND` do ESP32 para todos os sensores e LEDs).
- **Laranja / Amarelo:** Fios dos sensores infravermelhos (`DO`).
- **Verde / Azul / Roxo:** Fios de sinal PWM para os postes de cada setor.
