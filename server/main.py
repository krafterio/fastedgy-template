from typing import cast

from fastapi import APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware

from fastedgy.app import FastEdgy
from fastedgy.api import auth, auth_simple_registration, dataset, health, storage
from fastedgy.api_route_model.router import (
    register_admin_api_route_models,
    register_api_route_models,
)
from fastedgy.api_route_model.standard_actions import (
    register_standard_api_route_model_actions,
)
from fastedgy.config import BaseSettings, init_settings
from fastedgy.depends.security import get_current_user

from depends.security import (
    is_admin,
    get_app_context,
)

import models as models
import signals as signals


class AppSettings(BaseSettings):
    title: str = "FastEdgy"
    available_locales: list[str] = ["fr"]
    fallback_locale: str = "fr"
    api_docs: bool = True


def app():
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
    admin_router = APIRouter(
        prefix="/api/admin",
        tags=["admin"],
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
    from api.admin import admin_info, user as admin_user

    # Public routes
    public_router.include_router(auth_simple_registration.router)
    public_router.include_router(auth.public_router)

    # Authenticated routes
    router.include_router(auth.router)
    router.include_router(dataset.router)
    router.include_router(health.router)
    router.include_router(me.router)
    router.include_router(storage.attachments_router)
    router.include_router(storage.manage_attachments_router)
    router.include_router(storage.router)
    router.include_router(storage.manage_router)

    # Admin routes
    admin_router.include_router(admin_info.router)
    admin_router.include_router(admin_user.router)

    # Generated API models routes
    register_standard_api_route_model_actions()
    register_admin_api_route_models(admin_router)
    register_api_route_models(router)

    # Apply routes
    app.include_router(public_router)
    app.include_router(admin_router)
    app.include_router(router)

    return app
