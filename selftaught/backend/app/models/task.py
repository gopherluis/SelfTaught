import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def generate_uuid() -> str:
    return uuid.uuid4().hex


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    learning_path_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("learning_paths.id", ondelete="SET NULL"), index=True, nullable=True)
    module_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("modules.id", ondelete="SET NULL"), index=True, nullable=True)
    parent_task_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), index=True, nullable=True)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(50), default="medium", index=True, nullable=False)  # low, medium, high, urgent
    status: Mapped[str] = mapped_column(String(50), default="todo", index=True, nullable=False)      # todo, in_progress, completed, cancelled
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    estimated_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    actual_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="tasks")
    learning_path: Mapped[Optional["LearningPath"]] = relationship("LearningPath", back_populates="tasks")
    module: Mapped[Optional["Module"]] = relationship("Module", back_populates="tasks")
    parent_task: Mapped[Optional["Task"]] = relationship("Task", remote_side=[id], back_populates="subtasks")
    subtasks: Mapped[List["Task"]] = relationship("Task", back_populates="parent_task", cascade="all, delete-orphan")
