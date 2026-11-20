import pytest
from sqlalchemy.orm import Session
from app.api.v1.endpoints import resources
from app.models.user import User
from app.schemas.resource import ResourceCreate, ResourceUpdate


def test_resources_lifecycle_and_rating(db_session: Session, test_user: User):
    # 1. Add resource
    res_in = ResourceCreate(
        title="Rust Book — The Rust Programming Language",
        url="https://doc.rust-lang.org/book/",
        description="Livro oficial para aprendizado da linguagem Rust.",
        resource_type="book",
        is_reviewed=False,
    )
    created = resources.create_resource(res_in=res_in, current_user=test_user, db=db_session)
    assert created.title == "Rust Book — The Rust Programming Language"
    assert created.is_reviewed is False

    # 2. Mark as reviewed and give rating
    updated = resources.update_resource(
        resource_id=created.id,
        res_in=ResourceUpdate(is_reviewed=True, rating=5),
        current_user=test_user,
        db=db_session,
    )
    assert updated.is_reviewed is True
    assert updated.rating == 5

    # 3. Filter by resource type
    books = resources.list_resources(resource_type="book", current_user=test_user, db=db_session)
    assert any(b.id == created.id for b in books)
