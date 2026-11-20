from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.module import Module
from app.models.path import LearningPath
from app.models.resource import Resource
from app.models.user import User
from app.schemas.resource import ResourceCreate, ResourceResponse, ResourceUpdate
from app.services.activity_service import record_activity

router = APIRouter()


@router.get("/", response_model=List[ResourceResponse])
def list_resources(
    learning_path_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    is_reviewed: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Lists learning resources for the authenticated user."""
    stmt = (
        select(Resource, LearningPath.title.label("path_title"), Module.title.label("mod_title"))
        .outerjoin(LearningPath, Resource.learning_path_id == LearningPath.id)
        .outerjoin(Module, Resource.module_id == Module.id)
        .where(Resource.user_id == current_user.id)
    )

    if learning_path_id:
        stmt = stmt.where(Resource.learning_path_id == learning_path_id)
    if resource_type:
        stmt = stmt.where(Resource.resource_type == resource_type)
    if is_reviewed is not None:
        stmt = stmt.where(Resource.is_reviewed == is_reviewed)
    if search:
        search_fmt = f"%{search.strip().lower()}%"
        stmt = stmt.where((Resource.title.ilike(search_fmt)) | (Resource.url.ilike(search_fmt)))

    stmt = stmt.order_by(Resource.created_at.desc())
    rows = db.execute(stmt).all()

    return [
        ResourceResponse(
            id=res.id,
            user_id=res.user_id,
            title=res.title,
            url=res.url,
            description=res.description,
            resource_type=res.resource_type,
            is_reviewed=res.is_reviewed,
            rating=res.rating,
            learning_path_id=res.learning_path_id,
            module_id=res.module_id,
            created_at=res.created_at,
            updated_at=res.updated_at,
            learning_path_title=p_title,
            module_title=m_title,
        )
        for res, p_title, m_title in rows
    ]


@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    res_in: ResourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Saves a new learning resource link."""
    p_title = None
    if res_in.learning_path_id:
        path = db.scalar(
            select(LearningPath).where(
                LearningPath.id == res_in.learning_path_id,
                LearningPath.user_id == current_user.id,
            )
        )
        if not path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Trilha de aprendizagem especificada não pertence ao usuário.",
            )
        p_title = path.title

    resource = Resource(
        user_id=current_user.id,
        learning_path_id=res_in.learning_path_id,
        module_id=res_in.module_id,
        title=res_in.title.strip(),
        url=str(res_in.url).strip(),
        description=res_in.description,
        resource_type=res_in.resource_type,
        is_reviewed=res_in.is_reviewed,
        rating=res_in.rating,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)

    record_activity(
        db,
        user_id=current_user.id,
        activity_type="resource_added",
        learning_path_id=resource.learning_path_id,
        metadata_json={"title": resource.title, "url": resource.url},
    )
    db.commit()

    return ResourceResponse(
        id=resource.id,
        user_id=resource.user_id,
        title=resource.title,
        url=resource.url,
        description=resource.description,
        resource_type=resource.resource_type,
        is_reviewed=resource.is_reviewed,
        rating=resource.rating,
        learning_path_id=resource.learning_path_id,
        module_id=resource.module_id,
        created_at=resource.created_at,
        updated_at=resource.updated_at,
        learning_path_title=p_title,
    )


@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieves a single resource."""
    stmt = (
        select(Resource, LearningPath.title.label("path_title"), Module.title.label("mod_title"))
        .outerjoin(LearningPath, Resource.learning_path_id == LearningPath.id)
        .outerjoin(Module, Resource.module_id == Module.id)
        .where(Resource.id == resource_id, Resource.user_id == current_user.id)
    )
    row = db.execute(stmt).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurso não encontrado.",
        )
    res, p_title, m_title = row

    return ResourceResponse(
        id=res.id,
        user_id=res.user_id,
        title=res.title,
        url=res.url,
        description=res.description,
        resource_type=res.resource_type,
        is_reviewed=res.is_reviewed,
        rating=res.rating,
        learning_path_id=res.learning_path_id,
        module_id=res.module_id,
        created_at=res.created_at,
        updated_at=res.updated_at,
        learning_path_title=p_title,
        module_title=m_title,
    )


@router.put("/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: str,
    res_in: ResourceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Updates a learning resource."""
    stmt = select(Resource).where(Resource.id == resource_id, Resource.user_id == current_user.id)
    resource = db.execute(stmt).scalars().first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurso não encontrado.",
        )

    old_reviewed = resource.is_reviewed
    if res_in.title is not None:
        resource.title = res_in.title.strip()
    if res_in.url is not None:
        resource.url = str(res_in.url).strip()
    if res_in.description is not None:
        resource.description = res_in.description
    if res_in.resource_type is not None:
        resource.resource_type = res_in.resource_type
    if res_in.is_reviewed is not None:
        resource.is_reviewed = res_in.is_reviewed
        if res_in.is_reviewed and not old_reviewed:
            record_activity(
                db,
                user_id=current_user.id,
                activity_type="resource_reviewed",
                learning_path_id=resource.learning_path_id,
                metadata_json={"title": resource.title},
            )
    if res_in.rating is not None:
        resource.rating = res_in.rating
    if res_in.learning_path_id is not None:
        resource.learning_path_id = res_in.learning_path_id
    if res_in.module_id is not None:
        resource.module_id = res_in.module_id

    db.add(resource)
    db.commit()
    db.refresh(resource)

    p_title = None
    if resource.learning_path_id:
        p_title = db.scalar(select(LearningPath.title).where(LearningPath.id == resource.learning_path_id))

    return ResourceResponse(
        id=resource.id,
        user_id=resource.user_id,
        title=resource.title,
        url=resource.url,
        description=resource.description,
        resource_type=resource.resource_type,
        is_reviewed=resource.is_reviewed,
        rating=resource.rating,
        learning_path_id=resource.learning_path_id,
        module_id=resource.module_id,
        created_at=resource.created_at,
        updated_at=resource.updated_at,
        learning_path_title=p_title,
    )


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    resource_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Deletes a resource."""
    stmt = select(Resource).where(Resource.id == resource_id, Resource.user_id == current_user.id)
    resource = db.execute(stmt).scalars().first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurso não encontrado.",
        )

    db.delete(resource)
    db.commit()
    return None
