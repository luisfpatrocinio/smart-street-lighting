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
A maquete possui **4 postes no total** (1 poste por setor ao longo da calçada):

1. **Solda ou Emenda dos Fios no LED:**
   - Pegue o LED branco (ou amarelo).
   - A perna maior é o positivo (**Ânodo**). Conecte nela o **resistor de 220Ω**.
   - Solde ou emende um fio jumper comprido no resistor (sinal que vai para o ESP32).
   - Solde ou emende outro fio jumper na perna menor (**Cátodo / Negativo**).
   - Isole com fita isolante para que uma perna não encoste na outra!
2. **Passando o fio pelo canudo:**
   - Passe os dois fios por dentro do canudo plástico preto até o LED ficar no topo.
   - Curve a ponta superior do canudo em formato de braço de poste ou cole a cúpula sobre o LED.
3. **Fixação na calçada:**
   - Faça um furinho de 5 mm na calçada para passar os fios para baixo da base.
   - Cole a base do canudo na calçada ao lado do sensor com uma gotinha de cola quente.

---

### Etapa 3: Instalando os Sensores TCRT5000 nas Calçadas
1. O sensor TCRT5000 é fixado na **lateral da pista (calçada)**, deitado na horizontal.
2. As duas lentes apontam diretamente para a **lateral/porta dos carrinhos** (a cerca de 5 a 10 mm do chão).
3. Graças ao **INPUT_PULLUP** do ESP32, você só precisa de **2 fios no fototransistor**: pino de dados e GND.
4. O sensor pode ser montado na base de cada poste ou em um pequeno totem de papelão.

---

### Etapa 4: Organização dos Fios Subterrâneos (Embaixo da Maquete)
Para a maquete ficar limpa, todos os fios ficam **embaixo da base**:

1. Use pezinhos de borracha ou calços de **3 a 4 cm de altura** nos 4 cantos da base para criar o "porão técnico".
2. Fixe a protoboard e o ESP32 embaixo da maquete.
3. Conecte os 4 postes aos GPIOs 2, 4, 5 e 23 e os 4 sensores aos GPIOs 18, 19, 21 e 22.
4. Conecte todos os terras (**GND**) no barramento comum da protoboard.
5. Deixe o cabo USB do ESP32 acessível para ligar no computador ou powerbank.

---

## 🧪 4. Checklist de Testes de Bancada

Antes de levar a maquete para a feira, execute este checklist:

- [ ] **Teste de Iluminação:** Ao ligar o ESP32 na tomada USB, todos os 4 postes devem acender em **Modo Noturno (14%)**.
- [ ] **Teste do Poste 1:** Passe o carrinho na frente do sensor 1. O Poste 1 deve ir para 100% de brilho instantaneamente.
- [ ] **Teste do Temporizador:** Afaste o carrinho. O poste deve sustentar 100% por 2,5 segundos e dimerizar suavemente.
- [ ] **Repita o teste nos Postes 2, 3 e 4.**
