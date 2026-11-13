const { chromium } = require('playwright');
const fs = require('node:fs');
const sharp = require('sharp');
const path = require('node:path');
const route = path.resolve('app/studio-export');
if (fs.existsSync(route)) throw new Error('A rota temporária já existe. Revise antes de exportar.');
fs.mkdirSync(route);
fs.copyFileSync(path.join(__dirname,'studio-export-page.tsx.txt'),path.join(route,'page.tsx'));
process.on('exit',()=>fs.rmSync(route,{recursive:true,force:true}));
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:900,height:760}});
 page.on('pageerror',e=>console.log('PAGE ERROR',e.message));
 for(const kind of ['hero','movement','experiences','wellness','community']){
  await page.goto('http://localhost:3000/studio-export?scene='+kind);
  await page.waitForSelector('html[data-export-ready=true]',{timeout:60000});
  const data=await page.locator('canvas').evaluate(el=>el.toDataURL('image/png'));
  await sharp(Buffer.from(data.split(',')[1],'base64')).webp({quality:90}).toFile('public/studio/'+kind+'.webp');
  console.log(kind,fs.statSync('public/studio/'+kind+'.webp').size);
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
