import json
import os
import sys

def validate_data():
    base_dir = os.getcwd()
    json_path = os.path.join(base_dir, 'src', 'data', 'project.json')
    
    print(f"Validating {json_path}...")
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            projects = json.load(f)
    except Exception as e:
        print(f"FATAL: Could not parse JSON: {e}")
        sys.exit(1)

    error_count = 0
    warning_count = 0
    
    for i, project in enumerate(projects):
        name = project.get('name', f"Item {i}")
        
        # Check required fields
        if not project.get('name'):
            print(f"Error: Item {i} missing 'name'")
            error_count += 1
        
        # Check coords
        coords = project.get('coords')
        if coords is not None:
            if not isinstance(coords, list):
                print(f"Error: {name} 'coords' is not a list: {type(coords)}")
                error_count += 1
            elif len(coords) not in [0, 2]:
                 print(f"Error: {name} 'coords' has invalid length: {len(coords)}")
                 error_count += 1
            elif len(coords) == 2:
                 if not all(isinstance(c, (int, float)) for c in coords):
                      print(f"Error: {name} 'coords' contains non-numbers: {coords}")
                      error_count += 1

        # Check tags
        tags = project.get('tags')
        if tags is not None and not isinstance(tags, list):
             print(f"Error: {name} 'tags' is not a list: {type(tags)}")
             error_count += 1
        
        # Check Image
        img_path = project.get('image')
        if img_path:
            # Construct local path
            clean_path = img_path.lstrip('/')
            local_path = os.path.join(base_dir, clean_path.replace('/', os.sep))
            
            if not os.path.exists(local_path):
                print(f"Error: {name} image does not exist: {local_path}")
                error_count += 1
            
            if not img_path.lower().endswith('.webp'):
                print(f"Warning: {name} image is not WebP: {img_path}")
                warning_count += 1

    print(f"\nValidation Complete.")
    print(f"Errors: {error_count}")
    print(f"Warnings: {warning_count}")
    
    if error_count > 0:
        sys.exit(1)

if __name__ == "__main__":
    validate_data()
