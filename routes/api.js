const express = require('express');
const router = express.Router(); // module.exports !!!

const {
  getRoomUserByName,
  getRoomMessages
} = require('../storage/mysql');

router.get('/user'/*?username=xxx&room=xxx*/, async (req, res) => {
  const username = req.query.username;
  const room = req.query.room;

  const user = await getRoomUserByName(room, username);

  if (user) return res.status(400).json({msg: 'User already in room!'});

  return res.sendStatus(200);
});

router.get('/messages/:room', async (req, res) => {
  const messages = await getRoomMessages(req.params.room);
  if (!messages) return res.end();
  return res.status(200).json({messages});
});

module.exports = router;