// npm i express
// npm i socket.io

// Public folder is ment to be a container
// for assets that are referensed
// in sent to client index.html
// or other already sent assets (css, js).
// In order to maintain logical consistensy
// index.html itself may be placed in public folder.

const objectMessage = require('./util/helpers');

////////////////////////////////////////
/// SETUP SERVER

const express = require('express');

//const server = express();
const exp = express();
const http = require('http');
const server = http.createServer(exp);

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`[_dev_] Server is running on port ${port}...`);
});

////////////////////////////////////////
/// MIDDLEWARE

/// Add contents access to client (sent public res) from domain root
exp.use(express.static(`${__dirname}/node_modules`)); // node modules (script src) [index.html]
exp.use(express.static(`${__dirname}/public/css`)); // stylesheets (link href) [index.html]
exp.use(express.static(`${__dirname}/public/imgs`)); // images (backround url) [style.css]
exp.use(express.static(`${__dirname}/public/audio`)); // audios (source src) [index.html]
exp.use(express.static(`${__dirname}/public/js`)); // scripts (script src) [index.html]

////////////////////////////////////////
/// SETUP ROTES

exp.use('/api', require('./routes/api.js')); // api
exp.use('', require('./routes/html.js')); // html

////////////////////////////////////////
/// DB

// const { _userJoin, _userLeave, _getRoomUsers, _getUserById } = require('./storage/_memory');

const {
  userJoin,
  userLeave,
  getRoomUsers,
  getUserById,
  messageStore
} = require('./storage/mysql');

////////////////////////////////////////////////////////////////////////////////
/// SETUP SOCKET
////////////////////////////////////////////////////////////////////////////////

const io = require('socket.io');
const listener = io.listen(server);

const connections = []; // clients

////////////////////////////////////////
/// CATCH CLIENT CONNECTION

listener.on('connection', (client) => {
  connections.push(client);
  console.log(`Client in! Connected ${connections.length}`);

  /// CATCH EVENT |test| (with null)
  //client.on('_check', () => console.log('Client check success!'));
  
  /// THROW EVENT |test| (with null) [only to current client]
  //client.emit('_roger', null);
 
  ////////////////////////////////////////
  // CATCH USER JOIN

  // Событие _join нужно 
  // так как сразу через событие connection 
  // нельзя передать данные от клиента к серверу

  client.on('_join', async ({ username, room }) => {
    const user = await userJoin(client.id, username, room); // db

    /// JOIN socket TO string key
    client.join(user.room);

    // THROW EVENT
    listener.to(user.room).emit('_update', {
      room: user.room,
      selfId: user.id,
      users: await getRoomUsers(room)
    });
  });
  
  ////////////////////////////////////////
  /// CATCH CLIENT DISCONNECT

  client.on('disconnect', async () => {
    connections.splice(connections.indexOf(client), 1);
    console.log(`Client out! Connected ${connections.length}`);

    const user = await userLeave(client.id); // db

    // If client connected but not joined (when server runs but client has already opened)
    if (!user) return;

    // THROW EVENT (with object) [to all clients but current]
    client.broadcast.to(user.room).emit('_update', {
      room: user.room,
      users: await getRoomUsers(user.room)
    });
  });

  ////////////////////////////////////////
  // CATCH MESSAGE (from current and emmit to all)

  client.on('_message', async (msg) => {
    const currentUser = await getUserById(client.id); // db
    
    const message = objectMessage(currentUser.username, msg);

    messageStore(currentUser.room, message); // db

    /// THROW EVENT (with object) [to all clients that join]
    listener.to(currentUser.room).emit('_message', message);
  });

});

