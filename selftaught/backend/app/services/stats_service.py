from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.activity import StudyActivity
from app.models.module import Module
from app.models.note import Note
from app.models.path import LearningPath
from app.models.resource import Resource
from app.models.task import Task
from app.schemas.dashboard import ActivityItem, DashboardStatsResponse
from app.schemas.path import LearningPathResponse
from app.schemas.task import TaskResponse


def compute_path_progress(
    db: Session,
    path: LearningPath,
) -> Dict[str, Any]:
    """Calculates completion stats and percentage for a given learning path."""
    # Module counts
    mod_stmt = select(
        func.count(Module.id).label("total"),
        func.count().filter(Module.status == "completed").label("completed"),
    ).where(Module.learning_path_id == path.id)
    total_mods, completed_mods = db.execute(mod_stmt).first() or (0, 0)

    # Task counts
    task_stmt = select(
        func.count(Task.id).label("total"),
        func.count().filter(Task.status == "completed").label("completed"),
    ).where(Task.learning_path_id == path.id)
    total_tasks, completed_tasks = db.execute(task_stmt).first() or (0, 0)

    # Calculate overall progress percentage
    progress = 0.0
    if total_tasks > 0 and total_mods > 0:
        task_perc = (completed_tasks / total_tasks) * 100.0
        mod_perc = (completed_mods / total_mods) * 100.0
        progress = round((task_perc * 0.6) + (mod_perc * 0.4), 1)
    elif total_tasks > 0:
        progress = round((completed_tasks / total_tasks) * 100.0, 1)
    elif total_mods > 0:
        progress = round((completed_mods / total_mods) * 100.0, 1)
    elif path.status == "completed":
        progress = 100.0

    return {
        "progress_percentage": min(100.0, max(0.0, progress)),
        "modules_count": total_mods or 0,
        "completed_modules_count": completed_mods or 0,
        "tasks_count": total_tasks or 0,
        "completed_tasks_count": completed_tasks or 0,
    }


def get_dashboard_stats(
    db: Session,
    user_id: str,
) -> DashboardStatsResponse:
    """Aggregates user study statistics for the dashboard."""
    now = datetime.now(timezone.utc)

    # Paths query
    paths_stmt = select(LearningPath).where(LearningPath.user_id == user_id)
    all_paths = db.execute(paths_stmt).scalars().all()

    active_paths_list: List[LearningPathResponse] = []
    completed_paths_count = 0
    active_paths_count = 0
    total_progress_sum = 0.0

    for path in all_paths:
        if path.status == "completed":
            completed_paths_count += 1
        elif path.status == "active":
            active_paths_count += 1

        stats = compute_path_progress(db, path)
        total_progress_sum += stats["progress_percentage"]

        path_resp = LearningPathResponse(
            id=path.id,
            user_id=path.user_id,
            title=path.title,
            description=path.description,
            category=path.category,
            objectives=path.objectives or [],
            status=path.status,
            start_date=path.start_date,
            target_date=path.target_date,
            completed_at=path.completed_at,
            color=path.color,
            icon=path.icon,
            created_at=path.created_at,
            updated_at=path.updated_at,
            progress_percentage=stats["progress_percentage"],
            modules_count=stats["modules_count"],
            completed_modules_count=stats["completed_modules_count"],
            tasks_count=stats["tasks_count"],
            completed_tasks_count=stats["completed_tasks_count"],
        )
        if path.status == "active":
            active_paths_list.append(path_resp)

    overall_progress = 0.0
    if len(all_paths) > 0:
        overall_progress = round(total_progress_sum / len(all_paths), 1)

    # Tasks stats
    tasks_todo = (
        db.scalar(
            select(func.count(Task.id)).where(Task.user_id == user_id, Task.status == "todo")
        )
        or 0
    )
    tasks_in_progress = (
        db.scalar(
            select(func.count(Task.id)).where(Task.user_id == user_id, Task.status == "in_progress")
        )
        or 0
    )
    tasks_completed = (
        db.scalar(
            select(func.count(Task.id)).where(Task.user_id == user_id, Task.status == "completed")
        )
        or 0
    )
    tasks_overdue = (
        db.scalar(
            select(func.count(Task.id)).where(
                Task.user_id == user_id,
                Task.status.in_(["todo", "in_progress"]),
                Task.due_date < now,
            )
        )
        or 0
    )

    # Upcoming tasks (ordered by due_date)
    upcoming_stmt = (
        select(Task)
        .where(Task.user_id == user_id, Task.status.in_(["todo", "in_progress"]))
        .order_by(Task.due_date.asc().nulls_last(), Task.priority.desc())
        .limit(6)
    )
    upcoming_tasks_raw = db.execute(upcoming_stmt).scalars().all()
    upcoming_tasks = [TaskResponse.model_validate(t) for t in upcoming_tasks_raw]

    # Notes count
    notes_count = (
        db.scalar(select(func.count(Note.id)).where(Note.user_id == user_id)) or 0
    )

    # Resources count
    res_count = (
        db.scalar(select(func.count(Resource.id)).where(Resource.user_id == user_id)) or 0
    )
    res_reviewed = (
        db.scalar(
            select(func.count(Resource.id)).where(Resource.user_id == user_id, Resource.is_reviewed.is_(True))
        )
        or 0
    )

    # Recent activities
    act_stmt = (
        select(StudyActivity, LearningPath.title.label("path_title"))
        .outerjoin(LearningPath, StudyActivity.learning_path_id == LearningPath.id)
        .where(StudyActivity.user_id == user_id)
        .order_by(StudyActivity.created_at.desc())
        .limit(10)
    )
    recent_activities: List[ActivityItem] = []
    for act, p_title in db.execute(act_stmt).all():
        recent_activities.append(
            ActivityItem(
                id=act.id,
                activity_type=act.activity_type,
                learning_path_id=act.learning_path_id,
                learning_path_title=p_title,
                metadata_json=act.metadata_json or {},
                created_at=act.created_at,
            )
        )

    # Study streak (number of distinct recent active days)
    streak_stmt = (
        select(func.date(StudyActivity.created_at))
        .where(StudyActivity.user_id == user_id)
        .group_by(func.date(StudyActivity.created_at))
        .order_by(func.date(StudyActivity.created_at).desc())
        .limit(7)
    )
    study_streak_days = len(db.execute(streak_stmt).scalars().all())

    return DashboardStatsResponse(
        active_paths_count=active_paths_count,
        completed_paths_count=completed_paths_count,
        total_paths_count=len(all_paths),
        tasks_todo_count=tasks_todo,
        tasks_in_progress_count=tasks_in_progress,
        tasks_completed_count=tasks_completed,
        tasks_overdue_count=tasks_overdue,
        notes_count=notes_count,
        resources_count=res_count,
        resources_reviewed_count=res_reviewed,
        overall_progress_percentage=overall_progress,
        study_streak_days=max(1, study_streak_days) if len(all_paths) > 0 else 0,
        active_paths=active_paths_list[:5],
        upcoming_tasks=upcoming_tasks,
        recent_activities=recent_activities,
    )
