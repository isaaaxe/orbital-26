# ---------------------------------------------------------------------------
# poi_extras.py
#
# Supplementary per-location data merged into the seed:
#   * boundaries     -> Location.boundaries   (GeoJSON Polygon, JSONB)
#   * opening_hours  -> Location.opening_hours (JSONB, {"mon": ["HH:MM","HH:MM"]})
#   * crowd_density  -> Location.crowd_density (JSONB, SYNTHETIC generic pattern)
#   * canteen        -> Canteen row (halal_availability, stalls)
#
# Keys MUST match LOCATION_SPECS["name"] in updated_seed.py exactly:
#   "Central Library", "COM1", "COM2", "COM3", "Terrace", "Deck"
#
# GeoJSON note: coordinates are [lng, lat] (NOT lat,lng) and each ring is
# closed (first point == last point), matching the edge-geometry convention
# already used in the seed.
#
# Caveats (see chat): Deck hours are the typical pattern, not the only (pandemic-
# era) official figure; CLB weekend hours are estimates; all crowd_density is
# synthetic, not real popular-times data.
# ---------------------------------------------------------------------------

# --- generic crowd patterns ------------------------------------------------

_CANTEEN_WEEKDAY = {
    "08": 15, "09": 20, "10": 25, "11": 50, "12": 90, "13": 85,
    "14": 50, "15": 30, "16": 30, "17": 45, "18": 55, "19": 40,
}
_CANTEEN_SAT = {
    "08": 10, "09": 15, "10": 20, "11": 35, "12": 50, "13": 40, "14": 20,
}
_CANTEEN_CROWD = {
    "mon": _CANTEEN_WEEKDAY, "tue": _CANTEEN_WEEKDAY, "wed": _CANTEEN_WEEKDAY,
    "thu": _CANTEEN_WEEKDAY, "fri": _CANTEEN_WEEKDAY, "sat": _CANTEEN_SAT,
}

_LIBRARY_WEEKDAY = {
    "09": 20, "10": 35, "11": 45, "12": 40, "13": 50, "14": 65, "15": 70,
    "16": 75, "17": 70, "18": 65, "19": 75, "20": 80,
}
_LIBRARY_WEEKEND = {
    "10": 25, "11": 35, "12": 40, "13": 45, "14": 55, "15": 60, "16": 55, "17": 45,
}
_LIBRARY_CROWD = {
    "mon": _LIBRARY_WEEKDAY, "tue": _LIBRARY_WEEKDAY, "wed": _LIBRARY_WEEKDAY,
    "thu": _LIBRARY_WEEKDAY, "fri": _LIBRARY_WEEKDAY,
    "sat": _LIBRARY_WEEKEND, "sun": _LIBRARY_WEEKEND,
}

_CANTEEN_HOURS = {
    "mon": ["07:30", "20:00"], "tue": ["07:30", "20:00"], "wed": ["07:30", "20:00"],
    "thu": ["07:30", "20:00"], "fri": ["07:30", "20:00"], "sat": ["07:30", "15:00"],
    # sun absent -> closed
}
_LIBRARY_HOURS = {
    "mon": ["09:00", "21:00"], "tue": ["09:00", "21:00"], "wed": ["09:00", "21:00"],
    "thu": ["09:00", "21:00"], "fri": ["09:00", "21:00"],
    "sat": ["10:00", "18:00"], "sun": ["10:00", "18:00"],
}


def _polygon(points):
    """points: list of (lat, lon) -> GeoJSON Polygon with [lng,lat], closed ring."""
    ring = [[lon, lat] for (lat, lon) in points]
    if ring and ring[0] != ring[-1]:
        ring.append(ring[0])
    return {"type": "Polygon", "coordinates": [ring]}


# --- boundaries (ported from the frontend POI reference; (lat, lon) pairs) --

