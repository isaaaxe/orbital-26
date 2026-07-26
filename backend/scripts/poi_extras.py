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
# Caveats : Deck hours are the typical pattern,
# CLB weekend hours are estimates; all crowd_density is
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

# --- opening-hours helper ----------------------------------------------------
_ALL_WEEK = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")
_MON_SAT = ("mon", "tue", "wed", "thu", "fri", "sat")
_MON_FRI = ("mon", "tue", "wed", "thu", "fri")


def _daily_hours(open_t, close_t, days=_ALL_WEEK, **per_day):
    """Same open/close on each day in `days`; `per_day` overrides single days.
    Any day absent from the result is CLOSED."""
    hours = {d: [open_t, close_t] for d in days}
    hours.update(per_day)
    return hours


# --- synthetic crowd density, by venue archetype ----------------------------
# SYNTHETIC (same caveat as the hand-written patterns above) -- NOT real
# popular-times data. Every venue below is location_type "canteen", but they
# behave very differently, so the curve shape comes from the archetype and is
# then CLIPPED to that venue's real opening_hours (a closed hour never appears).
#   food_court  multi-stall; sharp lunch spike + solid dinner
#   restaurant  sit-down; later, flatter lunch and a strong dinner
#   fast_food   counter service; big lunch, steady afternoon, evening bump
#   cafe        morning peak, steady all day, no meal spike
#   dessert     afternoon/early-evening treat traffic
#   late_night  evening ramp peaking near midnight
_CROWD_PROFILES = {
    "food_court": {7: 10, 8: 15, 9: 20, 10: 25, 11: 50, 12: 90, 13: 85, 14: 50,
                   15: 30, 16: 30, 17: 45, 18: 55, 19: 40, 20: 25, 21: 15},
    "restaurant": {11: 30, 12: 65, 13: 70, 14: 45, 15: 25, 16: 25, 17: 40,
                   18: 70, 19: 75, 20: 55, 21: 30, 22: 20},
    "fast_food":  {8: 15, 9: 20, 10: 25, 11: 45, 12: 75, 13: 70, 14: 45, 15: 35,
                   16: 35, 17: 50, 18: 60, 19: 50, 20: 35, 21: 25, 22: 15},
    "cafe":       {7: 25, 8: 55, 9: 65, 10: 55, 11: 45, 12: 50, 13: 45, 14: 40,
                   15: 45, 16: 45, 17: 40, 18: 30, 19: 25, 20: 20, 21: 15},
    "dessert":    {11: 15, 12: 35, 13: 40, 14: 35, 15: 40, 16: 45, 17: 50,
                   18: 45, 19: 35, 20: 25, 21: 15},
    "late_night": {17: 15, 18: 25, 19: 40, 20: 55, 21: 65, 22: 70, 23: 60,
                   0: 45, 1: 30},
}
# campus is quieter at weekends
_WEEKEND_FACTOR = {"sat": 0.55, "sun": 0.45}
_CROWD_FLOOR = 10          # value for an open hour the profile doesn't cover


def _open_hour_range(open_t, close_t):
    """Hour buckets a venue is open for. Handles windows crossing midnight
    (18:00-02:00 -> 18..23, 0, 1). A close time on the hour excludes that hour."""
    oh, om = (int(x) for x in open_t.split(":"))
    ch, cm = (int(x) for x in close_t.split(":"))
    last = ch if cm > 0 else ch - 1
    hours, h = [], oh
    while len(hours) < 24:
        hours.append(h % 24)
        if h % 24 == last % 24:
            break
        h += 1
    return hours


