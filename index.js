const util = require('util');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send({ message: 'OK' });
});

app.listen(port, () => console.log(util.format('Listen %s', port)));
