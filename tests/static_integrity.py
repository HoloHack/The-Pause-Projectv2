from html.parser import HTMLParser
from pathlib import Path
import tinycss2
from collections import Counter

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'dist/index.html').read_text()
CSS=(ROOT/'dist/styles.css').read_text()

class Audit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.links=[]; self.images=[]; self.scripts=[];self.inline=[];self.styles=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if 'id' in d:self.ids.append(d['id'])
        if tag=='a':self.links.append(d)
        if tag=='img':self.images.append(d)
        if tag=='script':self.scripts.append(d)
        if tag=='style':self.styles.append(d)
        if any(k.startswith('on') for k in d):self.inline.append((tag,d))

p=Audit();p.feed(HTML)
assert not [id for id,n in Counter(p.ids).items() if n>1],'Duplicate IDs'
assert len(p.images)>=5,'Not enough images'
assert all(img.get('alt','') for img in p.images),'All images need meaningful alt'
assert not p.inline,'No inline HTML event attributes'
assert not p.styles,'No inline style blocks'
assert len(p.scripts)==1 and p.scripts[0].get('src')=='./assets/app.js'
for a in p.links:
    href=a.get('href','')
    if href.startswith('#'):assert href[1:] in p.ids,href
    if a.get('target')=='_blank':
        assert set(a.get('rel','').split())>={'noopener','noreferrer'},href
for src in ['./assets/app.js','./assets/graph.js','./styles.css','./favicon.svg','./images/hold-the-moment.webp','./images/amplification-map.webp','./images/support-bridge.webp']:
    assert (ROOT/'dist'/src.removeprefix('./')).exists(),src
rules=tinycss2.parse_stylesheet(CSS,skip_comments=True,skip_whitespace=True)
errors=[r for r in rules if r.type=='error']
assert not errors,f'CSS parse errors: {errors}'
assert all('class="' in HTML for _ in range(1))
print('Static integration PASS:',len(p.ids),'unique IDs;',len(p.images),'images;',len(p.links),'links;',len(rules),'CSS top-level rules; no CSS parse errors.')
