"""Restricted-environment Chromium audit; external/local navigation blocked, so inline real production JS/CSS."""
import asyncio, base64, re, json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
html=(DIST/'index.html').read_text()
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>', '', html)
html=re.sub(r'<link rel="stylesheet"[^>]*>', '', html)
html=re.sub(r'<script type="module"[^>]*></script>', '', html)
html=re.sub(r'<link rel="icon"[^>]*>', '', html)
for p in (DIST/'images').glob('*.webp'):
   uri='data:image/webp;base64,'+base64.b64encode(p.read_bytes()).decode()
   html=html.replace('./images/'+p.name,uri)
html=re.sub(r'https://images\.unsplash\.com/[^" ]+', 'data:image/webp;base64,'+base64.b64encode((DIST/'images/hold-the-moment.webp').read_bytes()).decode(),html)
js=(DIST/'assets/graph.js').read_text().replace('export class ImpactGraph','class ImpactGraph')+'\n'+(DIST/'assets/app.js').read_text().replace("import { ImpactGraph } from './graph.js';",'')
css=(DIST/'styles.css').read_text()
async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
  for w,h,reduced in [(1440,900,False),(768,1024,False),(390,844,False),(320,680,False),(390,844,True)]:
   context=await browser.new_context(viewport={'width':w,'height':h},reduced_motion='reduce' if reduced else 'no-preference')
   page=await context.new_page()
   errors=[];console_errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('console',lambda m:console_errors.append(m.text) if m.type=='error' else None)
   await page.set_content(html,wait_until='domcontentloaded')
   await page.add_style_tag(content=css)
   await page.add_script_tag(content=js)
   await page.wait_for_timeout(150)
   details={'viewport':f'{w}x{h}','reduced':reduced,'errors':errors,'console_errors':console_errors}
   try:
    assert await page.locator('h1').count()==1
    assert await page.locator('#chart-visual svg rect').count()==3
    await page.locator('[data-period="year"]').click()
    assert '34% of 10–12-year-olds' in await page.locator('#chart-summary').inner_text()
    await page.locator('[data-scenario="argument"]').click()
    assert 'not automatically bullying' in (await page.locator('#scenario-result').inner_text()).lower()
    await page.locator('[data-network="checkin"]').click()
    assert 'connection rather than a spotlight' in (await page.locator('#network-explanation').inner_text()).lower()
    await page.locator('[data-network="adult"]').click()
    assert 'trusted adult' in (await page.locator('#network-explanation').inner_text()).lower()
    await page.locator('[data-support="report"]').click()
    assert 'platform' in (await page.locator('#support-result').inner_text()).lower()
    await page.locator('#toggle-transcript').click()
    assert await page.locator('#transcript-panel').is_visible()
    await page.locator('#close-transcript').click()
    assert not await page.locator('#transcript-panel').is_visible()
    await page.locator('#reflection-text').fill('<img src=x onerror=alert(1)> I can choose not to forward')
    await page.locator('#reflection-form button[type="submit"]').click()
    assert await page.locator('.reflection-note').count()==1
    assert await page.locator('.reflection-note img').count()==0
    await page.locator('#clear-reflections').click()
    assert await page.locator('.reflection-note').count()==0
    if w<=390:
     await page.locator('#menu-toggle').click()
     assert await page.locator('#mobile-nav').is_visible()
     await page.locator('#mobile-nav a[href="#support"]').click()
     assert not await page.locator('#mobile-nav').is_visible()
    details['overflow']=await page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
    details['webgl']=await page.evaluate('({webgl: !!document.querySelector("#network-canvas").getContext("webgl2"),fallback: document.querySelector("#network-canvas").parentElement.classList.contains("no-webgl")})')
    details['brokenImages']=await page.evaluate('Array.from(document.images).filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute("alt"))')
    assert details['overflow']<=1
    assert not errors,errors
    details['passed']=True
    if w==1440 or (w==390 and not reduced):
      await page.locator('#hold').scroll_into_view_if_needed()
      await page.screenshot(path=str(ROOT/'docs'/f'inline-{w}-hero.png'))
   except Exception as e:
    details['passed']=False;details['failure']=str(e)
    try:await page.screenshot(path=str(ROOT/'docs'/f'inline-{w}-error.png'))
    except:pass
   print(json.dumps(details))
   await context.close()
  await browser.close()
asyncio.run(run())