def _crowd(archetype, opening_hours):
    """Build a crowd_density dict shaped by `archetype`, clipped to opening_hours."""
    profile = _CROWD_PROFILES[archetype]
    out = {}
    for day, (open_t, close_t) in opening_hours.items():
        factor = _WEEKEND_FACTOR.get(day, 1.0)
        curve = {}
        for h in _open_hour_range(open_t, close_t):
            curve[f"{h:02d}"] = max(5, round(profile.get(h, _CROWD_FLOOR) * factor))
        if curve:
            out[day] = curve
    return out


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
    "SRC": _polygon([
        (1.305376227060759,  103.77172622264968),
        (1.3054414162916408, 103.77240726545438),
        (1.3051370082160496, 103.77244560827481),
        (1.304868678104049,  103.7726418332971),
        (1.3045484858320957, 103.77310645806246),
        (1.304350056798035,  103.77322148652381),
        (1.3039171206694307, 103.77296661954085),
        (1.3044379969400641, 103.77202609270998),
        (1.3048258354784625, 103.77183437860775),
        (1.305069361972021,  103.77176897026699),
    ]),
}


# --- the merged table, keyed by LOCATION_SPECS["name"] ---------------------
# Any field omitted -> left as the model default (None / not created).

POI_EXTRAS = {
    "Central Library": {
        "boundaries": None,                 # no polygon supplied for CLB
        # mon-fri 09:00-21:00, both weekend days 10:00-18:00
        "opening_hours": _daily_hours("09:00", "21:00", _MON_FRI,
                                      sat=["10:00", "18:00"], sun=["10:00", "18:00"]),
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
    "SRC": {
        "boundaries": _BOUNDARIES["SRC"],
    },
    "Terrace": {
        "boundaries": _BOUNDARIES["Terrace"],
        # mon-fri 07:30-20:00, sat closes early, closed sunday
        "opening_hours": _daily_hours("07:30", "20:00", _MON_FRI, sat=["07:30", "15:00"]),
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
        # mon-fri 07:30-20:00, sat closes early, closed sunday
        "opening_hours": _daily_hours("07:30", "20:00", _MON_FRI, sat=["07:30", "15:00"]),
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
    # --- UTown food venues: canteen rows with empty stalls (fill in later). ---
    # halal_availability defaulted False (unverified) -- update when known.
    "UDON DON BAR": {
        "opening_hours": _daily_hours("11:00", "21:30"),
        "canteen": {"halal_availability": True, "stalls": []},
    },
    "Hwang's": {
        # closed Sunday
        "opening_hours": _daily_hours("10:30", "21:00", _MON_SAT),
        "canteen": {"halal_availability": False, "stalls": []},
    },
    "Jollibee NUS": {
        "opening_hours": _daily_hours("09:00", "21:00"),
        "canteen": {"halal_availability": True, "stalls": []},
    },
    "Mr Bean": {
        # closed Sunday; Saturday closes earlier
        "opening_hours": _daily_hours("08:00", "19:30", _MON_FRI, sat=["08:00", "17:00"]),
        "canteen": {"halal_availability": True, "stalls": []},
    },
    "Makan Mala": {
        "opening_hours": _daily_hours("11:00", "21:30"),
        "canteen": {"halal_availability": True, "stalls": []},
    },
    "The Royals Bistro": {
        # closed Sunday
        "opening_hours": _daily_hours("11:00", "20:00", _MON_SAT),
        "canteen": {"halal_availability": True, "stalls": []},
    },
    "Fine Food": {
        "opening_hours": _daily_hours("08:00", "20:30"),
        "canteen": {
            "halal_availability": True,
            "stalls": [
                "Yong Tau Foo",
                "Thai Cuisine",
                "Japanese Fusion",
                "Scrambled Egg Bowl",
                "Fish Soup/Ban Mian",
                "Mini Wok",
                "Xiao Long Bao",
                "Snail Noodle",
                "Mala Hotpot",
                "Korean Hotplate",
                "Economic Rice",
                "San Chen Salad Bar",
                "Fruits & Juice",
                "Beverage",
                "Hot Pot",
                "Rice & Noodle",
            ],
        },
    },
    "Starbucks": {
        "opening_hours": _daily_hours("07:30", "21:00"),
        "canteen": {"halal_availability": True, "stalls": []},
    },

    # --- SRC L1 food outlets (curated canteens in updated_seed.py) ---
    "Waa Cow!": {
        # weekends open later
        "opening_hours": _daily_hours("11:30", "20:30", _MON_FRI,
                                      sat=["12:00", "20:30"], sun=["12:00", "20:30"]),
        "canteen": {"halal_availability": True, "stalls": []},
    },
    "Subway": {
        # Sunday closes earlier
        "opening_hours": _daily_hours("08:30", "21:30", sun=["08:30", "19:45"]),
        "canteen": {"halal_availability": True, "stalls": []},
    },
    "Super Snacks": {
        # overnight: opens 18:00, closes 02:00 the next day
        "opening_hours": _daily_hours("18:00", "02:00"),
        "canteen": {"halal_availability": True, "stalls": []},
    },
    "Sapore": {
        # closed Sunday
        "opening_hours": _daily_hours("11:30", "20:00", _MON_SAT),
        "canteen": {"halal_availability": True, "stalls": []},
    },

    # --- COM3 L1 food outlets (curated canteens in updated_seed.py). Weekdays only. ---
    "Smooy": {
        "opening_hours": _daily_hours("11:00", "19:30", _MON_FRI),
        "canteen": {"halal_availability": True, "stalls": []},
    },
    "Makan Boleh": {
        "opening_hours": _daily_hours("08:00", "19:00", _MON_FRI),
        "canteen": {"halal_availability": True, "stalls": []},
    },
    "Coffee Bean": {
        "opening_hours": _daily_hours("08:00", "18:00", _MON_FRI),
        "canteen": {"halal_availability": True, "stalls": []},
    },

    # Flavours@UTown: SRC L2 food court (curated canteen in updated_seed.py).
    "Flavours@UTown": {
        "opening_hours": _daily_hours("07:30", "20:30"),
        "canteen": {
            "halal_availability": True,
            "stalls": [
                "Haji Karim",
                "Fruits & Drinks",
                "Yong Tau Foo",
                "Pondok Nasi Lemak",
                "Mini Wok",
                "Yu Xiang Fang Scrambled Egg Rice",
                "Koka Noodle",
                "Mala Hot Pot",
                "Sichuan Cuisine",
                "Japanese",
                "Mixed Veg Rice",
            ],
        },
    },
}


# ---------------------------------------------------------------------------
# Synthetic crowd density for the food venues.
#
# All of these are location_type "canteen", but they are NOT the same kind of
# place -- a 16-stall food court and a frozen-yoghurt counter have very
# different rhythms. The archetype below decides the curve SHAPE; _crowd()
# then clips it to that venue's real opening_hours, so hours/days the venue is
# shut never get a crowd figure. Change the hours and the curve follows.
#
# Terrace / Deck / Central Library keep their hand-written patterns above.
# ---------------------------------------------------------------------------
_VENUE_ARCHETYPE = {
    # multi-stall food courts -- sharp lunch spike
    "Fine Food":         "food_court",   # 16 stalls
    "Flavours@UTown":    "food_court",   # 11 stalls
    "Makan Boleh":       "food_court",   # canteen-style stall, lunch driven
    # sit-down restaurants -- later lunch, strong dinner
    "UDON DON BAR":      "restaurant",
    "Hwang's":           "restaurant",
    "Makan Mala":        "restaurant",
    "The Royals Bistro": "restaurant",
    "Waa Cow!":          "restaurant",
    "Sapore":            "restaurant",
    # counter / fast food
    "Jollibee NUS":      "fast_food",
    "Subway":            "fast_food",
    # cafes and drinks kiosks -- morning peak, no meal spike
    "Starbucks":         "cafe",
    "Coffee Bean":       "cafe",
    "Mr Bean":           "cafe",
    # dessert counter
    "Smooy":             "dessert",
    # late-night snacks (18:00-02:00)
    "Super Snacks":      "late_night",
}

for _name, _archetype in _VENUE_ARCHETYPE.items():
    _entry = POI_EXTRAS[_name]
    _entry["crowd_density"] = _crowd(_archetype, _entry["opening_hours"])
del _name, _archetype, _entry
