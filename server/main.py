from typing import cast

# Imported for their side effect: these modules register the models and the
# signals on load. Ruff sees them as unused, they are not.
import models  # noqa: F401
import signals  # noqa: F401
from fastedgy.config import BaseSettings


class AppSettings(BaseSettings):
    title: str = "FastEdgy"
    available_locales: list[str] = ["fr"]
    fallback_locale: str = "fr"
    api_docs: bool = True


def app():
    from api import hello
    from depends.security import (
        get_app_context,
        is_admin,
    )
    from fastapi import APIRouter, Depends
    from fastapi.middleware.cors import CORSMiddleware
    from fastedgy.api import auth, auth_simple_registration, dataset, health, storage
    from fastedgy.api_route_model.router import (
        register_api_route_models,
        register_console_api_route_models,
    )
    from fastedgy.api_route_model.standard_actions import (
        register_standard_api_route_model_actions,
    )
    from fastedgy.app import FastEdgy
    from fastedgy.config import init_settings
    from fastedgy.depends.security import get_current_user

    settings = cast(AppSettings, init_settings())
    app = FastEdgy(
        description="Backend API of FastEdgy",
        version="0.1.0",
        include_in_schema=settings.api_docs,
    )

    # Middlewares
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Base routes
    public_router = APIRouter(prefix="/api")
    console_router = APIRouter(
        prefix="/api/console",
        tags=["console"],
        dependencies=[
            Depends(get_current_user),
            is_admin(),
        ],
    )
    router = APIRouter(
        prefix="/api",
        dependencies=[
            Depends(get_current_user),
            Depends(get_app_context),
        ],
    )

    # API imports
    from api import me
    from api.console import info as console_info
    from api.console import user as console_user

    # Public routes
    public_router.include_router(auth_simple_registration.router)
    public_router.include_router(auth.public_router)
    public_router.include_router(hello.router)

    # Authenticated routes
    router.include_router(auth.router)
    router.include_router(dataset.router)
    router.include_router(health.router)
    router.include_router(me.router)
    router.include_router(storage.attachments_router)
    router.include_router(storage.manage_attachments_router)
    router.include_router(storage.router)
    router.include_router(storage.manage_router)

    # Console routes
    console_router.include_router(console_info.router)
    console_router.include_router(console_user.router)

    # Generated API models routes
    register_standard_api_route_model_actions()
    register_console_api_route_models(console_router)
    register_api_route_models(router)

    # Apply routes
    app.include_router(public_router)
    app.include_router(console_router)
    app.include_router(router)

    return app
