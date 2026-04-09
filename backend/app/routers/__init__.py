from app.routers.auth import router as auth_router
from app.routers.banquets import router as banquets_router
from app.routers.records import router as records_router
from app.routers.presets import router as presets_router

__all__ = ["auth_router", "banquets_router", "records_router", "presets_router"]
