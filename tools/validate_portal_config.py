#!/usr/bin/env python3
import argparse,json,re
from pathlib import Path
from urllib.parse import urlparse
slug_re=re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
def url(v):
    p=urlparse(str(v or '')); return p.scheme in ('http','https') and bool(p.netloc)
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('config',nargs='?',default='public-site/assets/config/portal.json'); a=ap.parse_args()
    p=Path(a.config)
    try: c=json.loads(p.read_text(encoding='utf-8'))
    except Exception as e: print(f'ERROR: Cannot parse {p}: {e}'); return 1
    errors=[]; b=c.get('business',{}); bp=c.get('bookingProvider',{}); services=c.get('services',[])
    if not c.get('portalVersion'): errors.append('portalVersion is required')
    if not slug_re.fullmatch(str(b.get('slug',''))): errors.append('business.slug must be kebab-case')
    if not b.get('name'): errors.append('business.name is required')
    if bp.get('type')!='booksy': errors.append('bookingProvider.type must be booksy')
    for k in ('businessId','widgetId'):
        if not isinstance(bp.get(k),int) or bp[k] < 1: errors.append(f'bookingProvider.{k} must be a positive integer')
    for k in ('profileUrl','availabilityApiBase','instantExperienceBase'):
        if not url(bp.get(k)): errors.append(f'bookingProvider.{k} must be an absolute URL')
    if not services: errors.append('at least one service is required')
    seen=set(); variants=set()
    for i,s in enumerate(services):
        x=f'services[{i}]'; slug=str(s.get('slug',''))
        if not slug_re.fullmatch(slug): errors.append(f'{x}.slug is invalid')
        if slug in seen: errors.append(f'duplicate slug {slug}')
        seen.add(slug)
        if s.get('availabilityPath') != f'/availability/{slug}': errors.append(f'{x}.availabilityPath is invalid')
        for k in ('serviceId','variantId','durationMinutes'):
            if not isinstance(s.get(k),int) or s[k] < 1: errors.append(f'{x}.{k} must be positive')
        if s.get('variantId') in variants: errors.append(f'duplicate variantId {s.get("variantId")}')
        variants.add(s.get('variantId'))
        if not isinstance(s.get('price'),(int,float)) or s['price'] < 0: errors.append(f'{x}.price is invalid')
    if errors:
        print(f'ERROR: {p}'); [print(' -',e) for e in errors]; return 1
    print(f'PASS: {p}'); print('Business:',b['name']); print('Booksy widget:',bp['widgetId']); print('Services:',len(services)); return 0
if __name__=='__main__': raise SystemExit(main())
