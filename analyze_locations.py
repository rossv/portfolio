import json

with open('src/data/project.json', 'r', encoding='utf-8-sig') as f:
    data = json.load(f)

missing_coords_locations = set()
for project in data:
    if not project.get('coords'):
        loc = project.get('location')
        if loc:
            missing_coords_locations.add(loc)

print("Unique locations with missing coords:")
for loc in sorted(missing_coords_locations):
    print(loc)
