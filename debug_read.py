import os

path = 'src/data/project.json'
print(f"File exists: {os.path.exists(path)}")
print(f"File size: {os.path.getsize(path)}")

try:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read(100)
        print(f"First 100 chars: {repr(content)}")
except Exception as e:
    print(f"Error reading: {e}")
