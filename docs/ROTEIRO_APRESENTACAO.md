# 🎤 Roteiro de Apresentação para a Feira de Robótica (6º ao 8º Ano)

Este guia foi elaborado para treinar a equipe de alunos que apresentará a maquete aos avaliadores, juízes e visitantes da feira de ciências.

---

## 👥 1. Divisão da Equipe (3 Apresentadores)

Recomenda-se dividir a apresentação entre 3 alunos, com duração total de **3 a 4 minutos**:

```text
[Apresentador 1] ──> Introdução & O Problema da Energia nas Cidades (1 minuto)
[Apresentador 2] ──> Demonstração Prática na Maquete com o Carrinho (1,5 minuto)
[Apresentador 3] ──> Como Funciona o ESP32, o Código e o PWM (1,5 minuto)
```

---

## 📜 2. Fala Passo a Passo dos Apresentadores

### Apresentador 1: O Problema Real
> *"Olá a todos! Sejam muito bem-vindos ao nosso projeto de Cidade Inteligente!*
>
> *Vocês sabiam que a iluminação pública é responsável por quase 40% de toda a conta de energia elétrica de um município? E o pior: durante a madrugada inteira, entre meia-noite e cinco da manhã, as ruas ficam completamente desertas, mas os postes tradicionais continuam queimando eletricidade em potência máxima! Isso desperdiça milhões de reais dos cofres públicos e gera toneladas de poluição e pegada de carbono.*
>
> *Para resolver esse grande problema, nós desenvolvemos este sistema autônomo de Iluminação Pública Inteligente com microcontrolador ESP32!"*

---

### Apresentador 2: A Demonstração Prática na Maquete
*(Nesse momento, o aluno pega o carrinho de brinquedo e posiciona no início da pista)*

> *"Vejam como a nossa maquete funciona na prática:*
>
> *1. Quando não há nenhum veículo na estrada, os postes permanecem no **Modo Noturno (Brilho da Lua)**, consumindo apenas 14% de energia. Isso mantém a calçada iluminada para pedestres com segurança, mas economizando até 80% na conta de luz.*
>
> *2. Agora, observem quando eu passo com este carrinho pelo Setor 0:*  
> *(Passa o carrinho sobre o Sensor 0)*  
> *Vejam só! O sensor infravermelho detectou a passagem e os postes daquele setor acenderam de forma suave até 100%!*
>
> *3. E reparem no detalhe mais importante: quando o carrinho sai da frente do sensor... a luz não apaga de repente! Ela obedece a nossa **Regra dos 2,5 Segundos de Segurança**, mantendo a pista clara para o motorista completar a travessia, e só depois vai apagando bem devagarzinho para não ofuscar a visão de ninguém!"*

---

### Apresentador 3: Como a Tecnologia Funciona (Hardware & Código)
*(Aponta para o notebook com a página interativa `index.html` aberta e para a placa ESP32)*

> *"Para fazer tudo isso funcionar, nós utilizamos uma placa **ESP32 NodeMCU** programada em linguagem C++.*
>
> *Destacamos três soluções técnicas no nosso projeto:*
>
> *1. **Controle por PWM (Modulação por Largura de Pulso):** O ESP32 não queima energia em resistores para diminuir a luz; ele liga e desliga os postes 5.000 vezes por segundo. Como é ultra-rápido, o olho humano só enxerga uma iluminação suave e perfeita.*
>
> *2. **Filtro Digital de Ruído (Debounce):** Programamos um filtro de 30 milissegundos para que a luz da sala ou sombras não acionem os postes por engano.*
>
> *3. **Programação sem Travamentos com `millis()`:** Nós não usamos a função `delay()`. O ESP32 usa seu próprio relógio interno, permitindo que os 4 setores da cidade funcionem de forma simultânea e independente!*
>
> *Muito obrigado pela atenção! Estamos abertos para dúvidas e perguntas!"*

---

## ❓ 3. Perguntas que os Juízes Costumam Fazer (e Respostas na Ponta da Língua!)

### P1: "E se passarem vários carros em sequência rápida?"
> **Resposta:** *"O nosso código renova o cronômetro a cada detecção! Enquanto houver carros passando, o setor permanece em 100% contínuo. A contagem de 2,5 segundos só começa quando o último carro da fila passar pelo sensor."*

### P2: "Por que vocês escolheram o ESP32 em vez do Arduino Uno?"
> **Resposta:** *"O ESP32 possui múltiplos canais de hardware PWM de alta velocidade (5 kHz), além de ter memória muito mais rápida para múltiplos sensores e a possibilidade de no futuro conectarmos à internet via Wi-Fi para enviar relatórios de economia para a prefeitura!"*

### P3: "Por que colocar um sensor de chão em vez de uma câmera com inteligência artificial?"
> **Resposta:** *"O sensor infravermelho reflexivo TCRT5000 custa apenas alguns reais, não invade a privacidade dos cidadãos, consome pouquíssima energia e funciona perfeitamente mesmo na escuridão total ou com neblina, tornando a solução viável e barata para qualquer cidade!"*
