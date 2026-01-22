import json
import os

def fix_broken_images():
    base_dir = os.getcwd()
    json_path = os.path.join(base_dir, 'src', 'data', 'project.json')
    
    print(f"Loading {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        projects = json.load(f)
    
    updated_count = 0
    removed_images = []

    for project in projects:
        img_path = project.get('image')
        if img_path:
            clean_path = img_path.lstrip('/')
            local_path = os.path.join(base_dir, clean_path.replace('/', os.sep))
            
            if not os.path.exists(local_path):
                print(f"Removing broken image reference for '{project.get('name')}': {img_path}")
                project['image'] = "" # Clear the field
                removed_images.append(f"{project.get('name')} ({img_path})")
                updated_count += 1

    if updated_count > 0:
        print(f"Saving updated project.json with {updated_count} removals...")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(projects, f, indent=4)
        print("Done.")
    else:
        print("No broken images found.")

if __name__ == "__main__":
    fix_broken_images()
