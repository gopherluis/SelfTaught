import uuid
from datetime import date, datetime, timezone
from typing import Any, List, Optional
from sqlalchemy import JSON, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def generate_uuid() -> str:
    return uuid.uuid4().hex


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), default="programming", index=True, nullable=False)
    objectives: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", index=True, nullable=False)  # planned, active, completed, archived
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    color: Mapped[str] = mapped_column(String(50), default="blue", nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="BookOpen", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="paths")
    modules: Mapped[List["Module"]] = relationship("Module", back_populates="learning_path", cascade="all, delete-orphan", order_by="Module.order_index")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="learning_path", cascade="all, delete-orphan")
    notes: Mapped[List["Note"]] = relationship("Note", back_populates="learning_path", cascade="all, delete-orphan")
    resources: Mapped[List["Resource"]] = relationship("Resource", back_populates="learning_path", cascade="all, delete-orphan")
    activities: Mapped[List["StudyActivity"]] = relationship("StudyActivity", back_populates="learning_path", cascade="all, delete-orphan")
