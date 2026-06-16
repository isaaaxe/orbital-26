from math import radians, sin, cos, sqrt, atan2
import numpy as np 

def haversine_m(lat1, lon1, lat2, lon2):
    radius_m = 6371000

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return radius_m * c

def get_cooefficient(pxList, geoList):
    px = np.array(pxList, dtype=float)
    geo = np.array(geoList)

    A = np.hstack([px, np.ones((len(px), 1))])
    coeff, *_ = np.linalg.lstsq(A, geo, rcond=None)
    #coeff as (a, d), (b, e), (c, f)
    return coeff

def pixel_to_geo(x, y, coeff):
    (a, d), (b, e), (c, f) = coeff
    lng = a*x + b*y + c
    lat = d*x + e*y + f 
    return lat, lng