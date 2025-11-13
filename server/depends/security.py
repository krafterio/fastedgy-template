from fastapi import Depends, HTTPException, status, Request
from fastedgy.depends.security import get_current_user
from fastedgy.i18n import _t

from models.user import User, UserRole


def _check_admin_permission(user: User):
    """Check if user has admin permission."""
    if user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=_t("Access is not allowed"),
        )


def _check_user_permission(user: User):
    """Check if user has user permission."""
    if user.role not in [UserRole.user, UserRole.admin]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=_t("Access is not allowed"),
        )


def is_admin():
    def dependency(user: User = Depends(get_current_user)):
        _check_admin_permission(user)

    return Depends(dependency)


def is_app_user():
    def dependency(user: User = Depends(get_current_user)):
        _check_user_permission(user)

    return Depends(dependency)


async def get_app_context(
    request: Request,
    user: User = Depends(get_current_user),
) -> str | None:
    """
    Dependency that validates the {app} path parameter if present in the route.
    Enforces appropriate permissions based on app context (admin, app).
    Returns 404 if app value is not valid.
    """
    # Get path parameters from the request
    path_params = request.path_params
    app = path_params.get("app")

    # If no {app} in the route, skip validation
    if not app:
        return None

    if app == "admin":
        _check_admin_permission(user)
    elif app == "app":
        _check_user_permission(user)
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=_t("App context not found"),
        )

    return app


__all__ = [
    "is_admin",
    "is_app_user",
    "get_app_context",
]
