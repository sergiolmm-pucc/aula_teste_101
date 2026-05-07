const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// Garante que o diretório de screenshots existe
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let driver;
let passCount = 0;
let failCount = 0;
const results = [];

async function screenshot(name) {
  try {
    const img = await driver.takeScreenshot();
    const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    fs.writeFileSync(filePath, img, 'base64');
    console.log(`  📸 Screenshot: screenshots/${name}.png`);
    return filePath;
  } catch (e) {
    console.warn(`  ⚠️  Não foi possível tirar screenshot: ${e.message}`);
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function log(msg) { console.log(msg); }

async function assert(condition, message) {
  if (!condition) throw new Error(`ASSERT FALHOU: ${message}`);
}

async function runTest(name, fn) {
  log(`\n▶  ${name}`);
  try {
    await fn();
    log(`  ✅ PASSOU`);
    passCount++;
    results.push({ name, status: 'PASS' });
  } catch (err) {
    log(`  ❌ FALHOU: ${err.message}`);
    failCount++;
    results.push({ name, status: 'FAIL', error: err.message });
    try { await screenshot(`ERRO_${name.replace(/\s+/g, '_')}`); } catch (_) {}
  }
}

async function setup() {
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
}

async function teardown() {
  if (driver) await driver.quit();
}

/* ─────────────────────────────────────────
   TESTES
───────────────────────────────────────── */

async function testLoginInvalido() {
  await runTest('TC02 - Login com credenciais inválidas exibe erro', async () => {
    await driver.get(BASE_URL + '/login');
    await screenshot('TC02_antes_login_invalido');

    await driver.findElement(By.id('username')).sendKeys('wrong');
    await driver.findElement(By.id('password')).sendKeys('wrong');
    await screenshot('TC02_campos_preenchidos');

    await driver.findElement(By.id('loginForm')).submit();
    await sleep(800);
    await screenshot('TC02_depois_erro');

    const errMsg = await driver.findElement(By.css('.erro')).getText();
    assert(errMsg.includes('inválidos'), `Deve exibir mensagem de erro, mas exibiu: "${errMsg}"`);
  });
}

/* ─────────────────────────────────────────
   RUNNER PRINCIPAL
───────────────────────────────────────── */

async function main() {
  console.log(`  🌐 URL: ${BASE_URL}`);
  console.log(`  📁 Screenshots: ${SCREENSHOTS_DIR}`);

  try {
    await setup();

    // Executa todos os testes em sequência
    await testLoginInvalido();
  //  await testDashboardCarregado();
   // await testCalculoBasico();
  } finally {
    await teardown();
  }

  process.exit(0);  // ok
}
console.log("iniciando");
main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
