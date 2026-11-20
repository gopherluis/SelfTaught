from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: str = Field(default="medium")  # low, medium, high, urgent
    status: str = Field(default="todo")      # todo, in_progress, completed, cancelled
    due_date: Optional[datetime] = None
    estimated_minutes: Optional[int] = Field(None, ge=0)
    actual_minutes: Optional[int] = Field(None, ge=0)
    learning_path_id: Optional[str] = None
    module_id: Optional[str] = None
    parent_task_id: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_minutes: Optional[int] = Field(None, ge=0)
    actual_minutes: Optional[int] = Field(None, ge=0)
    completed_at: Optional[datetime] = None
    learning_path_id: Optional[str] = None
    module_id: Optional[str] = None
    parent_task_id: Optional[str] = None


class SubtaskResponse(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TaskResponse(TaskBase):
    id: str
    user_id: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    learning_path_title: Optional[str] = None
    module_title: Optional[str] = None
    subtasks: List[SubtaskResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
