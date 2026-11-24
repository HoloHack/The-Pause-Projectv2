import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
URL='http://127.0.0.1:4173/'
OUT=Path('/mnt/data/the-pause-project-v2/docs')

async def check(browser,width,height,reduced=False):
    context=await browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce' if reduced else 'no-preference')
    page=await context.new_page()
    await page.route('https://images.unsplash.com/**',lambda route: route.abort())
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    response=await page.goto(URL,wait_until='domcontentloaded',timeout=20000)
    await page.wait_for_timeout(500)
    assert response and response.status==200
    assert 'One message.' in await page.locator('h1').inner_text()
    assert await page.locator('#chart-visual svg rect').count()==3
    await page.locator('[data-period="year"]').click()
    assert '34% of 10–12-year-olds' in await page.locator('#chart-summary').inner_text()
    await page.locator('[data-scenario="argument"]').click()
    assert 'not automatically bullying' in await page.locator('#scenario-result').inner_text()
    await page.locator('[data-network="checkin"]').click()
    assert 'connection rather than a spotlight' in (await page.locator('#network-explanation').inner_text()).lower()
    await page.locator('[data-network="adult"]').click()
    assert 'trusted adult' in (await page.locator('#network-explanation').inner_text()).lower()
    await page.locator('[data-support="report"]').click()
    assert 'platform' in await page.locator('#support-result').inner_text()
    await page.locator('#toggle-transcript').click()
    assert await page.locator('#transcript-panel').is_visible()
    await page.locator('#close-transcript').click()
    assert not await page.locator('#transcript-panel').is_visible()
    # local-only wall
    payload='<img src=x onerror=alert(1)> I can seek safe support'
    await page.locator('#reflection-text').fill(payload)
    await page.locator('#reflection-form button[type="submit"]').click()
    assert await page.locator('.reflection-note').count()==1
    assert await page.locator('.reflection-note img').count()==0
    assert '<img' in await page.locator('.reflection-note p').inner_text()
    await page.reload(wait_until='domcontentloaded')
    assert await page.locator('.reflection-note').count()==1
    await page.locator('#clear-reflections').click()
    assert await page.locator('.reflection-note').count()==0
    # Force lazy photos to load so the remote-image outage and local artwork fallback are actually exercised.
    await page.locator('img').evaluate_all('(list) => list.forEach(img => img.loading = \"eager\")')
    await page.wait_for_function('Array.from(document.images).every(img => img.complete && img.naturalWidth > 0)',timeout=15000)
    fallback=await page.locator('.photo-frame.is-fallback').count()
    broken=await page.locator('img').evaluate_all('(list) => list.filter(x => !x.complete || x.naturalWidth===0).map(x=>x.src)')
    overflow=await page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
    assert overflow<=1,f'horizontal overflow {width}x{height}: {overflow}'
    assert not broken,broken
    assert not errors,errors
    if width<=390:
        await page.locator('#menu-toggle').click()
        assert await page.locator('#mobile-nav').is_visible()
        await page.locator('#mobile-nav a[href="#support"]').click()
        assert not await page.locator('#mobile-nav').is_visible()
    if width==1440 and height==900:
        await page.screenshot(path=str(OUT/'desktop-hero.png'),full_page=False)
        await page.locator('#intervene').screenshot(path=str(OUT/'desktop-intervene.png'))
        await page.locator('#next').screenshot(path=str(OUT/'desktop-next.png'))
    if width==390 and height==844:
        await page.screenshot(path=str(OUT/'mobile-hero.png'),full_page=False)
        await page.locator('#intervene').screenshot(path=str(OUT/'mobile-intervene.png'))
    gl=await page.locator('#network-canvas').evaluate('(el)=>({canvas:!!el.getContext("webgl2"), fallback:el.parentElement.classList.contains("no-webgl")})')
    result={'viewport':f'{width}x{height}','reduced':reduced,'page_errors':len(errors),'fallback_photos':fallback,'webgl':gl,'overflow_px':overflow,'passed':True}
    await context.close()
    return result

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        results=[]
        for width,height,reduced in [(1440,900,False),(768,1024,False),(390,844,False),(320,680,False),(390,844,True)]:
            results.append(await check(browser,width,height,reduced));print(results[-1])
        await browser.close()
        (OUT/'browser-results.json').write_text(json.dumps(results,indent=2))

if __name__=='__main__':asyncio.run(main())
