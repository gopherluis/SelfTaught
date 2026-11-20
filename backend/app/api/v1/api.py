from fastapi import APIRouter
from app.api.v1.endpoints import auth, dashboard, modules, notes, paths, resources, tasks

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
api_router.include_router(paths.router, prefix="/paths", tags=["Trilhas de Aprendizagem"])
api_router.include_router(modules.router, prefix="/modules", tags=["Módulos"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tarefas"])
api_router.include_router(notes.router, prefix="/notes", tags=["Base de Conhecimento"])
api_router.include_router(resources.router, prefix="/resources", tags=["Recursos de Aprendizagem"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard & Progresso"])
