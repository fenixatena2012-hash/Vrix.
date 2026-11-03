# ECLIPSE — Reinos das Trevas

Protótipo 3D dark fantasy jogável para navegador, com câmera em terceira pessoa, vila medieval, NPCs, missão, combate básico, XP/nível, controles móveis e multiplayer em tempo real via Socket.IO.

## O que já funciona

- Mundo 3D gerado no navegador com Three.js: construções góticas, árvores, névoa, lanternas, sombras e personagens.
- Movimento em terceira pessoa, pulo e esquiva.
- NPCs: Maelis (missão), Doran (ferreiro) e Ilyra (mercadora).
- Criaturas hostis, ataques, dano, morte/retorno das criaturas, XP e níveis.
- HUD, minimapa ilustrativo, diálogo e chat.
- Multiplayer de protótipo: posição/nome dos jogadores, entrada/saída e chat via Socket.IO.

## Importante sobre o multiplayer

O multiplayer **precisa do servidor Node.js** deste projeto. Abrir `index.html` diretamente como arquivo não inicia o servidor. A simulação de movimento e combate ainda é majoritariamente local; o servidor sincroniza presença, posições e chat, não é um MMO completo autoritativo. Não há persistência de personagem/conta, inventário real ou proteção contra trapaças nesta primeira versão.

## Rodar no computador

1. Instale Node.js 18 ou mais recente.
2. Extraia o ZIP e abra a pasta do projeto no terminal.
3. Execute:

   ```bash
   npm install
   npm start
   ```

4. Abra `http://localhost:3000`.

Para testar multiplayer na mesma rede, os dispositivos precisam alcançar o IP local do computador na porta 3000. Em geral, o firewall precisa permitir a conexão.

## Publicar no GitHub e Render

1. Crie um repositório no GitHub e envie **os arquivos e pastas** deste projeto.
2. No Render, escolha **New + → Web Service** e conecte o repositório.
3. Configure:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Crie o serviço. O Render fornece uma URL HTTPS.
5. Abra a URL e compartilhe o mesmo link com os amigos. O servidor Socket.IO usa a mesma origem; não é necessário configurar uma URL separada para o cliente.
6. Se alterar o código no GitHub, faça commit/push e aguarde o redeploy.

## Controles

### PC
- WASD ou setas: mover
- Espaço: pular
- E: interagir
- F ou botão ATACAR: atacar
- Shift: esquivar
- Esc: menu

### Celular
- Controle virtual à esquerda: mover
- PULAR, ESQUIVA, ATACAR e INTERAGIR à direita
- Chat na parte inferior esquerda

## Estrutura

```text
eclipse-reinos-das-trevas/
├── package.json
├── server.js
├── README.md
└── public/
    ├── index.html
    ├── style.css
    └── game.js
```

## Próximos passos recomendados

- Combate e movimento validados no servidor.
- Contas, persistência e inventário.
- Melhorias de colisão e navegação da cidade.
- Animações 3D de maior qualidade e modelos/sons originais.
- Grupos, masmorras e chefes cooperativos.
