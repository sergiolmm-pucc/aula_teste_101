 inicializa o node
 npm init -y
 instala o selenium-webdriver

 atualiza package.json
   "test": "node tests/funcional.test.js",
   "test:ci": "APP_URL=http://localhost:3000 node tests/funcional.test.js"