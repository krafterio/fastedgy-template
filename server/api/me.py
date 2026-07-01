from fastapi import APIRouter, Depends
from fastedgy.depends.security import get_current_user
from fastedgy.orm import transaction

from models.user import User
from schemas.user import Me, MeUpdate

router = APIRouter(prefix="/me", tags=["my_account"])


@router.get("")
async def read_users_me(current_user: User = Depends(get_current_user)) -> Me:
    return Me.model_validate(current_user, from_attributes=True)


@router.patch("")
@transaction
async def update_users_me(
    user_data: MeUpdate,
    current_user: User = Depends(get_current_user),
) -> Me:
    if user_data.name:
        current_user.name = user_data.name

    if user_data.email:
        current_user.name = user_data.email

    if user_data.avatar:
        current_user.avatar = user_data.avatar

    await current_user.save()

    return Me.model_validate(current_user, from_attributes=True)
