# Tag review command log

Commands used to review project data and tag list:

- `rg -n "tags" src`
- `python - <<'PY'
import json
from pathlib import Path
p=Path('src/data/project.json').read_text(encoding='utf-8-sig')
projects=json.loads(p)
empty=[pr for pr in projects if not pr.get('tags')]
print('empty count',len(empty))
for pr in empty:
    print('-',pr['name'])
    print('  category:',pr.get('category'))
    print('  description:',pr.get('description')[:160])
PY`
- `nl -ba src/data/project.json | sed -n '2516,2860p'`
- `nl -ba src/constants/tagHierarchy.js | sed -n '1,220p'`
