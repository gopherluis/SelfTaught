# AGENTS.md — Diretrizes de Engenharia para Agentes Autônomos

Este documento orienta agentes de inteligência artificial e desenvolvedores que colaboram no projeto **Selftaught**.

---

## 1. Princípios de Arquitetura

- **Isolamento Estrito de Dados**: Toda entidade de usuário (`LearningPath`, `Task`, `Note`, `Resource`, `StudyActivity`) DEVE estar vinculada ao `user_id` do usuário autenticado. Nenhuma consulta deve expor dados de um usuário para outro.
- **Validação Rigorosa**: O backend usa Pydantic v2 para validação estrita de entrada e saída. Não bypassar validações nem permitir campos não tipados.
- **Camada de Serviço e Repositório**: A lógica de cálculo de progresso, percentuais e registro de histórico de atividades de estudo deve ser encapsulada em services/helpers para manter os endpoints enxutos e desacoplados.
- **Portabilidade de Banco de Dados**: A aplicação é concebida para ser 100% compatível com PostgreSQL (Supabase) e SQLite (desenvolvimento e testes locais). Evitar comandos SQL brutos específicos de dialetos; utilizar as abstrações do SQLAlchemy 2.0.

---

## 2. Padrões de Código

### Backend (Python / FastAPI)
- Seguir PEP 8 e tipagem estrita com Type Hints (`typing`, `Optional`, `List`, `Dict`).
- Todas as rotas de API da v1 ficam organizadas em `app/api/v1/endpoints/`.
- Autenticação injetada via dependency: `current_user: User = Depends(get_current_active_user)`.
- Senhas NUNCA devem ser salvas ou retornadas em plain text.

### Frontend (Next.js / TypeScript / Tailwind)
- Usar App Router com server e client components devidamente demarcados com `'use client'` quando utilizam estado/efeito.
- Manter acessibilidade, feedback de carregamento (*spinners*, *skeletons*), tratamento de erros de rede e estados vazios amigáveis (*empty states*).
- Cores e tokens devem respeitar o tema claro/escuro via variáveis CSS / classes Tailwind (`dark:...`).

---

## 3. Fluxo de Validação de Mudanças
Antes de dar qualquer tarefa como concluída:
1. Executar testes de backend: `pytest -v`.
2. Verificar build de produção do frontend: `npm run build`.
3. Garantir que `.gitignore` exclui arquivos `.env`, bancos `.db` e diretórios de build.
