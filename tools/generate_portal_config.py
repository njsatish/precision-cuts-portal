#!/usr/bin/env python3
import argparse,json
from pathlib import Path
ap=argparse.ArgumentParser(); ap.add_argument('config',nargs='?',default='public-site/assets/config/portal.json'); ap.add_argument('--output',default='public-site/assets/js/config/generated-portal.js'); a=ap.parse_args()
c=json.loads(Path(a.config).read_text(encoding='utf-8'))
payload=json.dumps(c,indent=2,ensure_ascii=False)
out='''(() => {\n  "use strict";\n  const config = __PAYLOAD__;\n  const active = config.services.filter(service => service.active !== false).sort((a,b) => (a.sortOrder||0)-(b.sortOrder||0));\n  const bySlug = Object.freeze(Object.fromEntries(active.map(service => [service.slug, Object.freeze(service)])));\n  window.BOOKSY_PORTAL_CONFIG = Object.freeze({ ...config, services: Object.freeze(active), servicesBySlug: bySlug, getService(slug) { return bySlug[slug] || null; } });\n  document.dispatchEvent(new CustomEvent("booksy-portal-config-ready", { detail: window.BOOKSY_PORTAL_CONFIG }));\n})();\n'''.replace('__PAYLOAD__',payload)
p=Path(a.output); p.parent.mkdir(parents=True,exist_ok=True)
changed=not p.exists() or p.read_text(encoding='utf-8')!=out
p.write_text(out,encoding='utf-8'); print(('UPDATED' if changed else 'UNCHANGED')+': '+str(p))
