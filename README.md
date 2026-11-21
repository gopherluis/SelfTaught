# SelfTaught

## Visão geral

SelfTaught é uma aplicação monorepo que combina um **frontend** desenvolvido com **Next.js 14** e um **backend** construído em **FastAPI**. O frontend consome a API do backend e armazena os dados em um banco PostgreSQL provisionado pelo **Supabase**. A implantação é feita na **Vercel**, que hospeda tanto o frontend quanto o backend via *Serverless Functions*.

Link de acesso: https://selftaught-5n3x-sigma.vercel.app
PS.: Esse programa é feito apenas com propósito de aprendizado, todos os dados da aplicação são descartáveis, não insira nenhum dado sensível.
---

## Estrutura do projeto

```
SelfTaught/
├─ backend/                # API FastAPI
│   ├─ app/
│   │   ├─ api/            # Endpoints de versão 1
│   │   ├─ core/           # Configurações, DB, segurança
│   │   ├─ models/         # Modelos ORM (SQLAlchemy)
│   │   ├─ schemas/        # Pydantic schemas
│   │   └─ services/       # Lógica de negócios
│   ├─ alembic/            # Migrações de banco
│   └─ requirements.txt    # Dependências do backend
│
├─ frontend/               # Aplicação Next.js
│   ├─ public/             # Arquivos estáticos (placeholder .keep)
│   ├─ src/
│   │   ├─ app/            # Páginas e roteamento de UI
│   │   ├─ components/     # Componentes React reutilizáveis
│   │   ├─ context/        # Contextos React (auth, tema)
│   │   ├─ lib/            # Funções auxiliares (api, utils)
│   │   └─ types/          # Definições TypeScript
│   └─ package.json        # Scripts npm e dependências
│
├─ supabase/               # Projeto Supabase
│   └─ migrations/         # Scripts SQL de migração
│
├─ .gitignore
├─ .env.example            # Exemplo de variáveis de ambiente
├─ AGENTS.md               # Diretrizes de engenharia para agentes
├─ vercel.json             # Configuração de implantação Vercel
└─ README.md               # Este documento
```

---

## Configuração local

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/gopherluis/SelfTaught.git
   cd SelfTaught
   ```
2. **Instalar dependências do backend**
   ```bash
   python -m venv venv
   source venv/Scripts/activate   # Windows PowerShell
   pip install -r backend/requirements.txt
   ```
3. **Instalar dependências do frontend**
   ```bash
   cd frontend
   npm ci   # instala as dependências exatamente como no lockfile
   ```
4. **Configurar variáveis de ambiente**
   - Copiar `.env.example` para `.env` e preencher os valores (por exemplo, `SUPABASE_URL`, `SUPABASE_KEY`, `DATABASE_URL`).
   - O backend lê essas variáveis em `backend/app/core/config.py`.
5. **Aplicar migrações do Supabase (local ou remoto)**
   ```bash
   supabase db push   # requer supabase CLI autenticado
   ```
6. **Iniciar servidores de desenvolvimento**
   - Backend:
     ```bash
     uvicorn backend/app.main:app --reload
     ```
   - Frontend:
     ```bash
     cd frontend
     npm run dev
     ```
   - A aplicação estará disponível em `http://localhost:3000`.

---

## Scripts npm úteis (frontend)

| Script | Descrição |
|--------|-----------|
| `dev` | Inicia o servidor de desenvolvimento Next.js.
| `build` | Compila a aplicação para produção. Produz a pasta `.next`.
| `start` | Executa a aplicação a partir da compilação (`.next`).
| `lint` | Executa ESLint e verifica formatação.
| `test` | Executa testes unitários (se configurados).

> **Nota:** O script `prebuild` foi removido porque continha comandos específicos do Windows que provocavam erros de permissão (`EPERM`). Caso seja necessário algum passo pré‑build, adicione‑o como script explícito e não como `prebuild`.

---

