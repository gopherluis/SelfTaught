import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.api.v1.endpoints import modules, paths
from app.models.user import User
from app.schemas.module import ModuleCreate
from app.schemas.path import LearningPathCreate, LearningPathUpdate


def test_create_and_get_learning_path(db_session: Session, test_user: User):
    # 1. Create path
    path_in = LearningPathCreate(
        title="Machine Learning Fundamentals",
        description="Linear algebra, calculus, and neural nets",
        category="science",
        objectives=["Understand backpropagation", "Build CNN from scratch"],
        status="active",
        color="emerald",
        icon="Cpu",
    )
    created = paths.create_learning_path(path_in=path_in, current_user=test_user, db=db_session)
    assert created.title == "Machine Learning Fundamentals"
    assert created.progress_percentage == 0.0

    # 2. Add modules
    mod1 = modules.create_module_for_path(
        path_id=created.id,
        module_in=ModuleCreate(
            title="Module 1: Matrix Calculus",
            description="Gradients and Jacobians",
            objectives=["Master chain rule in matrix form"],
            order_index=1,
            status="completed",
        ),
        current_user=test_user,
        db=db_session,
    )
    assert mod1.status == "completed"

    mod2 = modules.create_module_for_path(
        path_id=created.id,
        module_in=ModuleCreate(
            title="Module 2: Feedforward Networks",
            description="Activation and loss functions",
            objectives=["Implement forward pass"],
            order_index=2,
            status="in_progress",
        ),
        current_user=test_user,
        db=db_session,
    )
    assert mod2.status == "in_progress"

    # 3. Get detailed path
    detailed = paths.get_learning_path(path_id=created.id, current_user=test_user, db=db_session)
    assert detailed.modules_count == 2
    assert detailed.completed_modules_count == 1
    assert detailed.progress_percentage == 50.0
    assert len(detailed.modules) == 2


def test_path_data_isolation(db_session: Session, test_user: User, second_user: User):
    # User A creates path
    path_in = LearningPathCreate(
        title="User A Private Path",
        category="programming",
        status="active",
    )
    created = paths.create_learning_path(path_in=path_in, current_user=test_user, db=db_session)

    # User B attempts to access User A's path
    with pytest.raises(HTTPException) as exc_get:
        paths.get_learning_path(path_id=created.id, current_user=second_user, db=db_session)
    assert exc_get.value.status_code == 404

    # User B attempts to delete User A's path
    with pytest.raises(HTTPException) as exc_del:
        paths.delete_learning_path(path_id=created.id, current_user=second_user, db=db_session)
    assert exc_del.value.status_code == 404

    # Verify still exists for User A
    existing = paths.get_learning_path(path_id=created.id, current_user=test_user, db=db_session)
    assert existing.id == created.id
