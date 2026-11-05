# 🛠️ Manual de Montagem Física da Maquete (Smart Street Lighting)

Este guia foi elaborado para professores, alunos do 6º ao 8º ano e monitores. Ele ensina o passo a passo completo para construir a maquete da pista, os postes de iluminação e posicionar os sensores e o ESP32 de forma limpa, resistente e profissional para a feira de ciências.

---

## 📋 1. Materiais Recomendados

### Estrutura e Pista
- **Base da Maquete:** 1 placa de Papel Pluma (Foam Board) ou Papelão Paraná/MDF fino (Dimensão recomendada: **80 cm de comprimento x 30 cm de largura**).
- **Asfalto:** Cartolina preta, EVA preto ou fita isolante larga (10 a 12 cm de largura ao longo dos 80 cm).
- **Faixas da Estrada:** Fita crepe fina (5 mm), corretivo líquido branco ou caneta permanente branca.
- **Vegetação / Calçada (Opcional):** EVA cinza para as calçadas e feltro/EVA verde para os canteiros laterais.

### Postes de Luz (8 unidades — 2 por setor)
- **Hastes dos Postes:** 8 canudos plásticos pretos rígidos ou palitos de pirulito/haste plástica de 10 a 12 cm de altura.
- **Cúpulas dos Postes:** Copinhos de café descartáveis pequenos cortados, tampinhas plásticas ou pequenos cones de cartolina preta.
- **Fita Isolante ou Espaguete Termoretrátil:** Para isolar as perninhas dos LEDs dentro do canudo e evitar curto-circuito.

### Ferramentas de Apoio
- Pistola de cola quente (com supervisão de adulto).
- Fita crepe e fita dupla-face.
- Tesoura e estilete.
- Régua de 30 cm ou trena.
- Chave de fenda pequena (para regular o trimpot dos sensores).

---

## 📐 2. Planta Baixa e Medidas da Maquete

A pista possui **80 cm** de extensão dividida em **4 setores de 20 cm cada**.

```text
|<--------------------------------- 80 cm --------------------------------->|
+---------------------------------------------------------------------------+
| [Poste 0A]         [Poste 1A]         [Poste 2A]         [Poste 3A]       | Calçada Norte
|   (10 cm)            (30 cm)            (50 cm)            (70 cm)        |
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                                                                           | Faixa 1 (Ida)
|                                                                           |
| - - - - - - - - -  - - - - - - - - -  - - - - - - - - -  - - - - - - - -  | Faixa Tracejada
|                                                                           | Faixa 2 (Volta)
|   ▲ Feixe IR          ▲ Feixe IR         ▲ Feixe IR         ▲ Feixe IR    | (Horizontal)
+ - ┼ - - - - - - -  - -┼ - - - - - - - - -┼ - - - - - - -  - ┼ - - - - - - +
| [Sensor 0]         [Sensor 1]         [Sensor 2]         [Sensor 3]       | Calçada Sul
| [Poste 0B]         [Poste 1B]         [Poste 2B]         [Poste 3B]       | (Totens de Radar)
|   (10 cm)            (30 cm)            (50 cm)            (70 cm)        |
+---------------------------------------------------------------------------+
|                              SETOR 0    |   SETOR 1    |   SETOR 2    |   SETOR 3 |
|                            (0 a 20 cm)  | (20 a 40 cm) | (40 a 60 cm) | (60 a 80 cm)|
```

---

## 🔨 3. Passo a Passo da Montagem

### Etapa 1: Preparando a Base e a Pista
1. Pegue a placa de base (**80 cm x 30 cm**).
2. No centro, cole a faixa de asfalto preto com **12 cm de largura**.
3. Deixe **9 cm** de margem de cada lado para as calçadas e canteiros.
4. Desenhe as faixas centrais tracejadas no asfalto com régua e caneta branca/corretivo (tracinhos de 3 cm com espaço de 2 cm).
5. Com a régua, marque a lápis os 4 pontos dos sensores no asfalto:
   - **Ponto 0:** a 10 cm da largada.
   - **Ponto 1:** a 30 cm da largada.
   - **Ponto 2:** a 50 cm da largada.
   - **Ponto 3:** a 70 cm da largada.
