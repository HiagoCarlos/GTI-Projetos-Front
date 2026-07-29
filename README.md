# GTI · Sistema de Projetos — Frontend

Frontend em React + Vite para o sistema de cadastro e gerenciamento de projetos do GTI.

## Rodando o projeto

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se a API não estiver em localhost:8080
npm run dev
```

Abre em `http://localhost:5173`.

## Conectando com a API

Por padrão, o app consome `http://localhost:8080/api` (ver `src/api/client.js`).
Para apontar pra outro endereço, edite o `.env`:

```
VITE_API_URL=http://localhost:8080/api
```

## Estrutura

```
src/
├── api/client.js         → chamadas HTTP para a API Spring Boot
├── components/
│   ├── Topbar.jsx         → navegação superior centralizada e responsiva
│   ├── ProjetoForm.jsx    → formulário de criação/edição
│   ├── ConfirmModal.jsx   → confirmação de exclusão
│   └── ToastContext.jsx   → notificações de sucesso/erro
├── pages/
│   ├── Indicadores.jsx    → página inicial (dashboard): totais e distribuição
│   ├── NovoProjeto.jsx    → cadastro com pré-visualização ao vivo
│   ├── PainelProjetos.jsx → tabela com filtros, busca, edição e exclusão
│   ├── EditarProjeto.jsx  → edição de projeto (inclui status)
│   └── Responsaveis.jsx   → CRUD simples de responsáveis
├── constants.js           → enums espelhando o backend (Status, Categoria)
└── styles/                → tokens de design + estilos globais
```

## Layout

Navegação em barra superior centralizada (não sidebar), conteúdo limitado a 1040px
e centralizado na tela. Abaixo de 720px a navegação vira um menu hambúrguer e a
tabela do painel se reorganiza em lista empilhada — sem JS extra, só CSS.

## Observações

- Antes de cadastrar um projeto, cadastre pelo menos um responsável na aba **Responsáveis** — o formulário de projeto depende disso.
- A listagem em **Painel de Projetos** já usa paginação, filtros por status/categoria e busca por título, todos resolvidos pela API (`Pageable` + `Specification`).
- Não há autenticação implementada — igual definido no escopo do backend.
