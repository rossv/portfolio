import pandas as pd
import json
import os
import numpy as np

def excel_to_json(excel_path, json_path):
    print(f"Reading {excel_path}...")
    try:
        df = pd.read_excel(excel_path)
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return

    # Replace specific Excel artifacts
    # Replace NaN with None (which becomes null in JSON) or empty string based on context
    # For this project, empty strings are generally safer for text fields
    df = df.replace({np.nan: "", "NaN": "", "nan": ""})
    
    data = df.to_dict(orient='records')
    
    processed_data = []
    for i, item in enumerate(data):
        # 1. Coordinate Handling
        coords = []
        if 'longitude' in item and 'latitude' in item:
            try:
                lon = item['longitude']
                lat = item['latitude']
                # Check if they are numbers and not empty strings
                if (isinstance(lon, (int, float)) and isinstance(lat, (int, float)) and 
                    lon != "" and lat != ""):
                    coords = [float(lon), float(lat)]
            except (ValueError, TypeError):
                print(f"Warning: Invalid coordinates for item {i}: {item.get('name', 'Unknown')}")
        item['coords'] = coords
        
        # Cleanup temp coordinate fields
        item.pop('longitude', None)
        item.pop('latitude', None)

        # 2. Tag Handling
        tags = []
        if 'tags' in item:
            tag_val = item['tags']
            if isinstance(tag_val, str) and tag_val.strip():
                # Split by comma, strip whitespace, remove empty strings
                tags = [t.strip() for t in tag_val.split(',') if t.strip()]
            elif isinstance(tag_val, (int, float)):
                tags = [str(tag_val)]
        item['tags'] = tags

        # 3. Clean other fields
        # Ensure 'name' exists
        if not item.get('name'):
            print(f"Skipping row {i+2} (Excel row) because it has no 'name'.")
            continue

        # Convert date fields to strings if they got parsed as datetime objects
        for key, value in item.items():
             if isinstance(value, (pd.Timestamp, pd.DatetimeIndex)):
                item[key] = value.strftime('%m/%d/%Y').lstrip("0").replace("/0", "/")
             elif hasattr(value, 'strftime'): # Generic datetime catch
                 item[key] = value.strftime('%m/%d/%Y').lstrip("0").replace("/0", "/")

        
        processed_data.append(item)
    
    # 4. Final Validation
    print(f"Processed {len(processed_data)} items.")
    
    print(f"Saving to {json_path}...")
    try:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(processed_data, f, indent=4)
        print("Done!")
    except Exception as e:
        print(f"Error writing JSON file: {e}")

if __name__ == "__main__":
    input_excel = 'projects.xlsx' 
    output_json = os.path.join('src', 'data', 'project.json')
    
    if os.path.exists(input_excel):
        # Backup original
        backup_path = output_json + '.bak'
        import shutil
        try:
            shutil.copy2(output_json, backup_path)
            print(f"Backup created at {backup_path}")
        except IOError as e:
             print(f"Warning: Could not create backup: {e}")

        excel_to_json(input_excel, output_json)
    else:
        print(f"Error: {input_excel} not found.")
