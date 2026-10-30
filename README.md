# 🏙️ Iluminação Pública Inteligente (Smart Street Lighting — ESP32)

[![GitHub Pages](https://img.shields.io/badge/Demo%20Online-GitHub%20Pages-00f2fe?style=for-the-badge&logo=github)](https://luisfpatrocinio.github.io/smart-street-lighting/)
[![PlatformIO](https://img.shields.io/badge/PlatformIO-ESP32-orange?style=for-the-badge&logo=platformio)](https://platformio.org/)
[![C++17](https://img.shields.io/badge/Language-C%2B%2B17-blue?style=for-the-badge&logo=cplusplus)](https://isocpp.org/)
[![Educação](https://img.shields.io/badge/N%C3%ADvel-Ensino%20Fundamental%20(6%C2%BA--8%C2%BA%20Ano)-success?style=for-the-badge)](./docs/ROTEIRO_APRESENTACAO.md)

Projeto completo de **Cidade Inteligente (Smart City)** desenvolvido para feiras de ciências e robótica do Ensino Fundamental (6º ao 8º ano). O sistema utiliza um microcontrolador **ESP32 NodeMCU**, sensores ópticos reflexivos infravermelhos **TCRT5000** e controle de iluminação por **PWM (Modulação por Largura de Pulso)** de forma 100% não-bloqueante (`millis()`).

---

## 🌐 Demonstração Online no GitHub Pages

Acesse a aplicação web completa e interativa hospedada diretamente no GitHub Pages:  
👉 **[https://luisfpatrocinio.github.io/smart-street-lighting/](https://luisfpatrocinio.github.io/smart-street-lighting/)**

### Módulos da Aplicação Web:
1. **🏙️ 1. Maquete 3D Interativa (Three.js):** Pista 3D realista com asfalto, 8 postes, 4 sensores de pista e carrinho trafegando em tempo real com controle de dia/noite e câmera 360°.
2. **⚡ 2. Eletricidade & PWM:** Animação gráfica do fluxo de elétrons pelo circuito (ESP32 -> Resistor -> LED) com osciloscópio digital de 5.000 Hz ajustável.
3. **💻 3. Código Explicado:** Navegador didático das funções de C++ com explicações prontas para os alunos memorizarem e apresentarem aos juízes.
4. **🛠️ 4. Guia de Montagem da Maquete:** Planta baixa interativa em Canvas com medidas reais em centímetros, passo a passo sanfonado e checklist de testes.

---

## 📚 Documentação e Manuais

A pasta [`docs/`](./docs/) reúne materiais preparados para a equipe escolar e professores:

- 🛠️ [**Manual de Montagem Física da Maquete (`docs/MONTAGEM_MAQUETE.md`)**](./docs/MONTAGEM_MAQUETE.md) — Lista de materiais recicláveis e acessíveis (papelão, canudos pretos, cola quente), medidas da pista (80 x 30 cm), furação para os sensores e organização dos fios no "porão técnico".
- ⚡ [**Esquema Elétrico & Calibração dos Sensores (`docs/CIRCUITO_E_CALIBRACAO.md`)**](./docs/CIRCUITO_E_CALIBRACAO.md) — Diagrama esquemático, cálculo dos resistores de 220Ω, código de cores dos fios e passo a passo para regular o trimpot azul do TCRT5000.
- 🎤 [**Roteiro de Apresentação para a Feira (`docs/ROTEIRO_APRESENTACAO.md`)**](./docs/ROTEIRO_APRESENTACAO.md) — Divisão da equipe em 3 apresentadores, falas ensaiadas de 1 minuto cada e respostas na ponta da língua para as perguntas dos jurados.
- 🔌 [**Guia Rápido de Ligação (`WIRING.md`)**](./WIRING.md) — Sumário de pinos e referências rápidas de bancada.

---

## ✨ Funcionalidades do Sistema Embarcado

1. **Modo Noturno Ecológico (Brilho da Lua — 14%):** Quando a pista está livre, os postes permanecem acesos a 14% (`PWM = 35/255`), economizando até **80% de energia elétrica**.
2. **Detecção Instantânea por Infravermelho:** Ao detectar a passagem de um carrinho no sensor **TCRT5000**, o setor correspondente eleva sua iluminação para **100% (`PWM = 255/255`)**.
3. **Temporizador de Segurança (Regra dos 2,5 Segundos):** Após o veículo sair do sensor, os postes continuam em potência máxima por **2.500 ms** antes de começarem a diminuir o brilho.
4. **Transição Suave (Fade In / Fade Out):** Ajuste progressivo a cada `15 ms`, evitando transições bruscas que ofuscam a visão dos motoristas.
5. **Filtro Digital de Ruído (Software Debounce):** Janela de estabilidade de `30 ms` para eliminar falsos alarmes causados pela luz do teto da feira.
6. **Arquitetura sem Travamentos (`millis()`):** Zero uso de `delay()`, permitindo que todos os 4 setores operem de forma simultânea e independente.

---

## 🔌 Tabela de Pinos do ESP32 NodeMCU

| Setor | Sensor TCRT5000 (`DO`) | LEDs dos Postes (`Anodo +`) | Canal PWM | Modo |
| :---: | :---: | :---: | :---: | :---: |
| **Setor 0** | `GPIO 18` | `GPIO 25` | Canal `0` | Entrada com Pull-up / Saída LEDC |
| **Setor 1** | `GPIO 19` | `GPIO 26` | Canal `1` | Entrada com Pull-up / Saída LEDC |
| **Setor 2** | `GPIO 21` | `GPIO 27` | Canal `2` | Entrada com Pull-up / Saída LEDC |
| **Setor 3** | `GPIO 22` | `GPIO 14` | Canal `3` | Entrada com Pull-up / Saída LEDC |
| **Alimentação** | `3V3` (3.3V DC) | Resistor `220Ω` por LED | — | Tensão segura para entradas |
| **Terra** | `GND` | `GND` | — | Barramento de terra unificado |

---

## 📂 Estrutura Modular do Projeto

```text
smart-street-lighting/
├── include/
│   ├── Config.hpp                # Constantes, tempos, frequências e structs documentados (Doxygen)
│   └── SectorController.hpp       # Declaração da classe controladora de cada setor
├── src/
│   ├── SectorController.cpp       # Implementação do debounce, temporizadores e rampa óptica
│   └── main.cpp                  # Inicialização do hardware e telemetria periódica
├── docs/                         # Documentação detalhada para a feira
│   ├── MONTAGEM_MAQUETE.md        # Passo a passo físico com medidas (80x30 cm)
│   ├── CIRCUITO_E_CALIBRACAO.md   # Esquema elétrico, resistores e ajuste do trimpot
│   └── ROTEIRO_APRESENTACAO.md    # Roteiro de fala dos estudantes e perguntas frequentes
├── css/                          # Folhas de estilo modulares da aplicação web
│   ├── main.css                  # Variáveis, layout base, reset e navbar
│   ├── simulation3d.css          # Estilos do Three.js e cards de telemetria
│   ├── circuits.css              # Estilos do fluxo de elétrons e osciloscópio
│   ├── code-viewer.css           # Sintaxe colorida e explicador de código
│   └── blueprint.css             # Planta baixa, accordion e checklist
├── js/                           # Scripts modulares em JavaScript puro
│   ├── app.js                    # Orquestrador de abas e eventos globais
│   ├── sim3d.js                  # Motor 3D Three.js e lógica da maquete
│   ├── circuits.js               # Animações de circuito e osciloscópio PWM
│   ├── codeViewer.js             # Dicionário de tópicos de código didático
│   └── blueprint.js              # Desenho da planta em Canvas e checklist
├── index.html                     # Ponto de entrada limpo para o GitHub Pages
├── WIRING.md                     # Guia rápido de pinos e cores de fios
└── platformio.ini                 # Configuração do ambiente PlatformIO (ESP32)
```

---

## 🚀 Como Compilar e Enviar para o ESP32

```bash
# 1. Compilar o projeto
pio run

# 2. Gravar o firmware no ESP32 via USB
pio run --target upload

# 3. Abrir o Monitor Serial (115200 baud)
pio device monitor
```

---

## 📜 Licença

Este projeto é de código aberto e livre para uso educacional em escolas, oficinas de robótica e feiras de ciências.
