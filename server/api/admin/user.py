from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Body
from fastedgy.api_route_model.action import (
    generate_output_model,
)
from fastedgy.api_route_model.actions.create_action import create_item_action
from fastedgy.api_route_model.params import FieldSelectorHeader
from fastedgy.http import Request
from pydantic import BaseModel, EmailStr

from fastedgy.depends.security import hash_password
from models.user import User, UserRole

router = APIRouter(prefix="/users", tags=["admin"])


class UserCreateRequest(BaseModel):
    name: str | None = None
    email: EmailStr
    role: UserRole = UserRole.user
    password: str | None = None


@router.post("")
async def create_item(
    request: Request,
    item_data: UserCreateRequest = Body(...),
    fields: str | None = FieldSelectorHeader(),  # type: ignore
) -> generate_output_model(User) | dict[str, Any]:  # type: ignore
    item_data.password = hash_password(item_data.password or str(uuid4()))

    return await create_item_action(
        request,
        User,
        item_data,
        fields=fields,
    )
