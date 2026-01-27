
import json
import csv
import os

def import_project_coords():
    json_path = 'src/data/project.json'
    csv_path = 'project_coordinates.csv'

    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return
    
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    # Load CSV data into a dictionary for easy lookup
    csv_data = {}
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('name')
            lon_str = row.get('longitude')
            lat_str = row.get('latitude')
            
            if name and lon_str and lat_str:
                try:
                    lon = float(lon_str)
                    lat = float(lat_str)
                    csv_data[name] = [lon, lat]
                except ValueError:
                    print(f"Warning: Invalid coordinates for project '{name}': {lon_str}, {lat_str}")

    print(f"loaded {len(csv_data)} updates from CSV.")

    # Load JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        projects = json.load(f)

    updates_count = 0
    
    for p in projects:
        name = p.get('name')
        if name in csv_data:
            new_coords = csv_data[name]
            # Check if different to report update
            current_coords = p.get('coords')
            
            # Update if different or missing
            if current_coords != new_coords:
                p['coords'] = new_coords
                updates_count += 1
                # print(f"Updated '{name}': {current_coords} -> {new_coords}")
    
    # Save JSON
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(projects, f, indent=4) # Using indent=4 to match likely existing style or pretty print

    print(f"Successfully updated {updates_count} projects in {json_path}")

if __name__ == "__main__":
    import_project_coords()
