from datetime import datetime, timezone
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.module import Module
from app.models.path import LearningPath
from app.models.user import User
from app.schemas.path import (
    LearningPathCreate,
    LearningPathDetailResponse,
    LearningPathResponse,
    LearningPathUpdate,
    ModuleResponse,
)
from app.services.activity_service import record_activity
from app.services.stats_service import compute_path_progress

router = APIRouter()


@router.get("/", response_model=List[LearningPathResponse])
def list_learning_paths(
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Lists all learning paths belonging to the authenticated user."""
    stmt = select(LearningPath).where(LearningPath.user_id == current_user.id)

    if status_filter and isinstance(status_filter, str):
        stmt = stmt.where(LearningPath.status == status_filter)
    if category and isinstance(category, str):
        stmt = stmt.where(LearningPath.category == category)
    if search and isinstance(search, str):
        search_fmt = f"%{search.strip().lower()}%"
        stmt = stmt.where(LearningPath.title.ilike(search_fmt))

    stmt = stmt.order_by(LearningPath.created_at.desc())
    paths = db.execute(stmt).scalars().all()

    response: List[LearningPathResponse] = []
    for path in paths:
        progress_info = compute_path_progress(db, path)
        path_data = LearningPathResponse(
            id=path.id,
            user_id=path.user_id,
            title=path.title,
            description=path.description,
            category=path.category,
            objectives=path.objectives or [],
            status=path.status,
            start_date=path.start_date,
            target_date=path.target_date,
            completed_at=path.completed_at,
            color=path.color,
            icon=path.icon,
            created_at=path.created_at,
            updated_at=path.updated_at,
            progress_percentage=progress_info["progress_percentage"],
            modules_count=progress_info["modules_count"],
            completed_modules_count=progress_info["completed_modules_count"],
            tasks_count=progress_info["tasks_count"],
            completed_tasks_count=progress_info["completed_tasks_count"],
        )
        response.append(path_data)

    return response


@router.post("/", response_model=LearningPathResponse, status_code=status.HTTP_201_CREATED)
def create_learning_path(
    path_in: LearningPathCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Creates a new learning path for the authenticated user."""
    path = LearningPath(
        user_id=current_user.id,
        title=path_in.title.strip(),
        description=path_in.description,
        category=path_in.category,
        objectives=path_in.objectives,
        status=path_in.status,
        start_date=path_in.start_date,
        target_date=path_in.target_date,
        color=path_in.color,
        icon=path_in.icon,
    )
    db.add(path)
    db.commit()
    db.refresh(path)

    record_activity(
        db,
        user_id=current_user.id,
        activity_type="path_created",
        learning_path_id=path.id,
        metadata_json={"title": path.title, "category": path.category},
    )
    db.commit()

    return LearningPathResponse(
        id=path.id,
        user_id=path.user_id,
        title=path.title,
        description=path.description,
        category=path.category,
        objectives=path.objectives or [],
        status=path.status,
        start_date=path.start_date,
        target_date=path.target_date,
        completed_at=path.completed_at,
        color=path.color,
        icon=path.icon,
        created_at=path.created_at,
        updated_at=path.updated_at,
        progress_percentage=0.0,
        modules_count=0,
        completed_modules_count=0,
        tasks_count=0,
        completed_tasks_count=0,
    )


@router.get("/{path_id}", response_model=LearningPathDetailResponse)
def get_learning_path(
    path_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieves a specific learning path with its modules and calculated progress."""
    stmt = (
        select(LearningPath)
        .options(selectinload(LearningPath.modules))
        .where(LearningPath.id == path_id, LearningPath.user_id == current_user.id)
    )
    path = db.execute(stmt).scalars().first()
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trilha de aprendizagem não encontrada.",
        )

    progress_info = compute_path_progress(db, path)
    sorted_modules = sorted(path.modules, key=lambda m: m.order_index)
    modules_resp = [ModuleResponse.model_validate(m) for m in sorted_modules]

    return LearningPathDetailResponse(
        id=path.id,
        user_id=path.user_id,
        title=path.title,
        description=path.description,
        category=path.category,
        objectives=path.objectives or [],
        status=path.status,
        start_date=path.start_date,
        target_date=path.target_date,
        completed_at=path.completed_at,
        color=path.color,
        icon=path.icon,
        created_at=path.created_at,
        updated_at=path.updated_at,
        progress_percentage=progress_info["progress_percentage"],
        modules_count=progress_info["modules_count"],
        completed_modules_count=progress_info["completed_modules_count"],
        tasks_count=progress_info["tasks_count"],
        completed_tasks_count=progress_info["completed_tasks_count"],
        modules=modules_resp,
    )


@router.put("/{path_id}", response_model=LearningPathResponse)
def update_learning_path(
    path_id: str,
    path_in: LearningPathUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Updates an existing learning path."""
    stmt = select(LearningPath).where(LearningPath.id == path_id, LearningPath.user_id == current_user.id)
    path = db.execute(stmt).scalars().first()
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trilha de aprendizagem não encontrada.",
        )

    old_status = path.status
    if path_in.title is not None:
        path.title = path_in.title.strip()
    if path_in.description is not None:
        path.description = path_in.description
    if path_in.category is not None:
        path.category = path_in.category
    if path_in.objectives is not None:
        path.objectives = path_in.objectives
    if path_in.status is not None:
        path.status = path_in.status
        if path_in.status == "completed" and old_status != "completed":
            path.completed_at = datetime.now(timezone.utc)
            record_activity(
                db,
                user_id=current_user.id,
                activity_type="path_completed",
                learning_path_id=path.id,
                metadata_json={"title": path.title},
            )
        elif path_in.status != "completed":
            path.completed_at = None
    if path_in.start_date is not None:
        path.start_date = path_in.start_date
    if path_in.target_date is not None:
        path.target_date = path_in.target_date
    if path_in.color is not None:
        path.color = path_in.color
    if path_in.icon is not None:
        path.icon = path_in.icon

    db.add(path)
    db.commit()
    db.refresh(path)

    progress_info = compute_path_progress(db, path)
    return LearningPathResponse(
        id=path.id,
        user_id=path.user_id,
        title=path.title,
        description=path.description,
        category=path.category,
        objectives=path.objectives or [],
        status=path.status,
        start_date=path.start_date,
        target_date=path.target_date,
        completed_at=path.completed_at,
        color=path.color,
        icon=path.icon,
        created_at=path.created_at,
        updated_at=path.updated_at,
        progress_percentage=progress_info["progress_percentage"],
        modules_count=progress_info["modules_count"],
        completed_modules_count=progress_info["completed_modules_count"],
        tasks_count=progress_info["tasks_count"],
        completed_tasks_count=progress_info["completed_tasks_count"],
    )


@router.delete("/{path_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_learning_path(
    path_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Deletes a learning path and cascades associated modules/data."""
    stmt = select(LearningPath).where(LearningPath.id == path_id, LearningPath.user_id == current_user.id)
    path = db.execute(stmt).scalars().first()
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trilha de aprendizagem não encontrada.",
        )

    db.delete(path)
    db.commit()
    return None
