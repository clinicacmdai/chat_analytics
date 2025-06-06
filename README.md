<<<<<<< HEAD
# Chat Analytics Platform

Uma plataforma full-stack para análise de conversas de chatbot com autenticação Supabase.

## 🚀 Rodando localmente

1. Instale as dependências:
   ```sh
   npm install
   ```
2. Copie o arquivo `.env.example` para `.env` e preencha com suas chaves do Supabase.
3. Rode o projeto:
   ```sh
   npm run dev
   ```

## 🏗️ Build para produção

```sh
npm run build
```

## ▶️ Rodando em produção

```sh
npm run preview
```

## 🌐 Deploy no Easypanel

1. Suba este projeto para o GitHub.
2. No Easypanel, crie um novo app e conecte ao seu repositório.
3. Configure as variáveis de ambiente (copie de `.env.example`).
4. Comando de build:
   ```sh
   npm run build
   ```
5. Comando de start:
   ```sh
   npm run preview
   ```
6. Porta: `4173` (ou a porta padrão do Vite Preview)

## 🔑 Variáveis de ambiente

Crie um arquivo `.env` com:
```
VITE_SUPABASE_URL=coloque_aqui_sua_url
VITE_SUPABASE_ANON_KEY=coloque_aqui_sua_anon_key
```

## 🛡️ Supabase
- Crie as tabelas e funções conforme o arquivo `schema.sql`.
- Ative RLS e configure as policies conforme instruções anteriores.

## 📂 Estrutura do projeto

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── layouts/       # Layout components
  ├── store/         # Zustand stores
  ├── services/      # API and external services
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  └── hooks/         # Custom React hooks
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

---

Dúvidas? Abra uma issue ou consulte o painel do Supabase/Easypanel.
=======
# chat_analytics
Chat Analytics for Whatsapp AI Agents
>>>>>>> ebfab992aedbb3314e20c205099d2ce99c9d1a56
