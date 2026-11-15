import numpy as np
from pathlib import Path
from functools import lru_cache

DATA_FOLDER = Path(__file__).parent.parent / "data"

IMAGE_FILE = DATA_FOLDER / "megt90n000gb.img"

ROWS = 5760
COLUMNS = 11520
PIXELS_PER_DEGREE = 64

# Process the raster in smaller blocks when calculating global statistics.
# This avoids loading the entire elevation dataset into extra memory.
STATISTICS_CHUNK_ROWS = 256


def get_elevation(latitude, longitude):

    if not 0 <= latitude <= 90:
        raise ValueError("Latitude must be between 0 and 90")

    if not 0 <= longitude <= 180:
        raise ValueError("Longitude must be between 0 and 180")

    if not IMAGE_FILE.exists():
        raise FileNotFoundError(f"MOLA data file not found: {IMAGE_FILE}")

    # Read NASA MOLA binary data
    elevation_map = np.memmap(
        IMAGE_FILE,
        dtype=">i2",
        mode="r",
        shape=(ROWS, COLUMNS)
    )

    row = int((90 - latitude) * PIXELS_PER_DEGREE)
    column = int(longitude * PIXELS_PER_DEGREE)

    row = min(row, ROWS - 1)
    column = min(column, COLUMNS - 1)

    elevation = int(elevation_map[row, column])

    return {
        "latitude": latitude,
        "longitude": longitude,
        "elevation_meters": elevation,
        "source": "NASA MOLA"
    }


@lru_cache(maxsize=1)
def get_elevation_statistics():
    """
    Calculate full-raster MOLA statistics once per backend process.
    The cached result is reused for later API requests.
    """

    if not IMAGE_FILE.exists():
        raise FileNotFoundError(f"MOLA data file not found: {IMAGE_FILE}")

    elevation_map = np.memmap(
        IMAGE_FILE,
        dtype=">i2",
        mode="r",
        shape=(ROWS, COLUMNS)
    )

    highest = None
    lowest = None
    total = 0
    valid_count = 0

    # Scan the raster in chunks to keep memory usage low.
    for start_row in range(0, ROWS, STATISTICS_CHUNK_ROWS):
        end_row = min(start_row + STATISTICS_CHUNK_ROWS, ROWS)

        chunk = elevation_map[start_row:end_row]
        valid_data = chunk[chunk != -32768]

        if valid_data.size == 0:
            continue

        chunk_highest = int(np.max(valid_data))
        chunk_lowest = int(np.min(valid_data))

        highest = (
            chunk_highest
            if highest is None
            else max(highest, chunk_highest)
        )

        lowest = (
            chunk_lowest
            if lowest is None
            else min(lowest, chunk_lowest)
        )

        total += int(np.sum(valid_data, dtype=np.int64))
        valid_count += int(valid_data.size)

    if valid_count == 0:
        raise ValueError("No valid MOLA elevation data found")

    return {
        "highest_elevation_meters": highest,
        "lowest_elevation_meters": lowest,
        "average_elevation_meters": round(total / valid_count, 2),
        "source": "NASA MOLA"
    }
