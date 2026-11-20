import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def generate_uuid() -> str:
    return uuid.uuid4().hex


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class StudyActivity(Base):
    __tablename__ = "study_activities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    learning_path_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("learning_paths.id", ondelete="CASCADE"), index=True, nullable=True)
    activity_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # path_created, task_completed, note_created, resource_reviewed
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="activities")
    learning_path: Mapped[Optional["LearningPath"]] = relationship("LearningPath", back_populates="activities")
