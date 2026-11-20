from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(default="")
    subject: str = Field(default="General", max_length=100)
    tags: List[str] = Field(default_factory=list)
    is_pinned: bool = False
    is_favorite: bool = False
    learning_path_id: Optional[str] = None
    module_id: Optional[str] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    subject: Optional[str] = None
    tags: Optional[List[str]] = None
    is_pinned: Optional[bool] = None
    is_favorite: Optional[bool] = None
    learning_path_id: Optional[str] = None
    module_id: Optional[str] = None


class NoteResponse(NoteBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    learning_path_title: Optional[str] = None
    module_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
