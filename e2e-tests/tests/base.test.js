const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// Garante que o diretório de screenshots existe
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });


async function main() {
  console.log(`  🌐 URL: ${BASE_URL}`);
  console.log(`  📁 Screenshots: ${SCREENSHOTS_DIR}`);

  try {
    const opts = new chrome.Options();
    opts.addArguments(
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1280,900',
      '--disable-gpu'
    );
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(opts)
      .build();
    await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });

    await driver.get(BASE_URL + '/login');
   
    try {
      name = "Antes login";
      const img = await driver.takeScreenshot();
      const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
      fs.writeFileSync(filePath, img, 'base64');
      console.log(`  📸 Screenshot: screenshots/${name}.png`);
    } catch (e) {
         console.warn(`  ⚠️  Não foi possível tirar screenshot: ${e.message}`);
    }
    await driver.findElement(By.id('username')).sendKeys('wrong');
    await driver.findElement(By.id('password')).sendKeys('wrong');
    try {
      name = "digitados os dados do login";
      const img = await driver.takeScreenshot();
      const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
      fs.writeFileSync(filePath, img, 'base64');
      console.log(`  📸 Screenshot: screenshots/${name}.png`);
    } catch (e) {
         console.warn(`  ⚠️  Não foi possível tirar screenshot: ${e.message}`);
    }
    await driver.findElement(By.id('loginForm')).submit();
    await new Promise(r => setTimeout(r, 800));
    
    try {
      name = "Depois do erro";
      const img = await driver.takeScreenshot();
      const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
      fs.writeFileSync(filePath, img, 'base64');
      console.log(`  📸 Screenshot: screenshots/${name}.png`);
    } catch (e) {
         console.warn(`  ⚠️  Não foi possível tirar screenshot: ${e.message}`);
    }
    const errMsg = await driver.findElement(By.css('.erro')).getText();
    if (!errMsg.includes('inválidos')) throw new Error(`ASSERT FALHOU: ${errMsg}`);    

  } finally {
    if (driver) await driver.quit();
  }

  
}
console.log("iniciando");
main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