6. Fure a base em cada um desses 4 pontos (um furo retangular de aproximadamente **1,5 cm x 1 cm**) para encaixar os dois olhinhos do sensor TCRT5000.

---

### Etapa 2: Construindo os Postes com Canudo e LEDs
Cada setor possui **2 postes** (um de cada lado da rua). Total = 8 postes.

1. **Solda ou Emenda dos Fios no LED:**
   - Pegue o LED branco (ou amarelo).
   - A perna maior é o positivo (**Ânodo**). Conecte nela o **resistor de 220Ω**.
   - Solde ou emende um fio jumper comprido no resistor (sinal que vai para o ESP32).
   - Solde ou emende outro fio jumper na perna menor (**Cátodo / Negativo**).
   - Isole com fita isolante para que uma perna não encoste na outra!
2. **Passando o fio pelo canudo:**
   - Passe os dois fios por dentro do canudo plástico preto até o LED ficar no topo.
   - Curve a ponta superior do canudo em formato de braço de poste ou cole a cúpula de papel sobre o LED.
3. **Fixação na maquete:**
   - Faça um furinho de 5 mm na calçada para passar os fios para baixo da base.
   - Cole a base do canudo na maquete com uma gotinha de cola quente.

---

### Etapa 3: Instalando os Sensores TCRT5000 no Chão
1. O módulo TCRT5000 tem dois "olhinhos" na ponta: um **emissor transparente** (que solta luz infravermelha invisível) e um **receptor preto** (que lê o reflexo).
2. Encaixe a plaquinha **por baixo da maquete**, de modo que apenas os dois olhinhos fiquem rentes ao chão da pista (apontando para cima).
3. Cole a plaquinha por baixo com cola quente ou fita dupla-face reforçada.
4. **Cuidado:** não passe cola em cima da lente dos olhinhos para não bloquear o feixe óptico!

---

### Etapa 4: Organização dos Fios Subterrâneos (Embaixo da Maquete)
Para a maquete ficar limpa aos olhos dos juízes, todos os fios devem ficar **embaixo da base**:

1. Use pequenos calços de papelão ou pezinhos de borracha de **3 a 4 cm de altura** nos 4 cantos da base para criar um "porão técnico".
2. Fixe a protoboard e o ESP32 embaixo da maquete com fita dupla-face.
3. Agrupe os fios de cada setor com pedacinhos de fita crepe:
   - Setor 0: Fios laranjas (Sensor) e verdes (LEDs).
   - Setor 1: Fios laranjas e amarelos.
   - Setor 2: Fios laranjas e azuis.
   - Setor 3: Fios laranjas e roxos.
4. Conecte todos os terras (**GND**) no barramento azul da protoboard.
5. Conecte todos os positivos dos sensores (**VCC**) no pino **3V3** do ESP32.
6. Deixe o conector micro-USB do ESP32 acessível na lateral para plugar no computador ou em um carregador de celular (powerbank).

---

## 🧪 4. Checklist de Testes de Bancada

Antes de levar a maquete para a feira, execute este checklist:

- [ ] **Teste de Continuidade:** Verifique se nenhuma perna de LED está dando curto com o terra.
- [ ] **Teste de Iluminação:** Ao ligar o ESP32 na tomada USB, todos os 8 postes devem acender fraquinhos no **Modo Noturno (14%)**.
- [ ] **Calibração do Sensor 0:** Passe a mão ou o carrinho sobre o furo 0. O poste 0A e 0B devem ir para 100% de brilho instantaneamente.
- [ ] **Teste do Temporizador:** Afaste o carrinho. Conte no relógio: os postes devem permanecer 100% por 2,5 segundos e depois diminuir a luz suavemente.
- [ ] **Repita o teste nos setores 1, 2 e 3.**
- [ ] **Teste com Iluminação do Ambiente:** Acenda as luzes da sala e confira se nenhum poste acende sozinho (se acender falso alarme, regule o parafuso azul do sensor girando no sentido anti-horário).
