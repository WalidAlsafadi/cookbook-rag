import pathlib
import sys

BACKEND_ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from fastapi.testclient import TestClient
from app.main import app


def test_import_main():
    """
    تأكد إن app.main ينستورد وإن كائن FastAPI موجود.
    """
    assert app is not None


def test_health_endpoint():
    """
    تأكد إن /health شغّال وبيرجع status = ok
    """
    client = TestClient(app)
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"
