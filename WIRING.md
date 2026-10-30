# 🏙️ Guia de Montagem e Apresentação: Postes de Luz Inteligentes (Smart City)
**Projeto para Feira de Robótica e Ciências — Ensino Fundamental (6º ao 8º ano)**  
**Placa Controladora:** ESP32 NodeMCU (30 pinos ou 38 pinos)

---

## 💡 1. O que este projeto faz?
Imagine uma cidade onde os postes de rua não ficam acesos no máximo a noite toda gastando energia à toa quando a rua está vazia!

Na nossa maquete:
1. **Modo Noturno (Lua):** Quando a pista está vazia, os postes ficam fraquinhos (só 14% de brilho), economizando até 80% de energia elétrica.
2. **Carro se aproximando:** Quando o sensor infravermelho vê o carrinho de brinquedo passar, os postes daquele setor **acendem suavemente até 100%** de força.
3. **Segurança no trânsito:** Depois que o carrinho passa, os postes **continuam acesos por mais 2,5 segundos** para garantir que o motorista enxergue o caminho com total segurança.
4. **Apagamento Suave:** Depois dos 2,5 segundos, a luz vai diminuindo devagarzinho até voltar para o modo econômico.

---

## 🧰 2. Lista de Peças Necessárias

| Componente | Quantidade | Para que serve? |
| :--- | :---: | :--- |
| **Placa ESP32 NodeMCU** | 1 | O "cérebro" do projeto que processa os sensores e controla as luzes. |
| **Sensores TCRT5000 (Módulo)** | 4 | Sensores de pista com dois "olhinhos" infravermelhos (um emite luz invisível e o outro lê o reflexo do carro). |
| **LEDs Brancos ou Amarelos** | 8 | 2 LEDs para cada setor (simulando os postes de iluminação). |
| **Resistores de 220 Ω ou 330 Ω** | 8 | Resistor para cada LED não queimar com a corrente do ESP32. |
| **Protoboard (Placa de ensaio)** | 1 ou 2 | Para espetar os fios e componentes sem precisar de solda. |
| **Fios Jumper Macho-Fêmea e Macho-Macho** | ~25 | Para ligar os sensores e LEDs na placa ESP32. |
| **Carrinho de brinquedo (Hot Wheels/Matchbox)** | 1 | Para passar pela pista e testar os sensores na frente dos juízes! |

---

## 🔌 3. Tabela de Ligação dos Fios

> [!TIP]
> **Dica de mestre para a feira:** Use fios com cores organizadas!
> - **Fio Vermelho:** Sempre ligado no pino **3V3** (positivo de 3.3 Volts).
> - **Fio Preto ou Marrom:** Sempre ligado no **GND** (o "terra" ou negativo comum).
> - **Fio Laranja / Amarelo:** Fios dos sensores até o ESP32.
> - **Fio Verde / Azul:** Fios que vão para os LEDs dos postes.

### Mapeamento dos 4 Setores:

| Setor | Sensor TCRT5000 (Pino DO) | LEDs do Poste (+) | Canal PWM |
| :---: | :---: | :---: | :---: |
| **Setor 0** | **GPIO 18** | **GPIO 25** | Canal 0 |
| **Setor 1** | **GPIO 19** | **GPIO 26** | Canal 1 |
| **Setor 2** | **GPIO 21** | **GPIO 27** | Canal 2 |
| **Setor 3** | **GPIO 22** | **GPIO 14** | Canal 3 |

### Como ligar a energia:
- **Pinos VCC de todos os 4 sensores:** Ligar todos juntos no pino **3V3** do ESP32.
- **Pinos GND de todos os 4 sensores e o polo negativo de todos os LEDs:** Ligar todos juntos no barramento azul (**GND**) da protoboard, e depois ligar um fio no **GND** do ESP32.

---

## 📐 4. Desenho de Ligação (Esquema Visual)

### Ligação de 1 Setor (Os outros 3 são iguaizinhos):

```text
                  +-------------------+
                  |   ESP32 NodeMCU   |
                  +---------+---------+
                            |
   [Pino 3V3] --------------+--------------> Vai para o VCC do Sensor
   [Pino GND] --------------+--------------> Vai para o GND do Sensor e dos LEDs
                            |
   [GPIO 18]  <-------------+-------------- Sinal (DO) do Sensor TCRT5000
                            |
   [GPIO 25]  --------------+
                            |
                     +------+------+
                     |             |
                 [Resistor]    [Resistor]
                   (220Ω)        (220Ω)
                     |             |
                   ( + )         ( + )   Perna maior do LED (Ânodo)
                  [LED 1]       [LED 2]
                   ( - )         ( - )   Perna menor com chanfro (Cátodo)
                     |             |
                     +------+------+
                            |
                            v
                       [Pino GND]
```

