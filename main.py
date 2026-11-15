import gzip
import shutil
from pathlib import Path

# ---------------------------------------------------------------------------
# MOLA data file
# The raw file (127 MB) is too large for a normal GitHub upload, so the
# repository stores a compressed copy (data/megt90n000gb.img.gz).
# On startup, the file is unpacked if the .img does not exist yet.
# This must run BEFORE the routers below are imported, because they may
# open the data file when they load.
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
MOLA_IMG = BASE_DIR / "data" / "megt90n000gb.img"
MOLA_GZ = BASE_DIR / "data" / "megt90n000gb.img.gz"


def ensure_mola_file():
    if MOLA_IMG.exists():
        return

    if not MOLA_GZ.exists():
        print("WARNING: MOLA data file not found (no .img and no .img.gz).")
        return

    print("Unpacking MOLA data file...")
    partial = MOLA_IMG.with_suffix(".img.part")
    with gzip.open(MOLA_GZ, "rb") as source, open(partial, "wb") as target:
        shutil.copyfileobj(source, target, length=1024 * 1024)
    partial.replace(MOLA_IMG)
    print("MOLA data file ready.")


ensure_mola_file()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.terrain import router as terrain_router
from api.geology import router as geology_router
from api.themis import router as themis_router
from api.imagery import router as imagery_router
from api.wmts import router as wmts_router

app = FastAPI(title="Beyond Earth - Martian Map")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "project": "Beyond Earth",
        "status": "online"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "backend": "FastAPI"
    }


@app.get("/api/regions")
def regions():
    return {
        "regions": [
            {
                "id": 1,
                "name": "Jezero Crater",
                "planet": "Mars",
                "description": "Initial exploration region",
                "data_status": "awaiting_dataset"
            }
        ]
    }


# NASA MOLA elevation
app.include_router(terrain_router, prefix="/api")

# USGS geology
app.include_router(geology_router, prefix="/api")

# NASA THEMIS thermal imagery metadata
app.include_router(themis_router, prefix="/api")

# Mars imagery catalogue
app.include_router(imagery_router, prefix="/api")

# NASA WMTS tile service
app.include_router(wmts_router, prefix="/api")
