
THEMIS_LAYERS = {
    "daytime": {
        "name": "THEMIS Daytime Infrared",
        "instrument": "THEMIS",
        "spacecraft": "Mars Odyssey",
        "layer_id": "Mars_MO_THEMIS-IR-Day_mosaic_global_100m_v12_clon0_ly",
        "resolution": "100 metres per pixel",
        "coverage": "Global Mars",
        "capabilities_url": (
            "https://api.nasa.gov/mars-wmts/catalog/"
            "Mars_MO_THEMIS-IR-Day_mosaic_global_100m_v12_clon0_ly/"
            "1.0.0/WMTSCapabilities.xml"
        )
    },
    "nighttime": {
        "name": "THEMIS Nighttime Infrared",
        "instrument": "THEMIS",
        "spacecraft": "Mars Odyssey",
        "layer_id": "Mars_MO_THEMIS-IR-Night_mosaic_60N60S_100m_v14_clon0_ly",
        "resolution": "100 metres per pixel",
        "coverage": "60 degrees north to 60 degrees south",
        "capabilities_url": (
            "https://api.nasa.gov/mars-wmts/catalog/"
            "Mars_MO_THEMIS-IR-Night_mosaic_60N60S_100m_v14_clon0_ly/"
            "1.0.0/WMTSCapabilities.xml"
        )
    }
}


def get_themis_layers():
    return {
        "instrument": "THEMIS",
        "spacecraft": "Mars Odyssey",
        "source": "NASA Mars Trek",
        "data_type": "Thermal infrared imagery",
        "layers": THEMIS_LAYERS,
        "documentation": (
            "https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars"
        )
    }
