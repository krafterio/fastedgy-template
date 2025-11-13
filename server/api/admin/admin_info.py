from fastapi import APIRouter, Depends
from fastedgy.depends.security import get_current_user
from pydantic import BaseModel

from models.user import User, UserRole


router = APIRouter(prefix="/info")


class AdminInfo(BaseModel):
    success: bool
    type: UserRole


@router.get("")
async def get_admin_info(
    current_user: User = Depends(get_current_user),
) -> AdminInfo:
    return AdminInfo(
        success=current_user.role == UserRole.admin,
        type=current_user.role if current_user.role else UserRole.user,
    )
