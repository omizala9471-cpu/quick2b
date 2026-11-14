import sys
import os
from urllib.parse import parse_qs

# Add root directory to python path for Vercel serverless environment
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.main import app as fastapi_app

class VercelFastAPIMiddleware:
    """
    Seamlessly unwraps the rewritten __path__ query param from Vercel rewrites
    so FastAPI routes match accurately.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            query_string = scope.get("query_string", b"").decode("utf-8")
            qs = parse_qs(query_string)
            if "__path__" in qs:
                scope["path"] = qs["__path__"][0]
            elif scope.get("path") in ("/api/index.py", "/api", "/api/"):
                scope["path"] = "/api/health"
        await self.app(scope, receive, send)

app = VercelFastAPIMiddleware(fastapi_app)
