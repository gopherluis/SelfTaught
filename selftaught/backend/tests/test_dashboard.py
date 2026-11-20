import pytest
from sqlalchemy.orm import Session
from app.api.v1.endpoints import dashboard, notes, paths, tasks
from app.models.user import User
from app.schemas.note import NoteCreate
from app.schemas.path import LearningPathCreate
from app.schemas.task import TaskCreate


def test_dashboard_stats_aggregation(db_session: Session, test_user: User):
    # 1. Create a path
    p = paths.create_learning_path(
        path_in=LearningPathCreate(title="Linear Algebra for CS", status="active", category="math"),
        current_user=test_user,
        db=db_session,
    )

    # 2. Create tasks
    tasks.create_task(
        task_in=TaskCreate(title="Eigenvalues practice", learning_path_id=p.id, priority="high", status="todo"),
        current_user=test_user,
        db=db_session,
    )
    tasks.create_task(
        task_in=TaskCreate(title="Read Chapter 1", learning_path_id=p.id, priority="medium", status="completed"),
        current_user=test_user,
        db=db_session,
    )

    # 3. Create note
    notes.create_note(
        note_in=NoteCreate(title="Eigenvalues Summary", content="det(A - lambda*I) = 0", subject="Math"),
        current_user=test_user,
        db=db_session,
    )

    # 4. Fetch dashboard stats
    stats = dashboard.get_user_dashboard(current_user=test_user, db=db_session)

    assert stats.active_paths_count == 1
    assert stats.tasks_todo_count == 1
    assert stats.tasks_completed_count == 1
    assert stats.notes_count == 1
    assert len(stats.active_paths) == 1
    assert len(stats.recent_activities) >= 3
