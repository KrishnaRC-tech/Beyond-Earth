
IMAGERY_LAYERS = [
    {
        "id": "mars_global_mola",
        "name": "Mars Global MOLA Hillshade",
        "instrument": "MOLA",
        "type": "Global terrain imagery",
        "layer_id": "Mars_MGS_MOLA_ClrShade_merge_global_463m",
        "coverage": "Global Mars",
        "resolution": "463 metres per pixel",
        "source": "NASA Mars Trek"
    },
    {
        "id": "jezero_hirise",
        "name": "Jezero HiRISE Mosaic",
        "instrument": "HiRISE",
        "type": "High-resolution surface imagery",
        "layer_id": "JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd",
        "coverage": {
            "west": 77.2229331,
            "south": 18.3067994,
            "east": 77.583964,
            "north": 18.669315
        },
        "resolution": "25 centimetres per pixel",
        "source": "NASA Mars Trek"
    },
    {
        "id": "mars_global_moc",
        "name": "Mars Global MOC Atlas",
        "instrument": "MOC",
        "type": "Global surface imagery",
        "layer_id": "msss_atlas_simp_clon",
        "coverage": "Global Mars",
        "source": "NASA Mars Trek"
    }
]


def get_imagery_catalog():
    return {
        "planet": "Mars",
        "description": "Available Mars imagery layers",
        "service": "NASA Mars Trek WMTS",
        "documentation": (
            "https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars"
        ),
        "tile_service_type": "WMTS",
        "layers": IMAGERY_LAYERS
    }
