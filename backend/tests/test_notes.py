import pytest
from sqlalchemy.orm import Session
from app.api.v1.endpoints import notes
from app.models.user import User
from app.schemas.note import NoteCreate, NoteUpdate


def test_notes_crud_and_markdown(db_session: Session, test_user: User):
    markdown_content = """# Algoritmos de Ordenação

O **Quicksort** é um algoritmo eficiente baseado em divisão e conquista:
- Pior caso: O(n²)
- Caso médio: O(n log n)
"""
    note_in = NoteCreate(
        title="Quicksort e Complexidade",
        content=markdown_content,
        subject="Ciência da Computação",
        tags=["algoritmos", "ordenacao", "complexidade"],
        is_pinned=True,
        is_favorite=True,
    )
    created = notes.create_note(note_in=note_in, current_user=test_user, db=db_session)
    assert created.title == "Quicksort e Complexidade"
    assert created.is_pinned is True
    assert len(created.tags) == 3

    # Filter by tag
    tagged = notes.list_notes(tag="algoritmos", current_user=test_user, db=db_session)
    assert len(tagged) >= 1
    assert tagged[0].id == created.id

    # Filter by non-existent tag
    empty = notes.list_notes(tag="inexistente", current_user=test_user, db=db_session)
    assert len(empty) == 0

    # Search notes
    searched = notes.list_notes(search="divisão", current_user=test_user, db=db_session)
    assert len(searched) >= 1

    # Update note
    updated = notes.update_note(
        note_id=created.id,
        note_in=NoteUpdate(title="Quicksort — Notas de Estudo"),
        current_user=test_user,
        db=db_session,
    )
    assert updated.title == "Quicksort — Notas de Estudo"

    # Delete note
    notes.delete_note(note_id=created.id, current_user=test_user, db=db_session)
    remaining = notes.list_notes(current_user=test_user, db=db_session)
    assert not any(n.id == created.id for n in remaining)
