from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.path import LearningPathResponse
from app.schemas.task import TaskResponse


class ActivityItem(BaseModel):
    id: str
    activity_type: str
    learning_path_id: Optional[str] = None
    learning_path_title: Optional[str] = None
    metadata_json: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardStatsResponse(BaseModel):
    active_paths_count: int
    completed_paths_count: int
    total_paths_count: int

    tasks_todo_count: int
    tasks_in_progress_count: int
    tasks_completed_count: int
    tasks_overdue_count: int
    
    notes_count: int
    resources_count: int
    resources_reviewed_count: int

    overall_progress_percentage: float
    study_streak_days: int

    active_paths: List[LearningPathResponse]
    upcoming_tasks: List[TaskResponse]
    recent_activities: List[ActivityItem]
