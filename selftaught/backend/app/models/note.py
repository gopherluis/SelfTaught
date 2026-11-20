import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def generate_uuid() -> str:
    return uuid.uuid4().hex


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    learning_path_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("learning_paths.id", ondelete="SET NULL"), index=True, nullable=True)
    module_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("modules.id", ondelete="SET NULL"), index=True, nullable=True)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, default="", nullable=False)
    subject: Mapped[str] = mapped_column(String(100), default="General", index=True, nullable=False)
    tags: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notes")
    learning_path: Mapped[Optional["LearningPath"]] = relationship("LearningPath", back_populates="notes")
    module: Mapped[Optional["Module"]] = relationship("Module", back_populates="notes")
