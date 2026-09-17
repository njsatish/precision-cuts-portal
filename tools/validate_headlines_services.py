#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

root=Path(sys.argv[1] if len(sys.argv)>1 else '.')
config_path=root/'public-site/assets/config/portal.json'
config=json.loads(config_path.read_text(encoding='utf-8'))
expected={
 'haircut':(634731,9396822,45,50),
 'haircut-and-beard':(574263,9396820,45,60),
 'kids-cut':(3602928,9396824,35,35),
 'black-mask':(623287,9396821,20,25)
}
services={item['slug']:item for item in config.get('services',[])}
errors=[]
if set(services)!=set(expected):
    errors.append(f'Service slugs differ: {sorted(services)}')
for slug,values in expected.items():
    item=services.get(slug,{})
    actual=(item.get('serviceId'),item.get('variantId'),item.get('durationMinutes'),item.get('price'))
    if actual!=values:
        errors.append(f'{slug}: expected {values}, found {actual}')
    if item.get('availabilityPath')!=f'/availability/{slug}':
        errors.append(f'{slug}: availabilityPath is invalid')

for page_name in ('index.html','services.html','book.html','contact.html'):
    page=root/'public-site'/page_name
    text=page.read_text(encoding='utf-8')
    if text.count('headlines-services.js')!=1:
        errors.append(f'{page_name}: expected one service config script')

# Report Lambda source occurrences without requiring a particular folder layout.
variant_occurrences={str(v[1]):[] for v in expected.values()}
for path in root.rglob('*'):
    if not path.is_file() or '.git' in path.parts or path.suffix.lower() not in {'.js','.mjs','.cjs','.json','.py','.sh','.yaml','.yml'}:
        continue
    try: text=path.read_text(encoding='utf-8',errors='ignore')
    except Exception: continue
    for variant in variant_occurrences:
        if variant in text:
            variant_occurrences[variant].append(str(path))

if errors:
    print('ERROR: Service configuration validation failed:')
    for error in errors: print(' -',error)
    raise SystemExit(1)

print('PASS: Canonical service configuration is valid.')
for slug,item in services.items():
    print(f"{slug}: serviceId={item['serviceId']} variantId={item['variantId']} duration={item['durationMinutes']} price={item['price']}")
print('Lambda/source variant references:')
for variant,paths in variant_occurrences.items():
    print(f' {variant}: {len(paths)} file(s)')
