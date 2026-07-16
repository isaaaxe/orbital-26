import math

def bearing(from_node, to_node):
    lat1 = math.radians(from_node.latitude)
    lat2 = math.radians(to_node.latitude)
    dlon = math.radians(to_node.longitude - from_node.longitude)
    x = math.sin(dlon) * math.cos(lat2)
    y = (math.cos(lat1) * math.sin(lat2)
         - math.sin(lat1) * math.cos(lat2) * math.cos(dlon))
    return (math.degrees(math.atan2(x, y)) + 360) % 360

def turn_delta(bearing_in, bearing_out):
    d = (bearing_out - bearing_in + 180) % 360 - 180
    return d   # >0 = turn right (clockwise), <0 = left, ~0 = straight

def classify(d):
    a = abs(d)
    if a < 25:   return "straight"          # proceed forward
    if a < 150:  return ("right" if d > 0 else "left")
    return "u-turn"