_BOUNDARIES = {
    "COM1": _polygon([
        (1.2955517929338451, 103.77362779578262),
        (1.2947299755116342, 103.77438699306742),
        (1.2945436921497224, 103.77422742209411),
        (1.2944627308787748, 103.77398898114822),
        (1.2950444336107492, 103.77342919058599),
        (1.29539731482386,   103.77345952406473),
    ]),
    "COM2": _polygon([
        (1.2944627308787748, 103.77398898114822),
        (1.2945436921497224, 103.77422742209411),
        (1.294081444946064,  103.77409531776226),
        (1.2938379396888149, 103.77419439601114),
        (1.294024793528894,  103.77467327421401),
        (1.293609514418326,  103.7748888537719),
        (1.2932021574991703, 103.77404491475349),
        (1.293947385044634,  103.77372069970775),
    ]),
    "COM3": _polygon([
        (1.2945436921497224, 103.77422742209411),
        (1.2947299755116342, 103.77438699306742),
        (1.2953463385782924, 103.77381759510382),
        (1.2958246538217122, 103.77446165213088),
        (1.2943026734735577, 103.77521100556537),
        (1.294024793528894,  103.77467327421401),
        (1.2938379396888149, 103.77419439601114),
        (1.294081444946064,  103.77409531776226),
    ]),
    "Terrace": _polygon([
        (1.294462299052614,  103.77419892148188),
        (1.2945655377420602, 103.77442154483806),
        (1.294172506555371,  103.77460144543792),
        (1.2940324642468757, 103.7743239750433),
        (1.2943684233096564, 103.77416510040534),
    ]),
    "Deck": _polygon([
        (1.29484227539654,   103.77223567704927),
        (1.2949505098245335, 103.7724623507819),
        (1.2947644818985788, 103.7727465387452),
        (1.2945108074320788, 103.77272285641492),
        (1.294376641815105,  103.77247137262201),
        (1.2945130623163448, 103.77222891066918),
    ]),
    "COM4": _polygon([
        (1.2952293831325665, 103.7751688838608),
        (1.2953782054471301, 103.77549930875463),
        (1.2951775208087768, 103.77558614396564),
        (1.2950704138323563, 103.77536059796303),
        (1.2950241887148168, 103.77538653575336),
        (1.2949790910383543, 103.77528504005218),
    ]),
    "AS6": _polygon([
        (1.2958335603493802, 103.77279072832708),
        (1.2959778728625506, 103.77284485936771),
        (1.2958865501012702, 103.77309634316063),
        (1.2957219436343508, 103.77317528426153),
        (1.2957952273366946, 103.77338504204396),
        (1.2954942004227448, 103.77350796461538),
        (1.2953972404353549, 103.7733275278133),
        (1.2952833688175232, 103.77338278658394),
        (1.295213467425828,  103.77323618168224),
        (1.2957591492065827, 103.77298244242931),
    ]),
}


# --- the merged table, keyed by LOCATION_SPECS["name"] ---------------------
# Any field omitted -> left as the model default (None / not created).

POI_EXTRAS = {
    "Central Library": {
        "boundaries": None,                 # no polygon supplied for CLB
        "opening_hours": _LIBRARY_HOURS,
        "crowd_density": _LIBRARY_CROWD,
    },
    "COM1": {
        "boundaries": _BOUNDARIES["COM1"],
        # building, not a dining venue -> no hours / crowd
    },
    "COM2": {
        "boundaries": _BOUNDARIES["COM2"],
    },
    "COM3": {
        "boundaries": _BOUNDARIES["COM3"],
    },
    "COM4": {
        "boundaries": _BOUNDARIES["COM4"],
    },
    "AS6": {
        "boundaries": _BOUNDARIES["AS6"],
    },
    "Terrace": {
        "boundaries": _BOUNDARIES["Terrace"],
        "opening_hours": _CANTEEN_HOURS,
        "crowd_density": _CANTEEN_CROWD,
        "canteen": {
            "halal_availability": True,
            "stalls": [
                "Drinks & Fruits",
                "Skewers",
                "Local Noodles",
                "Five Grains Noodles",
                "Mala & Sichuan",
                "Mixed Rice",
                "Japanese & Korean",
            ],
        },
    },
    "Deck": {
        "boundaries": _BOUNDARIES["Deck"],
        "opening_hours": _CANTEEN_HOURS,
        "crowd_density": _CANTEEN_CROWD,
        "canteen": {
            "halal_availability": True,
            "stalls": [
                "Yong Tau Foo & Laksa",
                "Chinese Cooked Food",
                "Japanese",
                "Snacks & Fried Kway Teow",
                "Thai Cuisine",
                "Western",
                "Noodle",
                "Roasted Delights",
                "Vegetarian",
                "Indian Vegetarian",
                "Muslim",
                "Drinks & Snacks",
                "Fresh Fruits & Juices",
                "Liang Ban Kung Fu",
                "Chong Pang Tai Zhi Wei",
                "Da Lu Tong",
                "Fong Seng Nasi Lemak",
            ],
        },
    },
}
