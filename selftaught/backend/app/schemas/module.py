from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ModuleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    objectives: List[str] = Field(default_factory=list)
    order_index: int = 0
    status: str = Field(default="planned")  # planned, in_progress, completed


class ModuleCreate(ModuleBase):
    pass


class ModuleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    objectives: Optional[List[str]] = None
    order_index: Optional[int] = None
    status: Optional[str] = None


class ModuleResponse(ModuleBase):
    id: str
    learning_path_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
