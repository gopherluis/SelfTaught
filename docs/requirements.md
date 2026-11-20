# Requisitos do Sistema — Selftaught

## 1. Requisitos Funcionais (RF)

### RF01 — Autenticação e Gestão de Usuários
- **RF01.1**: O sistema deve permitir o cadastro de novos usuários com nome, e-mail e senha.
- **RF01.2**: O sistema deve autenticar usuários existentes via e-mail e senha, retornando token JWT.
- **RF01.3**: O sistema deve permitir encerramento de sessão (logout).
- **RF01.4**: O sistema deve retornar os dados do perfil do usuário autenticado (`/api/v1/auth/me`).

### RF02 — Gestão de Trilhas de Aprendizagem (*Learning Paths*)
- **RF02.1**: Criar, listar, visualizar detalhes, atualizar e excluir trilhas de estudo.
- **RF02.2**: Cada trilha deve possuir título, descrição, categoria, lista de objetivos, status (`planned`, `active`, `completed`, `archived`), data de início e data-alvo de conclusão.
- **RF02.3**: O sistema deve calcular automaticamente a porcentagem de conclusão da trilha com base nos módulos e tarefas concluídos.

### RF03 — Módulos de Aprendizagem
- **RF03.1**: Organizar cada trilha em módulos sequenciais com ordem definida (`order_index`).
- **RF03.2**: Cada módulo deve conter título, descrição, objetivos e status (`planned`, `in_progress`, `completed`).
- **RF03.3**: O sistema deve permitir reordenar e associar tarefas diretamente a um módulo.

### RF04 — Gestão de Tarefas (*Task Management*)
- **RF04.1**: Criar, listar, editar e excluir tarefas de estudo.
- **RF04.2**: Suportar prioridades: `low`, `medium`, `high`, `urgent`.
- **RF04.3**: Suportar status: `todo`, `in_progress`, `completed`, `cancelled`.
- **RF04.4**: Suportar prazos (*due dates*), estimativa de tempo em minutos e tempo real gasto.
- **RF04.5**: Permitir subtarefas associadas a uma tarefa pai (`parent_task_id`).
- **RF04.6**: Permitir associar tarefas a uma trilha e/ou módulo.

### RF05 — Base de Conhecimento e Anotações (*Knowledge Base*)
- **RF05.1**: Criar, editar, listar e excluir anotações de estudo com suporte completo a Markdown.
- **RF05.2**: Categorizar anotações por assunto (*subject*) e lista de tags.
- **RF05.3**: Suportar busca textual por palavras-chave no título e conteúdo das notas.
- **RF05.4**: Permitir fixar (*pinned*) e favoritar anotações.
- **RF05.5**: Associar anotações a trilhas de aprendizagem.

### RF06 — Curadoria de Recursos Externos (*Learning Resources*)
- **RF06.1**: Salvar links e referências externas (artigos, livros, vídeos, cursos, documentações).
- **RF06.2**: Rastrear status de leitura/revisão (`is_reviewed`) e avaliação/nota (1 a 5 estrelas).
- **RF06.3**: Associar recursos a trilhas e módulos de estudo.

### RF07 — Dashboard e Métricas de Progresso
- **RF07.1**: Exibir visão geral consolidada com contadores de trilhas ativas, tarefas pendentes, notas criadas e recursos revisados.
- **RF07.2**: Listar próximas tarefas com prazos iminentes.
- **RF07.3**: Exibir linha do tempo recente de atividades de estudo registradas automaticamente.
- **RF07.4**: Apresentar atalhos rápidos para retomar a última trilha ativa.

---

## 2. Requisitos Não-Funcionais (RNF)

- **RNF01 — Segurança**: Todas as senhas devem ser armazenadas com hash seguro (bcrypt/argon2). Nenhuma credencial deve ser versionada.
- **RNF02 — Isolamento de Dados**: Todos os registros devem ser isolados por usuário. Nenhum usuário pode visualizar ou modificar entidades pertencentes a outro usuário.
- **RNF03 — Usabilidade e Design**: Interface limpa, responsiva (mobile e desktop), com alternância de tema claro/escuro e feedback imediato para ações do usuário.
- **RNF04 — Performance**: Tempo de resposta de endpoints de leitura inferior a 150ms em ambiente padrão.
- **RNF05 — Confiabilidade e Testes**: Cobertura de testes automatizados para fluxos críticos de autenticação, CRUD e métricas.
