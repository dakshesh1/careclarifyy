from app.search import router as search_router
from app.compare import router as compare_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# Application metadata for the FastAPI service.
APP_TITLE = "CareClarify API"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = (
    "This backend powers hospital bill analysis, prescription decoding, "
    "medicine comparison, and AI explanations."
)


# Create the FastAPI application instance.
# This keeps the entrypoint clean and makes it easy to later register routers
# with app.include_router(...).
app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
)


# Enable CORS for local development and testing.
# This configuration allows all origins, methods, headers, and credentials.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(search_router)
app.include_router(compare_router)

# Root endpoint for basic service discovery.
@app.get("/")
def read_root() -> dict:
    return {
        "message": "Welcome to CareClarify API",
        "status": "running",
        "version": APP_VERSION,
    }


# Health check endpoint for deployment and monitoring.
@app.get("/health")
def health_check() -> dict:
    return {
        "status": "healthy",
        "database": "checking...",
    }
