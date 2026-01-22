import pandas as pd
import json
import os

def json_to_excel(json_path, excel_path):
    print(f"Reading {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Transform for Excel
    for item in data:
        # Convert tags list to string
        if 'tags' in item and isinstance(item['tags'], list):
            item['tags'] = ', '.join(item['tags'])
        
        # Convert coords list to separate columns
        if 'coords' in item and isinstance(item['coords'], list) and len(item['coords']) == 2:
            item['longitude'] = item['coords'][0]
            item['latitude'] = item['coords'][1]
            del item['coords']
        elif 'coords' in item:
            item['longitude'] = None
            item['latitude'] = None
            del item['coords']

    df = pd.DataFrame(data)

    # Reorder columns for better readability
    # Priority columns: name, client, company, location, longitude, latitude, category, tags, description
    preferred_order = ['name', 'client', 'company', 'location', 'longitude', 'latitude', 'category', 'tags', 'description', 'title', 'project_role', 'image', 'start_date', 'end_date', 'client_sort']
    
    # Filter preferred_order to only include columns that actually exist
    cols = [c for c in preferred_order if c in df.columns]
    # Add any remaining columns
    others = [c for c in df.columns if c not in cols]
    df = df[cols + others]

    print(f"Saving to {excel_path}...")
    df.to_excel(excel_path, index=False)
    print("Done!")

if __name__ == "__main__":
    input_json = os.path.join('src', 'data', 'project.json')
    output_excel = 'projects.xlsx'
    json_to_excel(input_json, output_excel)
