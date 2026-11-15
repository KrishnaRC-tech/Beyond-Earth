
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

DATA_FOLDER = Path(__file__).parent.parent / "data"
IMAGE_FILE = DATA_FOLDER / "megt90n000gb.img"

OUTPUT_FOLDER = Path(__file__).parent.parent / "output"
OUTPUT_FOLDER.mkdir(exist_ok=True)

# Approximate Jezero Crater center
CENTER_LATITUDE = 18.4
CENTER_LONGITUDE = 77.5

PIXELS_PER_DEGREE = 64
WINDOW_DEGREES = 4


def generate_mars_terrain():

    print("Loading NASA MOLA elevation data...")

    elevation = np.memmap(
        IMAGE_FILE,
        dtype=">i2",
        mode="r",
        shape=(5760, 11520)
    )

    center_row = int(
        (90 - CENTER_LATITUDE) * PIXELS_PER_DEGREE
    )

    center_column = int(
        CENTER_LONGITUDE * PIXELS_PER_DEGREE
    )

    half_window = int(
        WINDOW_DEGREES * PIXELS_PER_DEGREE / 2
    )

    row_start = center_row - half_window
    row_end = center_row + half_window

    col_start = center_column - half_window
    col_end = center_column + half_window

    terrain = np.array(
        elevation[row_start:row_end, col_start:col_end]
    )

    latitude_min = CENTER_LATITUDE - WINDOW_DEGREES / 2
    latitude_max = CENTER_LATITUDE + WINDOW_DEGREES / 2

    longitude_min = CENTER_LONGITUDE - WINDOW_DEGREES / 2
    longitude_max = CENTER_LONGITUDE + WINDOW_DEGREES / 2

    plt.figure(figsize=(10, 8))

    image = plt.imshow(
        terrain,
        cmap="terrain",
        origin="upper",
        extent=[
            longitude_min,
            longitude_max,
            latitude_min,
            latitude_max
        ],
        aspect="auto"
    )

    plt.colorbar(image, label="Elevation (meters)")

    plt.title("Jezero Crater Region - NASA MOLA")
    plt.xlabel("Longitude (degrees)")
    plt.ylabel("Latitude (degrees)")

    output_file = OUTPUT_FOLDER / "mars_terrain.png"

    plt.savefig(
        output_file,
        dpi=150,
        bbox_inches="tight"
    )

    plt.close()

    print("Jezero terrain image generated!")
    print("Saved at:", output_file)


if __name__ == "__main__":
    generate_mars_terrain()
