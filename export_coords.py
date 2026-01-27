
import json
import csv
import os

def export_project_coords():
    json_path = 'src/data/project.json'
    csv_path = 'project_coordinates.csv'

    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        projects = json.load(f)

    print(f"Found {len(projects)} projects.")

    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['name', 'longitude', 'latitude']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()

        names_seen = set()
        duplicates = []

        for p in projects:
            name = p.get('name', 'Unknown')
            if name in names_seen:
                duplicates.append(name)
            names_seen.add(name)

            coords = p.get('coords', [])
            
            lon = ''
            lat = ''
            
            if coords and isinstance(coords, list) and len(coords) >= 2:
                try:
                    val1 = float(coords[0])
                    val2 = float(coords[1])
                    
                    # Heuristic for North America:
                    # Lat is typically positive (10 to 80)
                    # Lon is typically negative (-180 to -50)
                    
                    # Case 1: Clear sign difference
                    if val1 < 0 and val2 > 0:
                        # [Lon, Lat] -> [-80, 40]
                        lon = val1
                        lat = val2
                    elif val1 > 0 and val2 < 0:
                        # [Lat, Lon] -> [40, -80] (Swapped)
                        lat = val1
                        lon = val2
                    else:
                        # Case 2: Signs are same or ambiguous, check magnitude
                        # Latitude must be <= 90. Longitude can be > 90.
                        
                        if abs(val1) > 90:
                            # Must be Longitude
                            lon = val1
                            lat = val2
                        elif abs(val2) > 90:
                            # Must be Longitude
                            lat = val1
                            lon = val2
                        else:
                            # Ambiguous, default to [Lon, Lat] as per likely format
                            lon = val1
                            lat = val2
                            
                except (ValueError, TypeError):
                    # Handle cases where coords might not be numbers
                    lon = coords[0]
                    lat = coords[1]
            
            writer.writerow({
                'name': name, 
                'longitude': lon, 
                'latitude': lat
            })

    print(f"Successfully exported to {csv_path}")
    if duplicates:
        print(f"Warning: Found {len(duplicates)} duplicate project names: {duplicates}")
    else:
        print("No duplicate project names found.")

if __name__ == "__main__":
    export_project_coords()
