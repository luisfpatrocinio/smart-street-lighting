# 🏙️ Iluminação Pública Inteligente (Smart Street Lighting — ESP32)

![PlatformIO](https://img.shields.io/badge/PlatformIO-ESP32-orange?style=for-the-badge&logo=platformio)
![C++17](https://img.shields.io/badge/Language-C%2B%2B17-blue?style=for-the-badge&logo=cplusplus)
![Educação](https://img.shields.io/badge/N%C3%ADvel-Ensino%20Fundamental%20(6%C2%BA--8%C2%BA%20Ano)-success?style=for-the-badge)

Projeto completo de **Cidade Inteligente (Smart City)** desenvolvido para feiras de ciências e robótica do Ensino Fundamental (6º ao 8º ano). O sistema utiliza um microcontrolador **ESP32 NodeMCU**, sensores ópticos reflexivos infravermelhos **TCRT5000** e controle de iluminação por **PWM (Modulação por Largura de Pulso)** de forma 100% não-bloqueante (`millis()`).

Além do firmware embarcado pronto para gravação na placa, este repositório inclui um **Simulador Interativo 3D em HTML/WebGL** para apresentação em telão ou notebook durante a feira!

---

## ✨ Funcionalidades Principais

1. **Modo Noturno Ecológico (Brilho da Lua — 14%):** Quando não há veículos na pista, os postes permanecem acesos com 14% de potência (`PWM = 35/255`), garantindo visibilidade básica e economizando até **80% de energia elétrica**.
2. **Detecção Instantânea por Infravermelho:** Ao detectar a passagem de um carrinho no sensor **TCRT5000**, o setor correspondente eleva sua iluminação para **100% (`PWM = 255/255`)**.
3. **Temporizador de Segurança (Regra dos 2,5 Segundos):** Após o veículo sair do sensor, os postes daquele setor continuam acesos em potência máxima por **2.500 ms** antes de começarem a diminuir o brilho.
4. **Transição Suave (Efeito Fade In / Fade Out):** O aumento e a redução de brilho ocorrem de forma gradual a cada `15 ms`, evitando mudanças bruscas de luminosidade na via.
5. **Filtro Digital de Ruído (Software Debounce):** Leituras falsas causadas por reflexos ou lâmpadas do ambiente são filtradas por uma janela de estabilidade de `30 ms`.
6. **Arquitetura Sem Travamentos (`millis()`):** Zero uso de `delay()` no `loop()`, permitindo que todos os 4 setores funcionem simultaneamente de forma independente.

---

## 🖥️ Demonstração Interativa em 3D (`index.html`)

O arquivo [`index.html`](./index.html) oferece uma central interativa dividida em **3 abas educativas**:

1. **🏙️ 1. Maquete 3D Interativa (Three.js):** Simulação em tempo real da pista com 4 setores, 8 postes de iluminação, 4 sensores infravermelhos e um carrinho que percorre a via acionando os postes.
2. **⚡ 2. Eletricidade & PWM:** Animação do fluxo de elétrons passando pelo pino GPIO, resistor de 220Ω e LED, acompanhada de um osciloscópio digital de 5.000 Hz interativo.
3. **💻 3. Código Explicado:** Visualizador interativo das principais funções do código em C++ com explicações didáticas para os alunos apresentarem aos avaliadores.

> **Como abrir:** Basta abrir o arquivo `index.html` diretamente em qualquer navegador moderno (Chrome, Edge, Firefox).

---

## 🔌 Mapeamento de Pinos (Pinout ESP32)

| Setor | Sensor Infravermelho (TCRT5000 `DO`) | LEDs do Poste (`Anodo +`) | Canal PWM |
| :---: | :---: | :---: | :---: |
| **Setor 0** | `GPIO 18` | `GPIO 25` | Canal `0` |
| **Setor 1** | `GPIO 19` | `GPIO 26` | Canal `1` |
| **Setor 2** | `GPIO 21` | `GPIO 27` | Canal `2` |
| **Setor 3** | `GPIO 22` | `GPIO 14` | Canal `3` |
| **Alimentação** | `3V3` (3.3 Volts) | Resistor `220Ω` / `330Ω` em série | — |
| **Terra Comum** | `GND` | `GND` | — |

Para instruções detalhadas de montagem na protoboard, cores de fios, ajuste do trimpot do sensor e roteiro de fala para os alunos na feira, consulte o guia [**WIRING.md**](./WIRING.md).

---

## 📂 Estrutura do Projeto

```text
smart-street-lighting/
├── include/
│   ├── Config.hpp            # Pinos, constantes de brilho PWM e tempos (comentado em PT-BR)
│   └── SectorController.hpp   # Declaração da classe ControladorSetor
├── src/
│   ├── SectorController.cpp   # Lógica do filtro de ruído, regra dos 2,5s e efeito fade suave
│   └── main.cpp              # Loop principal e painel de telemetria no Monitor Serial
├── index.html                 # Apresentação interativa 3D + Circuito + Explorador de Código
├── WIRING.md                 # Manual de montagem, calibração e roteiro de apresentação
└── platformio.ini             # Configuração de build para ESP32 NodeMCU (esp32dev)
```

---

## 🚀 Como Compilar e Gravar no ESP32

### Pré-requisitos
- [VS Code](https://code.visualstudio.com/) + extensão [PlatformIO IDE](https://platformio.org/) instalada.

### Passos
1. Clone este repositório:
   ```bash
   git clone https://github.com/luisfpatrocinio/smart-street-lighting.git
   cd smart-street-lighting
   ```
2. Compile o projeto:
   ```bash
   pio run
   ```
3. Conecte o ESP32 via cabo USB e envie o firmware:
   ```bash
   pio run --target upload
   ```
4. Visualize as mensagens em tempo real no Monitor Serial (velocidade `115200` baud):
   ```bash
   pio device monitor
   ```

---

## 📜 Licença

Este projeto é de código aberto e livre para uso educacional em escolas, oficinas de robótica e feiras de ciências.