---

## 🔧 5. Como Regular o Sensor (Calibração do Trimpot)

Cada plaquinha do sensor TCRT5000 tem um **parafusinho azul (trimpot)**:
1. Ligue o ESP32 no computador pelo cabo USB.
2. Na plaquinha do sensor, há dois pequenos LEDs:
   - Um LED verde/vermelho que indica que a placa está ligada.
   - Um segundo LED que indica quando ele detectou um obstáculo.
3. **Com a pista livre (sem carrinho):**
   - Se o segundo LED estiver aceso, pegue uma chavinha de fenda pequena e gire o parafusinho azul devagar no **sentido anti-horário** até o LED apagar.
4. **Com o carrinho na pista:**
   - Coloque o carrinho em cima do sensor (a cerca de 5 a 10 mm de distância).
   - O segundo LED precisa **acender na hora**!
   - Se não acender, gire um pouquinho no **sentido horário** até achar o ponto perfeito.
5. Pronto! Faça isso nos 4 sensores.

---

## 🎤 6. Roteiro de Apresentação para os Alunos (Na Feira)

As crianças podem dividir a apresentação em **3 etapas simples e marcantes**:

### Parte 1: O Problema (Apresentador 1)
> *"Olá! Você sabia que quase 40% da conta de luz de uma cidade inteira é gasta apenas com a iluminação pública? E o pior: nas madrugadas, as ruas ficam vazias, mas os postes continuam queimando energia na potência máxima a noite toda! Isso gasta dinheiro público e polui o meio ambiente."*

### Parte 2: A Nossa Solução e Demonstração (Apresentador 2)
*(Enquanto fala, pega o carrinho e passa devagar pelos 4 setores da maquete)*
> *"Para resolver isso, nós criamos esta Cidade Inteligente! Olhem a nossa maquete: quando não tem ninguém na rua, os postes ficam no 'Modo Noturno', com apenas 14% de luz, economizando energia. Mas quando o meu carrinho passa por este sensor infravermelho... vejam só! O poste acende suavemente até 100%!*
>
> *E reparem em um detalhe muito importante: depois que o carrinho passa, a luz não apaga de repente. Ela fica acesa por mais 2 segundos e meio para dar tempo do motorista passar com segurança, e depois apaga bem devagarzinho para não dar susto no trânsito!"*

### Parte 3: Como a Tecnologia Funciona (Apresentador 3)
> *"Tudo isso é controlado por este microcontrolador, o ESP32. Nós programamos ele em C++ usando uma técnica chamada PWM, que controla o brilho dos LEDs com pulsos de energia milhares de vezes por segundo.*
>
> *Além disso, o nosso código é totalmente 'sem travamentos': nós não usamos a função delay(). Nós usamos o relógio interno do microcontrolador (o millis()), o que permite que todos os 4 setores funcionem ao mesmo tempo de forma totalmente independente!"*

---

## ❓ 7. Perguntas que os Juízes Podem Fazer (e Como Responder!)

**P1: Por que vocês usaram resistores nos LEDs?**  
*Resposta:* "Se ligarmos o LED direto no ESP32, vai passar corrente demais e o LED ou a placa podem queimar. O resistor serve como um limitador de corrente de segurança."

**P2: O que é esse PWM que vocês falaram?**  
*Resposta:* "PWM significa Modulação por Largura de Pulso. Em vez de diminuir a voltagem, o ESP32 liga e desliga o LED 5.000 vezes por segundo. Como é muito rápido, o olho humano não percebe piscando, mas enxerga o LED mais fraco ou mais forte!"

**P3: Por que vocês não usaram a função `delay()` no código?**  
*Resposta:* "Porque a função delay() congela a placa inteira! Se um carro passasse no Setor 3 enquanto o Setor 0 estava esperando um delay, o sensor não veria o carro. Com a função millis(), a placa nunca para e monitora todos os setores ao mesmo tempo."

**P4: Qual é a economia real desse sistema?**  
*Resposta:* "Em uma avenida movimentada, estima-se uma economia entre 60% e 80% do consumo elétrico em comparação com lâmpadas que ficam acesas 100% o tempo todo!"
