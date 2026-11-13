const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.STUDIO_URL||'http://localhost:3000';
 await page.goto(base);await page.waitForLoadState('networkidle');
 for(let i=1;i<=4;i++){
  await page.getByRole('button',{name:'Próxima prática'}).click();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('.wellness-controls p').innerText(),String(i+1).padStart(2,'0')+' / 05');
 }
 assert(await page.getByRole('button',{name:'Próxima prática'}).isDisabled());
 await page.getByRole('button',{name:'Prática anterior'}).click();await page.waitForTimeout(150);
 assert.equal(await page.locator('.wellness-controls p').innerText(),'04 / 05');
 await page.getByRole('link',{name:'Explorar eventos'}).click();
 assert.equal(new URL(page.url()).hash,'#eventos');
 await page.getByRole('searchbox',{name:'Buscar eventos'}).fill('Corre');
 await Promise.all([page.waitForURL(/q=Corre/),page.getByRole('button',{name:'Buscar',exact:true}).click()]);await page.waitForFunction(()=>document.querySelectorAll('.event-card').length===1);
 assert.equal(await page.locator('.event-card').count(),1);
 assert.match(await page.locator('.event-card').innerText(),/Corre Juntas/);
 await Promise.all([page.waitForURL(/\/eventos\//),page.locator('.event-card-link').click()]);await page.waitForSelector('h1.page-title');
 assert.equal(await page.locator('h1').innerText(),'Corre Juntas');
 await Promise.all([page.waitForURL(/\/conta/),page.getByRole('link',{name:'Fazer inscrição'}).click()]);await page.getByRole('button',{name:'Entrar',exact:true}).waitFor();
 assert.match(page.url(),/\/conta/);assert(await page.getByRole('button',{name:'Entrar',exact:true}).isVisible());
 await page.goto(base+'/?tipo=gratis#eventos');await page.waitForLoadState('networkidle');
 assert(await page.locator('.event-card').count()>0);
 for(const card of await page.locator('.event-card').all())assert.match(await card.innerText(),/Gratuito/);
 for(const width of [320,360,390,430,768,1024,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base);await page.waitForLoadState('networkidle');
  for(const id of ['movimento','bem-estar','comunidade','eventos']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(100)}
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width,'Overflow '+width);
  assert.equal(await page.locator('[data-ready=true]').count(),0,'Reduced motion should use static art');
  assert.equal(await page.locator('.studio-fallback').evaluateAll(images=>images.filter(i=>!i.complete||!i.naturalWidth).length),0,'Missing studio assets');
  if([390,1440].includes(width))await page.screenshot({path:'artifacts/'+(width===390?'mobile':'desktop')+'-full.png',fullPage:true});
  console.log('PASS viewport '+width);
 }
 const live=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 live.on('pageerror',e=>errors.push(e.message));
 await live.goto(base);await live.waitForLoadState('networkidle');
 assert.equal(await live.locator('canvas').count(),0,'Public page should not create an animated canvas');
 const art=live.locator('.sport-stage-hero');
 const before=await art.screenshot();
 await live.mouse.move(1000,300);await live.waitForTimeout(1200);await live.mouse.move(300,600);
 const after=await art.screenshot();
 assert.equal(Buffer.compare(before,after),0,'Hero artwork must remain identical over time and pointer movement');
 await live.screenshot({path:'artifacts/desktop-hero.png'});
 await live.emulateMedia({reducedMotion:'reduce'});await live.waitForTimeout(150);assert.equal(await live.locator('canvas').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS carousel, CTA, search, filters, detail, signup redirect, static image stability, reduced-motion toggle; no JS errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
