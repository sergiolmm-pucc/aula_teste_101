const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


// checa se api no ar
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/tabelas', (req, res) => {
  const { TABELA } = require('./funcoes');
  res.json({
	success: true,
	data: {
		base: TABELA.BASE_CALC.faixas,
		referencia: `${TABELA.REFERENCIA * 100}%`,
	},
  });

});

module.exports = app


