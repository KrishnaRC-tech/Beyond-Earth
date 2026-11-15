
import math

NASA_THEMIS_DAY = {
    "name": "THEMIS Daytime Infrared",
    "layer_id": "THEMIS_DayIR_ControlledMosaics_100m_v2_oct2018",
    "base_url": (
        "https://trek.nasa.gov/tiles/Mars/EQ/"
        "THEMIS_DayIR_ControlledMosaics_100m_v2_oct2018/"
        "1.0.0//default/default028mm"
    ),
    "coverage": "Approximately 65 degrees north to 65 degrees south",
    "format": "image/png",
    "max_zoom": 9,
}

NASA_THEMIS_NIGHT = {
    "name": "THEMIS Nighttime Infrared",
    "layer_id": "THEMIS_NightIR_ControlledMosaics_100m_v2_oct2018",
    "base_url": (
        "https://trek.nasa.gov/tiles/Mars/EQ/"
        "THEMIS_NightIR_ControlledMosaics_100m_v2_oct2018/"
        "1.0.0//default/default028mm"
    ),
    "coverage": "Approximately 65 degrees north to 65 degrees south",
    "format": "image/png",
    "max_zoom": 9,
}

NASA_WMTS_LAYERS = {
    "themis_day": NASA_THEMIS_DAY,
    "themis_night": NASA_THEMIS_NIGHT,

    "mola_hillshade": {
        "name": "MOLA Global Hillshade",
        "layer_id": "Mars_MGS_MOLA_ClrShade_merge_global_463m",
        "coverage": "Global Mars",
    },
}


def get_wmts_layer(layer_key):
    if layer_key not in NASA_WMTS_LAYERS:
        raise ValueError("Unknown imagery layer")

    layer = NASA_WMTS_LAYERS[layer_key]

    return {
        "name": layer["name"],
        "layer_key": layer_key,
        "source": "NASA Mars Trek WMTS",
        "coverage": layer["coverage"],
        "layer_id": layer["layer_id"],
    }


def get_themis_day_tile_coordinates(latitude, longitude, zoom=5):
    if not -65 <= latitude <= 65:
        raise ValueError(
            "THEMIS daytime coverage is approximately 65 degrees north to south."
        )

    if not -180 <= longitude <= 180:
        raise ValueError("Longitude must be between -180 and 180.")

    if not 0 <= zoom <= 9:
        raise ValueError("Zoom level must be between 0 and 9.")

    matrix_width = 2 * (2 ** zoom)
    matrix_height = 2 ** zoom

    column = math.floor((longitude + 180) / 360 * matrix_width)
    row = math.floor((90 - latitude) / 180 * matrix_height)

    column = min(column, matrix_width - 1)
    row = min(row, matrix_height - 1)

    return {
        "zoom": zoom,
        "row": row,
        "column": column,
        "latitude": latitude,
        "longitude": longitude,
    }


def get_themis_day_tile_url(latitude, longitude, zoom=5):
    tile = get_themis_day_tile_coordinates(
        latitude,
        longitude,
        zoom,
    )

    url = (
        f"{NASA_THEMIS_DAY['base_url']}/"
        f"{tile['zoom']}/{tile['row']}/{tile['column']}.png"
    )

    return {
        **tile,
        "tile_url": url,
        "source": "NASA THEMIS Daytime Infrared",
    }
