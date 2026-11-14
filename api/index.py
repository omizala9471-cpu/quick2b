import sys
import os

# Add root directory to python path for Vercel serverless environment
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.main import app as fastapi_app

class VercelFastAPIMiddleware:
    """
    Normalizes paths between Vercel Serverless Function rewrites and FastAPI routes.
    Ensures that whether Vercel rewrites to /api/index.py or strips /api,
    FastAPI receives the correct /api/... path.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            headers = dict(scope.get("headers", []))
            
            # Check for Vercel matched path header
            x_matched = headers.get(b"x-matched-path", b"").decode("utf-8")
            if x_matched and x_matched.startswith("/api/"):
                scope["path"] = x_matched
            elif path in ("/api/index.py", "/api", "/api/"):
                scope["path"] = "/api/health"
            elif not scope["path"].startswith("/api"):
                scope["path"] = f"/api{scope['path']}"
                
        await self.app(scope, receive, send)

app = VercelFastAPIMiddleware(fastapi_app)
