const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true, 
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' 
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 800 });
  
  const destDir = '/Users/ayushagarwal/Documents/Web-Dev/SupportTicketDsahboard/screenshots';
  
  console.log('Taking home page screenshot...');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1500); // wait for fonts/render
  await page.screenshot({ path: `${destDir}/home_page.png` });
  
  console.log('Taking create form screenshot...');
  await page.goto('http://localhost:5173/tickets/new');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${destDir}/create_form.png` });
  
  console.log('Taking detail page screenshot...');
  await page.goto('http://localhost:5173/tickets/1');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${destDir}/detail_page.png` });
  
  await browser.close();
  console.log('Done.');
})();
