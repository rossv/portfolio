import pandas as pd
import json
import os

def excel_to_json(excel_path, json_path):
    print(f"Reading {excel_path}...")
    df = pd.read_excel(excel_path)
    
    # Replace NaN with empty string or appropriate defaults
    df = df.where(pd.notnull(df), "")
    
    data = df.to_dict(orient='records')
    
    processed_data = []
    for item in data:
        # Reconstruct coords
        if 'longitude' in item and 'latitude' in item:
            try:
                # Check for empty strings from Excel
                lon_val = item['longitude']
                lat_val = item['latitude']
                
                if lon_val != "" and lat_val != "":
                    item['coords'] = [float(lon_val), float(lat_val)]
                else:
                    item['coords'] = []
            except (ValueError, TypeError):
                item['coords'] = []
            
            # Remove the flat columns
            if 'longitude' in item: del item['longitude']
            if 'latitude' in item: del item['latitude']
        
        # Reconstruct tags list
        if 'tags' in item:
            if isinstance(item['tags'], str):
                if item['tags'].strip() == "":
                    item['tags'] = []
                else:
                    item['tags'] = [tag.strip() for tag in item['tags'].split(',') if tag.strip()]
            elif isinstance(item['tags'], (int, float)):
                # Handle cases where tags might be interpreted as numbers
                item['tags'] = [str(item['tags'])]
            elif item['tags'] == "":
                item['tags'] = []
        
        # Clean up other empty strings if they should be null or something else
        # For this project, empty strings seem fine for description, end_date, etc.
        
        processed_data.append(item)
    
    print(f"Saving to {json_path}...")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, indent=4)
    print("Done!")

if __name__ == "__main__":
    # Usually we'd want to use a specific file name the user provides
    input_excel = 'projects.xlsx' 
    output_json = os.path.join('src', 'data', 'project.json')
    
    if os.path.exists(input_excel):
        # Backup original
        backup_path = output_json + '.bak'
        import shutil
        shutil.copy2(output_json, backup_path)
        print(f"Backup created at {backup_path}")
        
        excel_to_json(input_excel, output_json)
    else:
        print(f"Error: {input_excel} not found.")
