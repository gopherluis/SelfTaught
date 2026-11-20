"""
Selftaught - Comprehensive System & Flow Verification Script
Tests the full lifecycle of the application:
1. User registration & JWT authentication
2. Profile retrieval & updating
3. Learning Path creation, retrieval, and status management
4. Sequential Module creation and progress calculation
5. Task management with subtasks, priorities, and deadlines
6. Knowledge base notes with Markdown content, search, and tag filtering
7. Resource library with link curation, reviews, and star ratings
8. Dashboard statistics aggregation, streaks, and activity timeline
9. Strict multi-user data isolation and security
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base
from app.api.v1.endpoints import auth, paths, modules, tasks, notes, resources, dashboard
from app.schemas.user import UserCreate, UserLogin, UserUpdate
from app.schemas.path import LearningPathCreate, LearningPathUpdate
from app.schemas.module import ModuleCreate, ModuleUpdate
from app.schemas.task import TaskCreate, TaskUpdate
from app.schemas.note import NoteCreate, NoteUpdate
from app.schemas.resource import ResourceCreate, ResourceUpdate


def run_full_system_verification():
    print("=" * 60)
    print("INICIANDO VERIFICAÇÃO COMPLETA DO SISTEMA SELFTAUGHT")
    print("=" * 60)

    # 1. Setup isolated database
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    db = Session()
    print("✓ Banco de dados relacional em memória inicializado.")

    # 2. Authentication Flow
    print("\n[1/8] Testando Autenticação e Perfis...")
    user_data = UserCreate(
        email="developer@selftaught.dev",
        full_name="Renato Silva",
        password="SecureMasterPassword2026",
    )
    token = auth.register(user_in=user_data, db=db)
    user_a = token.user
    assert token.access_token is not None
    assert user_a.email == "developer@selftaught.dev"
    print(f"✓ Usuário principal cadastrado com sucesso: {user_a.full_name} ({user_a.id})")

    login_res = auth.login(UserLogin(email="developer@selftaught.dev", password="SecureMasterPassword2026"), db=db)
    assert login_res.access_token is not None
    print("✓ Login efetuado com sucesso via hash bcrypt e JWT.")

    # Second user for isolation
    user_b_data = UserCreate(email="attacker@external.dev", full_name="Outro Usuário", password="OtherPassword123")
    token_b = auth.register(user_in=user_b_data, db=db)
    user_b = token_b.user
    print(f"✓ Segundo usuário cadastrado para teste de isolamento: {user_b.full_name}")

    # 3. Learning Paths & Modules Flow
    print("\n[2/8] Testando Trilhas de Aprendizagem e Módulos...")
    path_data = LearningPathCreate(
        title="Arquitetura de Sistemas & Python Avançado",
        description="Estudo aprofundado de concorrência, microsserviços e padrões de projeto",
        category="programming",
        objectives=[
            "Compreender o modelo de memória de Python",
            "Implementar arquitetura limpa com FastAPI e SQLAlchemy",
            "Projetar filas assíncronas e mensageria",
        ],
        status="active",
        color="sky",
        icon="Layers",
    )
    created_path = paths.create_learning_path(path_in=path_data, current_user=user_a, db=db)
    path_id = created_path.id
    assert created_path.title == path_data.title
    print(f"✓ Trilha criada: '{created_path.title}' (ID: {path_id})")

    # Modules
    mod1 = modules.create_module_for_path(
        path_id=path_id,
        module_in=ModuleCreate(
            title="Módulo 1: Padrões Arquiteturais e Injeção de Dependência",
            description="Repository pattern e Service layer",
            objectives=["Desacoplar regra de negócio do ORM"],
            order_index=1,
            status="completed",
        ),
        current_user=user_a,
        db=db,
    )
    mod2 = modules.create_module_for_path(
        path_id=path_id,
        module_in=ModuleCreate(
            title="Módulo 2: Otimização de Consultas e Conexões SQL",
            description="Pools de conexões e índices parciais",
            objectives=["Evitar problemas N+1 em relacionamentos"],
            order_index=2,
            status="in_progress",
        ),
        current_user=user_a,
        db=db,
    )
    print("✓ 2 módulos sequenciais adicionados (1 concluído, 1 em progresso).")

    # Verify calculated progress
    detail = paths.get_learning_path(path_id=path_id, current_user=user_a, db=db)
    assert detail.modules_count == 2
    assert detail.completed_modules_count == 1
    assert detail.progress_percentage == 50.0
    print(f"✓ Progresso dinâmico calculado com precisão: {detail.progress_percentage}%")

    # 4. Tasks & Subtasks Management
    print("\n[3/8] Testando Gestão de Tarefas e Subtarefas...")
    task1 = tasks.create_task(
        task_in=TaskCreate(
            title="Refatorar camada de persistência para Repository Pattern",
            description="Isolar queries em classes dedicadas",
            priority="high",
            status="todo",
            estimated_minutes=120,
            learning_path_id=path_id,
            module_id=mod1.id,
        ),
        current_user=user_a,
        db=db,
    )

    subtask1 = tasks.create_task(
        task_in=TaskCreate(
            title="Criar classe BaseRepository abstrata",
            parent_task_id=task1.id,
            priority="medium",
            status="todo",
        ),
        current_user=user_a,
        db=db,
    )
    print(f"✓ Tarefa principal e subtarefa criadas com sucesso (Parent: {task1.id}, Sub: {subtask1.id})")

    # Complete task
    updated_task = tasks.update_task(
        task_id=task1.id,
        task_in=TaskUpdate(status="completed", actual_minutes=110),
        current_user=user_a,
        db=db,
    )
    assert updated_task.status == "completed"
    assert updated_task.completed_at is not None
    print("✓ Tarefa marcada como concluída e timestamp de conclusão gravado.")

    # 5. Knowledge Base & Markdown Notes
    print("\n[4/8] Testando Base de Conhecimento em Markdown...")
    markdown_note = """# Notas sobre o Padrão Repository

