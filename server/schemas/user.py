from pydantic import BaseModel


class UserBase(BaseModel):
    id: int | None = None
    name: str | None = None
    email: str | None = None
    avatar: str | None = None


class Me(UserBase):
    role: str | None = None


class MeUpdate(UserBase):
    pass
