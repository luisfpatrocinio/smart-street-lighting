# 🏙️ Iluminação Pública Inteligente (Smart Street Lighting — ESP32)

![PlatformIO](https://img.shields.io/badge/PlatformIO-ESP32-orange?style=for-the-badge&logo=platformio)
![C++17](https://img.shields.io/badge/Language-C%2B%2B17-blue?style=for-the-badge&logo=cplusplus)
![Educação](https://img.shields.io/badge/N%C3%ADvel-Ensino%20Fundamental%20(6%C2%BA--8%C2%BA%20Ano)-success?style=for-the-badge)

Projeto completo de **Cidade Inteligente (Smart City)** desenvolvido para feiras de ciências e robótica do Ensino Fundamental (6º ao 8º ano). O sistema utiliza um microcontrolador **ESP32 NodeMCU**, sensores ópticos reflexivos infravermelhos **TCRT5000** e controle de iluminação por **PWM (Modulação por Largura de Pulso)** de forma 100% não-bloqueante (`millis()`).

Além do firmware embarcado pronto para gravação na placa, este repositório inclui um **Simulador Interativo 3D e Manual de Montagem em HTML/WebGL** para apresentação em telão ou notebook durante a feira!

---

## 📚 Documentação Organizada

Para facilitar a montagem da maquete física, calibração elétrica e o treinamento dos estudantes para o dia da apresentação, a documentação foi dividida em guias especializados na pasta [`docs/`](./docs/):

- 🛠️ [**Manual de Montagem Física da Maquete (`docs/MONTAGEM_MAQUETE.md`)**](./docs/MONTAGEM_MAQUETE.md) — Lista de materiais (papelão, canudos, cola quente), medidas da pista (80 x 30 cm), furação para os sensores e organização dos fios no "porão técnico".
- ⚡ [**Esquema Elétrico & Calibração dos Sensores (`docs/CIRCUITO_E_CALIBRACAO.md`)**](./docs/CIRCUITO_E_CALIBRACAO.md) — Diagrama esquemático, cálculo dos resistores de 220Ω, código de cores dos fios e passo a passo para regular o trimpot azul do TCRT5000.
- 🎤 [**Roteiro de Apresentação para a Feira (`docs/ROTEIRO_APRESENTACAO.md`)**](./docs/ROTEIRO_APRESENTACAO.md) — Divisão da equipe em 3 apresentadores, falas ensaiadas de 1 minuto cada e respostas na ponta da língua para as perguntas dos juízes.
- 🔌 [**Guia Rápido de Ligação (`WIRING.md`)**](./WIRING.md) — Sumário de pinos e referências rápidas de bancada.

---

## ✨ Funcionalidades do Projeto

1. **Modo Noturno Ecológico (Brilho da Lua — 14%):** Quando a pista está livre, os postes permanecem acesos a 14% (`PWM = 35/255`), economizando até **80% de energia elétrica**.
2. **Detecção Instantânea por Infravermelho:** Ao detectar a passagem de um carrinho no sensor **TCRT5000**, o setor correspondente eleva sua iluminação para **100% (`PWM = 255/255`)**.
3. **Temporizador de Segurança (Regra dos 2,5 Segundos):** Após o veículo sair do sensor, os postes continuam em potência máxima por **2.500 ms** antes de começarem a diminuir o brilho.
4. **Transição Suave (Fade In / Fade Out):** Ajuste progressivo a cada `15 ms`, evitando transições bruscas que ofuscam a visão dos motoristas.
5. **Filtro Digital de Ruído (Software Debounce):** Janela de estabilidade de `30 ms` para eliminar falsos alarmes causados pela luz do teto da feira.
6. **Arquitetura sem Travamentos (`millis()`):** Zero uso de `delay()`, permitindo que todos os 4 setores operem de forma simultânea e independente.

---

## 🖥️ Central Web Interativa (`index.html`)

O arquivo [`index.html`](./index.html) é uma aplicação web completa e autônoma, dividida em **4 seções interativas**:

1. **🏙️ 1. Maquete 3D Interativa (Three.js):** Pista 3D realista com asfalto, 8 postes, 4 sensores de pista e carrinho trafegando em tempo real.
2. **⚡ 2. Eletricidade & PWM:** Animação dos elétrons pelo fio (ESP32 -> Resistor -> LED) com osciloscópio digital de 5.000 Hz ajustável.
3. **💻 3. Código Explicado:** Navegador didático das 5 principais funções em C++ com explicações prontas para os alunos memorizarem.
4. **🛠️ 4. Guia de Montagem da Maquete:** Planta baixa interativa com medidas em centímetros, passo a passo em sanfona e checklist de testes antes da feira.

> **Como visualizar:** Abra o arquivo `index.html` em qualquer navegador (Google Chrome, Edge, Firefox) dando dois cliques sobre ele.

---

## 🔌 Tabela Rápida de Pinos (ESP32)

| Setor | Sensor Infravermelho (TCRT5000 `DO`) | LEDs do Poste (`Anodo +`) | Canal PWM |
| :---: | :---: | :---: | :---: |
| **Setor 0** | `GPIO 18` | `GPIO 25` | Canal `0` |
| **Setor 1** | `GPIO 19` | `GPIO 26` | Canal `1` |
| **Setor 2** | `GPIO 21` | `GPIO 27` | Canal `2` |
| **Setor 3** | `GPIO 22` | `GPIO 14` | Canal `3` |
| **Alimentação** | `3V3` (3.3 Volts) | Resistor `220Ω` por LED | — |
| **Terra** | `GND` | `GND` | — |

---

## 📂 Estrutura de Pastas do Repositório

```text
smart-street-lighting/
├── include/
│   ├── Config.hpp                # Pinos, tempos e constantes de brilho comentados em português
│   └── SectorController.hpp       # Declaração simplificada da classe ControladorSetor
├── src/
│   ├── SectorController.cpp       # Implementação do debounce, regra dos 2,5s e fade suave
│   └── main.cpp                  # Loop principal não-bloqueante e telemetria serial
├── docs/
│   ├── MONTAGEM_MAQUETE.md        # Manual físico de montagem: materiais, medidas e furação
│   ├── CIRCUITO_E_CALIBRACAO.md   # Esquema elétrico, resistores e calibração do trimpot
│   └── ROTEIRO_APRESENTACAO.md    # Roteiro de fala para os alunos e perguntas frequentes
├── index.html                     # Central Web: 3D + Circuito + Código + Montagem
├── WIRING.md                     # Guia rápido de ligação
└── platformio.ini                 # Configuração do compilador para ESP32 NodeMCU
```

---

## 🚀 Como Compilar e Enviar para o ESP32

```bash
# 1. Compilar o código
pio run

# 2. Conectar o ESP32 no USB e gravar o firmware
pio run --target upload

# 3. Abrir o monitor serial (115200 baud)
pio device monitor
```
