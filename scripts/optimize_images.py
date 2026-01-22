import json
import os
from PIL import Image
from pathlib import Path

def optimize_images():
    base_dir = os.getcwd()
    json_path = os.path.join(base_dir, 'src', 'data', 'project.json')
    assets_dir_rel = os.path.join('src', 'assets', 'projects')
    assets_dir = os.path.join(base_dir, assets_dir_rel)
    
    print(f"Loading {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        projects = json.load(f)
    
    updated = False
    referenced_files = set()
    
    # helper to normalize path for comparison
    def normalize_path(p):
        return os.path.abspath(p).lower()

    for project in projects:
        img_path_str = project.get('image', '')
        if not img_path_str:
            continue
            
        # Remove leading slash for local path construction
        clean_path_str = img_path_str.lstrip('/')
        # Adjust slashes for windows
        local_path = os.path.join(base_dir, clean_path_str.replace('/', os.sep))
        
        # Check if file exists exactly as is
        if os.path.exists(local_path):
            source_file = local_path
        else:
            # File might be missing or extension changed. 
            # Try to find a matching file in assets directory with any image extension
            name = Path(local_path).stem
            found = False
            for ext in ['.png', '.jpg', '.jpeg', '.webp']:
                candidate = os.path.join(assets_dir, name + ext)
                if os.path.exists(candidate):
                    source_file = candidate
                    found = True
                    break
            
            if not found:
                print(f"Warning: Image not found for project '{project['name']}': {img_path_str}")
                continue

        # Now we have a source_file. Check if it needs conversion.
        src_path = Path(source_file)
        if src_path.suffix.lower() != '.webp':
            print(f"Converting {src_path.name} to WebP...")
            try:
                dest_path = src_path.with_suffix('.webp')
                with Image.open(src_path) as img:
                    img.save(dest_path, 'WEBP')
                
                # Update JSON reference
                new_rel_path = f"/{assets_dir_rel.replace(os.sep, '/')}/{dest_path.name}"
                project['image'] = new_rel_path
                updated = True
                
                # Add to referenced files (the NEW webp file)
                referenced_files.add(normalize_path(str(dest_path)))
                
                # We can mark the original for deletion later (it won't be in referenced_files)
                # But wait, if we JUST created it, it exists. 
                # If we updated the JSON, the old .jpg ref is gone.
            except Exception as e:
                print(f"Error converting {src_path.name}: {e}")
                # Keep original ref if conversion failed
                referenced_files.add(normalize_path(str(src_path)))
        else:
            # Already WebP
            referenced_files.add(normalize_path(str(src_path)))

    if updated:
        print("Saving updated project.json...")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(projects, f, indent=4)
    else:
        print("No paths required updating in JSON.")

    # Cleanup phase
    print("Scanning for unused images...")
    all_files = os.listdir(assets_dir)
    image_exts = {'.png', '.jpg', '.jpeg', '.webp'}
    
    deleted_count = 0
    for fname in all_files:
        fpath = os.path.join(assets_dir, fname)
        if hasattr(os, 'path'): # check if it's a file
             if not os.path.isfile(fpath):
                 continue
                 
        ext = os.path.splitext(fname)[1].lower()
        if ext in image_exts:
            if normalize_path(fpath) not in referenced_files:
                print(f"Deleting unused file: {fname}")
                try:
                    os.remove(fpath)
                    deleted_count += 1
                except Exception as e:
                    print(f"Error deleting {fname}: {e}")
    
    print(f"Clean up complete. Deleted {deleted_count} files.")

if __name__ == "__main__":
    optimize_images()