O **Repository Pattern** medeia entre a camada de domínio e a camada de mapeamento de dados:

1. **Abstração**: Trata coleções de dados como se estivessem em memória.
2. **Testabilidade**: Facilita mocks para testes de unidade rápidos sem I/O real.
3. **Manutenibilidade**: Mudanças no dialeto do banco não afetam a lógica de domínio.

```python
class UserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id: str) -> Optional[User]: ...
```
"""
    note = notes.create_note(
        note_in=NoteCreate(
            title="Princípios do Repository Pattern",
            content=markdown_note,
            subject="Engenharia de Software",
            tags=["arquitetura", "python", "clean-code"],
            learning_path_id=path_id,
            is_pinned=True,
        ),
        current_user=user_a,
        db=db,
    )
    assert note.id is not None
    assert note.is_pinned is True
    print(f"✓ Anotação com suporte Markdown criada: '{note.title}'")

    # Search and tag filtering
    tagged_notes = notes.list_notes(tag="arquitetura", current_user=user_a, db=db)
    assert len(tagged_notes) >= 1
    searched_notes = notes.list_notes(search="Testabilidade", current_user=user_a, db=db)
    assert len(searched_notes) >= 1
    print("✓ Busca textual em Markdown e filtros por tag executados com sucesso.")

    # 6. Learning Resources
    print("\n[5/8] Testando Biblioteca de Recursos de Estudo...")
    resource = resources.create_resource(
        res_in=ResourceCreate(
            title="Architecture Patterns with Python (Cosmic Python)",
            url="https://www.cosmicpython.com/book/chapter_02_repository.html",
            description="Guia prático sobre TDD, DDD e Repository Pattern em Python.",
            resource_type="book",
            learning_path_id=path_id,
            is_reviewed=False,
        ),
        current_user=user_a,
        db=db,
    )
    assert resource.is_reviewed is False

    # Review resource and rate
    reviewed_res = resources.update_resource(
        resource_id=resource.id,
        res_in=ResourceUpdate(is_reviewed=True, rating=5),
        current_user=user_a,
        db=db,
    )
    assert reviewed_res.is_reviewed is True
    assert reviewed_res.rating == 5
    print("✓ Recurso externo catalogado, marcado como revisado e avaliado com 5 estrelas.")

    # 7. Dashboard Stats & Streak
    print("\n[6/8] Testando Consolidação de Dashboard e Progresso...")
    dash_stats = dashboard.get_user_dashboard(current_user=user_a, db=db)
    assert dash_stats.active_paths_count == 1
    assert dash_stats.tasks_completed_count == 1
    assert dash_stats.notes_count == 1
    assert dash_stats.resources_count == 1
    assert dash_stats.resources_reviewed_count == 1
    assert len(dash_stats.recent_activities) >= 5
    print(f"✓ Dashboard consolidado:")
    print(f"  • Trilhas ativas: {dash_stats.active_paths_count}")
    print(f"  • Tarefas concluídas: {dash_stats.tasks_completed_count}")
    print(f"  • Anotações catalogadas: {dash_stats.notes_count}")
    print(f"  • Recursos revisados: {dash_stats.resources_reviewed_count}")
    print(f"  • Dias de consistência (streak): {dash_stats.study_streak_days}")
    print(f"  • Atividades registradas no log: {len(dash_stats.recent_activities)}")

    # 8. Multi-user Strict Data Isolation
    print("\n[7/8] Testando Segurança e Isolamento Estrito Multi-inquilino...")
    from fastapi import HTTPException

    # User B tries to view User A's path
    try:
        paths.get_learning_path(path_id=path_id, current_user=user_b, db=db)
        assert False, "FALHA DE SEGURANÇA: Usuário B acessou trilha do Usuário A!"
    except HTTPException as e:
        assert e.status_code == 404
        print("✓ Tentativa de acesso não-autorizado à trilha bloqueada com 404.")

    # User B tries to delete User A's task
    try:
        tasks.delete_task(task_id=task1.id, current_user=user_b, db=db)
        assert False, "FALHA DE SEGURANÇA: Usuário B conseguiu excluir tarefa do Usuário A!"
    except HTTPException as e:
        assert e.status_code == 404
        print("✓ Tentativa de exclusão não-autorizada de tarefa bloqueada com 404.")

    # User B's dashboard should be completely clean
    dash_b = dashboard.get_user_dashboard(current_user=user_b, db=db)
    assert dash_b.active_paths_count == 0
    assert dash_b.tasks_completed_count == 0
    assert dash_b.notes_count == 0
    print("✓ Isolamento total confirmado: painel do Usuário B contém 0 dados do Usuário A.")

    db.close()
    print("\n" + "=" * 60)
    print("TODAS AS ETAPAS DE VERIFICAÇÃO FORAM CONCLUÍDAS COM SUCESSO!")
    print("=" * 60)


if __name__ == "__main__":
    run_full_system_verification()
