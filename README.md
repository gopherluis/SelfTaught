# Selftaught — Plataforma de Organização de Estudos e Aprendizagem Autodidata

**Selftaught** é uma plataforma moderna, modular e minimalista projetada para apoiar estudantes independentes, desenvolvedores, matemáticos, poliglotas e cientistas a estruturar seus estudos, documentar conhecimento e acompanhar o seu progresso de forma visual e intuitiva.

---

## 🌟 Visão e Filosofia do Produto

1. **Estrutura Híbrida**: Combina trilhas de aprendizagem sequenciais (*learning paths*) com anotações livres e interconectadas.
2. **Foco na Execução**: Tarefas acionáveis, prioridades, datas de entrega e subtarefas integradas diretamente a módulos e trilhas.
3. **Simplicidade e Produtividade**: Interface limpa (estilo Linear/SaaS moderno), suporte completo a temas claro/escuro, sem fricção desnecessária.
4. **Sem Dependência Obrigatória de IA**: O núcleo do sistema funciona com total autonomia e privacidade local.
5. **Multi-Disciplinar**: Concebido tanto para quem estuda Ciência da Computação quanto para quem aprende Cálculo, Mandarim, Biologia Molecular ou Finanças.

---

## 🚀 Tecnologias Utilizadas

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS com design system customizado e suporte Dark/Light mode
- **Ícones**: Lucide React
- **Componentes**: Primitivas acessíveis e modais responsivos

### Backend
- **Framework**: Python FastAPI
- **ORM / Banco de Dados**: SQLAlchemy 2.0 (Suporte completo a PostgreSQL / Supabase e SQLite local)
- **Validação de Schemas**: Pydantic v2
- **Migrações**: Alembic
- **Segurança**: Criptografia de senhas (bcrypt/passlib), autenticação JWT Bearer tokens e isolamento estrito de dados por usuário

### Testes
- **Backend**: Pytest, HTTPX (TestClient com SQLite in-memory para testes ultrarrápidos e isolados)
- **Frontend / E2E**: Playwright / Scripts de validação de fluxo

---

## 📂 Estrutura do Projeto

```
selftaught/
├── backend/                  # API REST em FastAPI
│   ├── alembic/             # Migrações de banco de dados
│   ├── app/
│   │   ├── api/v1/          # Endpoints REST (auth, paths, modules, tasks, notes, resources, dashboard)
│   │   ├── core/            # Configurações, segurança e conexão de banco
│   │   ├── models/          # Modelos de dados SQLAlchemy
│   │   ├── schemas/         # Schemas de validação Pydantic
│   │   ├── services/        # Lógica de negócio e estatísticas
│   │   └── main.py          # Ponto de entrada FastAPI
│   ├── tests/               # Testes automatizados com Pytest
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/                 # Aplicação Next.js (App Router)
│   ├── src/
│   │   ├── app/             # Rotas e páginas da aplicação
│   │   ├── components/      # Componentes UI reutilizáveis
│   │   ├── context/         # Provedores de contexto (Auth, Tema)
│   │   ├── lib/             # Cliente de API e utilitários
│   │   └── types/           # Tipagens TypeScript
│   ├── package.json
│   └── tailwind.config.ts
├── docs/                     # Documentação técnica e funcional
│   ├── architecture.md      # Detalhes de arquitetura e modelo de dados
│   ├── requirements.md      # Requisitos funcionais e não-funcionais
│   └── roadmap.md           # Roadmap de evolução do produto
├── .env.example              # Modelo de variáveis de ambiente
├── .gitignore
├── AGENTS.md                 # Guia de desenvolvimento para agentes de IA
└── README.md
```

---

## ⚡ Instalação e Execução

### Pré-requisitos
- Python 3.11+ (testado em Python 3.13)
- Node.js 18+ (testado em Node 20+)
- npm ou pnpm

### 1. Configurando o Backend

```bash
cd selftaught/backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# No Windows PowerShell:
.\venv\Scripts\Activate.ps1
# No Linux/macOS:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar a API
uvicorn app.main:app --reload --port 8000
```

A documentação interativa da API estará disponível em: `http://127.0.0.1:8000/docs`

### 2. Executando os Testes do Backend

```bash
cd selftaught/backend
pytest -v
```

### 3. Configurando o Frontend

```bash
cd selftaught/frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação web estará disponível em: `http://localhost:3000`

---

## 🔒 Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` tanto no backend quanto no frontend conforme necessário:

```ini
SECRET_KEY="sua-chave-secreta-forte-gerada-aleatoriamente"
DATABASE_URL="sqlite+aiosqlite:///./selftaught.db" # Ou postgresql+asyncpg://user:pass@host:5432/db
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000/api/v1"
```

---

## 📄 Licença
Distribuído sob licença MIT. Consulte `LICENSE` para maiores detalhes.
