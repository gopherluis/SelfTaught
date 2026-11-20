from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.module import Module
from app.models.path import LearningPath
from app.models.user import User
from app.schemas.module import ModuleCreate, ModuleResponse, ModuleUpdate
from app.services.activity_service import record_activity

router = APIRouter()


@router.get("/path/{path_id}", response_model=List[ModuleResponse])
def list_modules_for_path(
    path_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Lists all modules for a given learning path."""
    path = db.scalar(
        select(LearningPath).where(LearningPath.id == path_id, LearningPath.user_id == current_user.id)
    )
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trilha de aprendizagem não encontrada.",
        )

    stmt = select(Module).where(Module.learning_path_id == path_id).order_by(Module.order_index.asc())
    modules = db.execute(stmt).scalars().all()
    return [ModuleResponse.model_validate(m) for m in modules]


@router.post("/path/{path_id}", response_model=ModuleResponse, status_code=status.HTTP_201_CREATED)
def create_module_for_path(
    path_id: str,
    module_in: ModuleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Creates a new module inside a specific learning path."""
    path = db.scalar(
        select(LearningPath).where(LearningPath.id == path_id, LearningPath.user_id == current_user.id)
    )
    if not path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trilha de aprendizagem não encontrada.",
        )

    module = Module(
        learning_path_id=path.id,
        title=module_in.title.strip(),
        description=module_in.description,
        objectives=module_in.objectives,
        order_index=module_in.order_index,
        status=module_in.status,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return ModuleResponse.model_validate(module)


@router.put("/{module_id}", response_model=ModuleResponse)
def update_module(
    module_id: str,
    module_in: ModuleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Updates an existing module."""
    stmt = (
        select(Module)
        .join(LearningPath, Module.learning_path_id == LearningPath.id)
        .where(Module.id == module_id, LearningPath.user_id == current_user.id)
    )
    module = db.execute(stmt).scalars().first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo não encontrado.",
        )

    old_status = module.status
    if module_in.title is not None:
        module.title = module_in.title.strip()
    if module_in.description is not None:
        module.description = module_in.description
    if module_in.objectives is not None:
        module.objectives = module_in.objectives
    if module_in.order_index is not None:
        module.order_index = module_in.order_index
    if module_in.status is not None:
        module.status = module_in.status
        if module_in.status == "completed" and old_status != "completed":
            record_activity(
                db,
                user_id=current_user.id,
                activity_type="module_completed",
                learning_path_id=module.learning_path_id,
                metadata_json={"title": module.title},
            )

    db.add(module)
    db.commit()
    db.refresh(module)
    return ModuleResponse.model_validate(module)


@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_module(
    module_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Deletes a module."""
    stmt = (
        select(Module)
        .join(LearningPath, Module.learning_path_id == LearningPath.id)
        .where(Module.id == module_id, LearningPath.user_id == current_user.id)
    )
    module = db.execute(stmt).scalars().first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Módulo não encontrado.",
        )

    db.delete(module)
    db.commit()
    return None
