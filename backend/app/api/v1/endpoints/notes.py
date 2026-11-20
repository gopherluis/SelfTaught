from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.module import Module
from app.models.note import Note
from app.models.path import LearningPath
from app.models.user import User
from app.schemas.note import NoteCreate, NoteResponse, NoteUpdate
from app.services.activity_service import record_activity

router = APIRouter()


@router.get("/", response_model=List[NoteResponse])
def list_notes(
    learning_path_id: Optional[str] = None,
    subject: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    is_pinned: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Lists knowledge base notes belonging to the authenticated user."""
    stmt = (
        select(Note, LearningPath.title.label("path_title"), Module.title.label("mod_title"))
        .outerjoin(LearningPath, Note.learning_path_id == LearningPath.id)
        .outerjoin(Module, Note.module_id == Module.id)
        .where(Note.user_id == current_user.id)
    )

    if learning_path_id:
        stmt = stmt.where(Note.learning_path_id == learning_path_id)
    if subject:
        stmt = stmt.where(Note.subject == subject)
    if is_favorite is not None:
        stmt = stmt.where(Note.is_favorite == is_favorite)
    if is_pinned is not None:
        stmt = stmt.where(Note.is_pinned == is_pinned)
    if search:
        search_fmt = f"%{search.strip().lower()}%"
        stmt = stmt.where((Note.title.ilike(search_fmt)) | (Note.content.ilike(search_fmt)))

    stmt = stmt.order_by(Note.is_pinned.desc(), Note.updated_at.desc())
    rows = db.execute(stmt).all()

    notes_out: List[NoteResponse] = []
    for note, p_title, m_title in rows:
        if tag and tag.lower() not in [t.lower() for t in (note.tags or [])]:
            continue

        notes_out.append(
            NoteResponse(
                id=note.id,
                user_id=note.user_id,
                title=note.title,
                content=note.content,
                subject=note.subject,
                tags=note.tags or [],
                is_pinned=note.is_pinned,
                is_favorite=note.is_favorite,
                learning_path_id=note.learning_path_id,
                module_id=note.module_id,
                created_at=note.created_at,
                updated_at=note.updated_at,
                learning_path_title=p_title,
                module_title=m_title,
            )
        )
    return notes_out


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_in: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Creates a new study note with Markdown content."""
    p_title = None
    if note_in.learning_path_id:
        path = db.scalar(
            select(LearningPath).where(
                LearningPath.id == note_in.learning_path_id,
                LearningPath.user_id == current_user.id,
            )
        )
        if not path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Trilha de aprendizagem especificada não pertence ao usuário.",
            )
        p_title = path.title

    note = Note(
        user_id=current_user.id,
        learning_path_id=note_in.learning_path_id,
        module_id=note_in.module_id,
        title=note_in.title.strip(),
        content=note_in.content,
        subject=note_in.subject.strip(),
        tags=note_in.tags,
        is_pinned=note_in.is_pinned,
        is_favorite=note_in.is_favorite,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    record_activity(
        db,
        user_id=current_user.id,
        activity_type="note_created",
        learning_path_id=note.learning_path_id,
        metadata_json={"title": note.title, "subject": note.subject},
    )
    db.commit()

    return NoteResponse(
        id=note.id,
        user_id=note.user_id,
        title=note.title,
        content=note.content,
        subject=note.subject,
        tags=note.tags or [],
        is_pinned=note.is_pinned,
        is_favorite=note.is_favorite,
        learning_path_id=note.learning_path_id,
        module_id=note.module_id,
        created_at=note.created_at,
        updated_at=note.updated_at,
        learning_path_title=p_title,
    )


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Retrieves a single note."""
    stmt = (
        select(Note, LearningPath.title.label("path_title"), Module.title.label("mod_title"))
        .outerjoin(LearningPath, Note.learning_path_id == LearningPath.id)
        .outerjoin(Module, Note.module_id == Module.id)
        .where(Note.id == note_id, Note.user_id == current_user.id)
    )
    row = db.execute(stmt).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anotação não encontrada.",
        )
    note, p_title, m_title = row

    return NoteResponse(
        id=note.id,
        user_id=note.user_id,
        title=note.title,
        content=note.content,
        subject=note.subject,
        tags=note.tags or [],
        is_pinned=note.is_pinned,
        is_favorite=note.is_favorite,
        learning_path_id=note.learning_path_id,
        module_id=note.module_id,
        created_at=note.created_at,
        updated_at=note.updated_at,
        learning_path_title=p_title,
        module_title=m_title,
    )


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: str,
    note_in: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Updates a note."""
    stmt = select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    note = db.execute(stmt).scalars().first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anotação não encontrada.",
        )

    if note_in.title is not None:
        note.title = note_in.title.strip()
    if note_in.content is not None:
        note.content = note_in.content
    if note_in.subject is not None:
        note.subject = note_in.subject.strip()
    if note_in.tags is not None:
        note.tags = note_in.tags
    if note_in.is_pinned is not None:
        note.is_pinned = note_in.is_pinned
    if note_in.is_favorite is not None:
        note.is_favorite = note_in.is_favorite
    if note_in.learning_path_id is not None:
        note.learning_path_id = note_in.learning_path_id
    if note_in.module_id is not None:
        note.module_id = note_in.module_id

    db.add(note)
    db.commit()
    db.refresh(note)

    p_title = None
    if note.learning_path_id:
        p_title = db.scalar(select(LearningPath.title).where(LearningPath.id == note.learning_path_id))

    return NoteResponse(
        id=note.id,
        user_id=note.user_id,
        title=note.title,
        content=note.content,
        subject=note.subject,
        tags=note.tags or [],
        is_pinned=note.is_pinned,
        is_favorite=note.is_favorite,
        learning_path_id=note.learning_path_id,
        module_id=note.module_id,
        created_at=note.created_at,
        updated_at=note.updated_at,
        learning_path_title=p_title,
    )


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Deletes a note."""
    stmt = select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    note = db.execute(stmt).scalars().first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anotação não encontrada.",
        )

    db.delete(note)
    db.commit()
    return None
