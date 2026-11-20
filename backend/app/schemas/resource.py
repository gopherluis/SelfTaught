from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ResourceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    url: str = Field(..., min_length=1, max_length=2048)
    description: Optional[str] = None
    resource_type: str = Field(default="article")  # article, book, video, course, doc, tool, other
    is_reviewed: bool = False
    rating: Optional[int] = Field(None, ge=1, le=5)
    learning_path_id: Optional[str] = None
    module_id: Optional[str] = None


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    url: Optional[str] = Field(None, min_length=1, max_length=2048)
    description: Optional[str] = None
    resource_type: Optional[str] = None
    is_reviewed: Optional[bool] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    learning_path_id: Optional[str] = None
    module_id: Optional[str] = None


class ResourceResponse(ResourceBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    learning_path_title: Optional[str] = None
    module_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
