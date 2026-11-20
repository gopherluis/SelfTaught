from typing import Any, Dict, Optional
from sqlalchemy.orm import Session
from app.models.activity import StudyActivity


def record_activity(
    db: Session,
    user_id: str,
    activity_type: str,
    learning_path_id: Optional[str] = None,
    metadata_json: Optional[Dict[str, Any]] = None,
) -> StudyActivity:
    """Records a study or progress action taken by the user."""
    activity = StudyActivity(
        user_id=user_id,
        learning_path_id=learning_path_id,
        activity_type=activity_type,
        metadata_json=metadata_json or {},
    )
    db.add(activity)
    db.flush()
    return activity
