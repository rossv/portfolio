
import json

def verify():
    with open('src/data/project.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    targets = [
        'CEC Go Development', 
        'Power Plant Siting Certificate', 
        'Metropolitan Sewer Authority of Greater Cincinnati - Calibration Reviews'
    ]
    
    for p in data:
        if p['name'] in targets:
            print(f"{p['name']}: {p['coords']}")

if __name__ == "__main__":
    verify()
