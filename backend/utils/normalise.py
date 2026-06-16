import re

def normalise(s: str):
    return re.sub(r"[^a-z0-9]", "", s.lower())