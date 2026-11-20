import pytest
from sqlalchemy.orm import Session
from app.api.v1.endpoints import tasks
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate


def test_tasks_lifecycle_and_subtasks(db_session: Session, test_user: User):
    # 1. Create parent task
    parent_in = TaskCreate(
        title="Complete Chapter 3 Exercises",
        description="Odd problems from 1 to 25",
        priority="high",
        status="todo",
        estimated_minutes=90,
    )
    parent = tasks.create_task(task_in=parent_in, current_user=test_user, db=db_session)
    assert parent.priority == "high"
    assert parent.status == "todo"

    # 2. Create subtask
    sub_in = TaskCreate(
        title="Solve problem 1 to 10",
        parent_task_id=parent.id,
        priority="medium",
        status="todo",
    )
    sub = tasks.create_task(task_in=sub_in, current_user=test_user, db=db_session)
    assert sub.parent_task_id == parent.id

    # 3. Retrieve parent task with subtasks
    retrieved = tasks.get_task(task_id=parent.id, current_user=test_user, db=db_session)
    assert len(retrieved.subtasks) == 1
    assert retrieved.subtasks[0].id == sub.id

    # 4. Complete parent task
    update_in = TaskUpdate(status="completed", actual_minutes=80)
    updated = tasks.update_task(task_id=parent.id, task_in=update_in, current_user=test_user, db=db_session)
    assert updated.status == "completed"
    assert updated.completed_at is not None
    assert updated.actual_minutes == 80


def test_task_filters(db_session: Session, test_user: User):
    # Create tasks
    tasks.create_task(
        task_in=TaskCreate(title="Urgent Review", priority="urgent", status="todo"),
        current_user=test_user,
        db=db_session,
    )
    tasks.create_task(
        task_in=TaskCreate(title="Casual Reading", priority="low", status="completed"),
        current_user=test_user,
        db=db_session,
    )

    # Filter by priority
    urgent_tasks = tasks.list_tasks(priority="urgent", current_user=test_user, db=db_session)
    assert any(t.title == "Urgent Review" for t in urgent_tasks)
    assert not any(t.title == "Casual Reading" for t in urgent_tasks)

    # Filter by status
    completed_tasks = tasks.list_tasks(status_filter="completed", current_user=test_user, db=db_session)
    assert any(t.title == "Casual Reading" for t in completed_tasks)
