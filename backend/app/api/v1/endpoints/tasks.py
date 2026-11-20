from datetime import datetime, timezone
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.module import Module
from app.models.path import LearningPath
from app.models.task import Task
from app.models.user import User
from app.schemas.task import SubtaskResponse, TaskCreate, TaskResponse, TaskUpdate
from app.services.activity_service import record_activity

router = APIRouter()


@router.get("/", response_model=List[TaskResponse])
def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = None,
    learning_path_id: Optional[str] = None,
    module_id: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Lists tasks for the authenticated user, excluding subtasks in top-level view unless filtered."""
    stmt = (
        select(Task, LearningPath.title.label("path_title"), Module.title.label("mod_title"))
        .outerjoin(LearningPath, Task.learning_path_id == LearningPath.id)
        .outerjoin(Module, Task.module_id == Module.id)
        .options(selectinload(Task.subtasks))
        .where(Task.user_id == current_user.id)
    )

    if status_filter and isinstance(status_filter, str):
        stmt = stmt.where(Task.status == status_filter)
    if priority and isinstance(priority, str):
        stmt = stmt.where(Task.priority == priority)
    if learning_path_id and isinstance(learning_path_id, str):
        stmt = stmt.where(Task.learning_path_id == learning_path_id)
    if module_id and isinstance(module_id, str):
        stmt = stmt.where(Task.module_id == module_id)
    if search and isinstance(search, str):
        search_fmt = f"%{search.strip().lower()}%"
        stmt = stmt.where(Task.title.ilike(search_fmt))

    stmt = stmt.order_by(Task.due_date.asc().nulls_last(), Task.created_at.desc())
    records = db.execute(stmt).all()

    tasks_out: List[TaskResponse] = []
    for task_obj, p_title, m_title in records:
        subtasks_data = [
            SubtaskResponse(
                id=sub.id,
                title=sub.title,
                status=sub.status,
                priority=sub.priority,
                completed_at=sub.completed_at,
            )
            for sub in task_obj.subtasks
        ]
        tasks_out.append(
            TaskResponse(
                id=task_obj.id,
                user_id=task_obj.user_id,
                title=task_obj.title,
                description=task_obj.description,
                priority=task_obj.priority,
                status=task_obj.status,
                due_date=task_obj.due_date,
                estimated_minutes=task_obj.estimated_minutes,
                actual_minutes=task_obj.actual_minutes,
                completed_at=task_obj.completed_at,
                learning_path_id=task_obj.learning_path_id,
                module_id=task_obj.module_id,
                parent_task_id=task_obj.parent_task_id,
                created_at=task_obj.created_at,
                updated_at=task_obj.updated_at,
                learning_path_title=p_title,
                module_title=m_title,
                subtasks=subtasks_data,
            )
        )
    return tasks_out


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Creates a new study task or subtask."""
    p_title = None
    if task_in.learning_path_id:
        path = db.scalar(
            select(LearningPath).where(
                LearningPath.id == task_in.learning_path_id,
                LearningPath.user_id == current_user.id,
            )
        )
        if not path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Trilha de aprendizagem especificada não pertence ao usuário.",
            )
        p_title = path.title

    m_title = None
    if task_in.module_id:
        module = db.scalar(
            select(Module)
            .join(LearningPath, Module.learning_path_id == LearningPath.id)
            .where(Module.id == task_in.module_id, LearningPath.user_id == current_user.id)
        )
        if not module:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Módulo especificado não encontrado ou não pertence ao usuário.",
            )
        m_title = module.title

    task = Task(
        user_id=current_user.id,
        learning_path_id=task_in.learning_path_id,
        module_id=task_in.module_id,
        parent_task_id=task_in.parent_task_id,
        title=task_in.title.strip(),
        description=task_in.description,
        priority=task_in.priority,
        status=task_in.status,
        due_date=task_in.due_date,
        estimated_minutes=task_in.estimated_minutes,
        actual_minutes=task_in.actual_minutes,
        completed_at=datetime.now(timezone.utc) if task_in.status == "completed" else None,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    record_activity(
        db,
        user_id=current_user.id,
        activity_type="task_created",
        learning_path_id=task.learning_path_id,
        metadata_json={"title": task.title, "priority": task.priority},
    )
    db.commit()

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        estimated_minutes=task.estimated_minutes,
        actual_minutes=task.actual_minutes,
        completed_at=task.completed_at,
        learning_path_id=task.learning_path_id,
        module_id=task.module_id,
        parent_task_id=task.parent_task_id,
        created_at=task.created_at,
        updated_at=task.updated_at,
        learning_path_title=p_title,
        module_title=m_title,
        subtasks=[],
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieves a single task with its subtasks."""
    stmt = (
        select(Task, LearningPath.title.label("path_title"), Module.title.label("mod_title"))
        .outerjoin(LearningPath, Task.learning_path_id == LearningPath.id)
        .outerjoin(Module, Task.module_id == Module.id)
        .options(selectinload(Task.subtasks))
        .where(Task.id == task_id, Task.user_id == current_user.id)
    )
    row = db.execute(stmt).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada.",
        )
    task, p_title, m_title = row

    subtasks_data = [
        SubtaskResponse(
            id=sub.id,
            title=sub.title,
            status=sub.status,
            priority=sub.priority,
            completed_at=sub.completed_at,
        )
        for sub in task.subtasks
    ]

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        estimated_minutes=task.estimated_minutes,
        actual_minutes=task.actual_minutes,
        completed_at=task.completed_at,
        learning_path_id=task.learning_path_id,
        module_id=task.module_id,
        parent_task_id=task.parent_task_id,
        created_at=task.created_at,
        updated_at=task.updated_at,
        learning_path_title=p_title,
        module_title=m_title,
        subtasks=subtasks_data,
    )


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Updates a task status, priority, description, or minutes."""
    stmt = (
        select(Task)
        .options(selectinload(Task.subtasks))
        .where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = db.execute(stmt).scalars().first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada.",
        )

    old_status = task.status
    if task_in.title is not None:
        task.title = task_in.title.strip()
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.priority is not None:
        task.priority = task_in.priority
    if task_in.status is not None:
        task.status = task_in.status
        if task_in.status == "completed" and old_status != "completed":
            task.completed_at = datetime.now(timezone.utc)
            record_activity(
                db,
                user_id=current_user.id,
                activity_type="task_completed",
                learning_path_id=task.learning_path_id,
                metadata_json={"title": task.title},
            )
        elif task_in.status != "completed":
            task.completed_at = None

    if task_in.due_date is not None:
        task.due_date = task_in.due_date
    if task_in.estimated_minutes is not None:
        task.estimated_minutes = task_in.estimated_minutes
    if task_in.actual_minutes is not None:
        task.actual_minutes = task_in.actual_minutes
    if task_in.learning_path_id is not None:
        task.learning_path_id = task_in.learning_path_id
    if task_in.module_id is not None:
        task.module_id = task_in.module_id

    db.add(task)
    db.commit()
    db.refresh(task)

    p_title = None
    if task.learning_path_id:
        p_title = db.scalar(select(LearningPath.title).where(LearningPath.id == task.learning_path_id))

    m_title = None
    if task.module_id:
        m_title = db.scalar(select(Module.title).where(Module.id == task.module_id))

    subtasks_data = [
        SubtaskResponse(
            id=sub.id,
            title=sub.title,
            status=sub.status,
            priority=sub.priority,
            completed_at=sub.completed_at,
        )
        for sub in task.subtasks
    ]

    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        estimated_minutes=task.estimated_minutes,
        actual_minutes=task.actual_minutes,
        completed_at=task.completed_at,
        learning_path_id=task.learning_path_id,
        module_id=task.module_id,
        parent_task_id=task.parent_task_id,
        created_at=task.created_at,
        updated_at=task.updated_at,
        learning_path_title=p_title,
        module_title=m_title,
        subtasks=subtasks_data,
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Deletes a task and its subtasks."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    task = db.execute(stmt).scalars().first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada.",
        )

    db.delete(task)
    db.commit()
    return None