## Configuração do Vercel (`vercel.json`)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "backend": {
      "root": "backend",
      "framework": "fastapi"
    },
    "frontend": {
      "root": "frontend",
      "framework": "nextjs",
      "outputDirectory": ".next",
      "bindings": [
        {
          "type": "service",
          "service": "backend",
          "format": "url",
          "env": "INTERNAL_BACKEND_URL"
        }
      ]
    }
  },
  "rewrites": [
    { "src": "^/api/(.*)$", "dest": "backend" },
    { "src": "^(.*)$", "dest": "frontend" }
  ]
}
```

- **`outputDirectory`** informa ao Vercel onde encontrar os artefatos estáticos gerados pelo Next.js. Deve ser `".next"`.
- **`rewrites`** tem prioridade sobre `routes`. A primeira regra encaminha todas as chamadas que iniciam com `/api/` para o serviço backend; a segunda captura tudo o que resta e serve a aplicação frontend.
- **`bindings`** cria a variável de ambiente `INTERNAL_BACKEND_URL` contendo a URL interna do serviço backend.

### Erros comuns de implantação Vercel

| Erro | Causa provável | Solução |
|------|----------------|---------|
| `STATIC_BUILD_NO_OUT_DIR` | `outputDirectory` ausente ou incorreto | Verifique se `"outputDirectory": ".next"` está presente no bloco `frontend`.
| `INVALID_RUNTIME` | Campo `runtime` com valor inválido (`nodejs`) | Remova o campo `runtime` ou use um valor suportado (`nodejs18` ou `nodejs20`).
| 404 “This page doesn’t exist” | `rewrites` ausentes ou ordem incorreta | Garanta que a regra de API vem antes da catch‑all e que `rewrites` está definido em vez de `routes`.

---

## Testes

### Backend

```bash
cd backend
pytest -v
```

Os testes estão localizados em `backend/tests/` e cobrem autenticação, CRUD de recursos e endpoints de usuário.

### Frontend

```bash
cd frontend
npm run test
```

> **Observação:** Por padrão o projeto ainda não contém testes de UI; adicione-os conforme a necessidade.

---

## Resolução de erros frequentes (local)

1. **Lock de Git (`index.lock`)**
   - O erro ocorre quando outro processo mantém o lock. Feche IDEs, terminais ou processos Git em execução e delete o arquivo manualmente:
     ```bash
     rm -f .git/index.lock
     ```
   - Se o arquivo não existir, verifique permissões de escrita na pasta `.git`.
2. **`EPERM` ao executar `npm run build`**
   - Causado por scripts que tentam manipular arquivos protegidos (por exemplo, `icacls`). Certifique‑se de que o `package.json` não contém um script `prebuild` que execute comandos de sistema. Remova‑o ou substitua por uma função Node.js.
3. **Problemas de dependência (`npm WARN unknown env config "cache-dir"`)**
   - Aviso inofensivo; pode ser silenciado removendo a entrada `cache-dir` do `.npmrc`. Não impede a construção.
4. **Falha ao iniciar backend (`uvicorn` não encontra módulos)**
   - Garanta que o ambiente virtual esteja ativado e que `PYTHONPATH` inclua o diretório `backend`. Use `python -m backend.app.main` para validar.
5. **Variáveis de ambiente ausentes**
   - A aplicação falhará ao iniciar sem `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_KEY` ou `INTERNAL_BACKEND_URL`. Confirme se o arquivo `.env` contém todas as chaves listadas em `backend/app/core/config.py`.

---

## Processo de CI/CD (simplificado)

1. **Commit** → GitHub Actions (ou outro CI) executa `pytest` no backend e `npm run lint` no frontend.
2. **Push para `main`** → Vercel detecta o novo commit, executa `npm ci && npm run build` no frontend e `pip install -r requirements.txt && uvicorn ...` na função backend.
3. **Deploy concluído** → Verifique a URL gerada no painel Vercel.

---

## Contribuindo

- **Fork** o repositório e crie uma branch para sua feature.
- Siga as convenções de código: PEP 8 para Python, `eslint`/`prettier` para TypeScript.
- Execute os testes antes de abrir um Pull Request.
- Atualize o arquivo `CHANGELOG.md` (se existente) com uma breve descrição da mudança.

---

## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo `LICENSE` para detalhes.

---

*Este documento será mantido atualizado conforme mudanças de arquitetura ou fluxo de trabalho.*
