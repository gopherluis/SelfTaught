import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def generate_uuid() -> str:
    return uuid.uuid4().hex


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    learning_path_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("learning_paths.id", ondelete="SET NULL"), index=True, nullable=True)
    module_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("modules.id", ondelete="SET NULL"), index=True, nullable=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resource_type: Mapped[str] = mapped_column(String(50), default="article", index=True, nullable=False)  # article, book, video, course, doc, tool, other
    is_reviewed: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="resources")
    learning_path: Mapped[Optional["LearningPath"]] = relationship("LearningPath", back_populates="resources")
    module: Mapped[Optional["Module"]] = relationship("Module", back_populates="resources")
