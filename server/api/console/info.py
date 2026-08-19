from fastapi import APIRouter, Depends
from fastedgy.depends.security import get_current_user
from models.user import User, UserRole
from pydantic import BaseModel

router = APIRouter(prefix="/info")


class ConsoleInfo(BaseModel):
    success: bool
    type: UserRole


@router.get("")
async def get_console_info(
    current_user: User = Depends(get_current_user),
) -> ConsoleInfo:
    return ConsoleInfo(
        success=current_user.role == UserRole.admin,
        type=current_user.role if current_user.role else UserRole.user,
    )
