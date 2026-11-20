from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.module import ModuleResponse


class LearningPathBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(default="programming", max_length=100)
    objectives: List[str] = Field(default_factory=list)
    status: str = Field(default="active")  # planned, active, completed, archived
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    color: str = Field(default="blue")
    icon: str = Field(default="BookOpen")


class LearningPathCreate(LearningPathBase):
    pass


class LearningPathUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    objectives: Optional[List[str]] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    completed_at: Optional[datetime] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class LearningPathResponse(LearningPathBase):
    id: str
    user_id: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    # Progress metrics calculated dynamically
    progress_percentage: float = 0.0
    modules_count: int = 0
    completed_modules_count: int = 0
    tasks_count: int = 0
    completed_tasks_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class LearningPathDetailResponse(LearningPathResponse):
    modules: List[ModuleResponse] = Field(default_factory=list)
