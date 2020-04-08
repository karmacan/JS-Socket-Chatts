const express = require('express');
const router = express.Router(); // !!! module.exports

const path = require('path'); // path.resolve allows to use relative (../) paths

router.get('/', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../public/index.html`)); // on send file use __dirname instead of ./
});

router.get('/chat', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../public/chat.html`));
});

module.exports = router;