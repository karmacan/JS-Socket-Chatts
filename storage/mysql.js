const mysql = require('mysql');

// Database warapper class 
// extends mysql created connection 
// thus allowing to use
// promise/then/catch and async/await 
// on db query

class Database {
  constructor(config) {
    this.db = mysql.createConnection(config);

    this.db.on('error', (err) => {
      if (!err.fatal) return;
      //if (err.code === "PROTOCOL_CONNECTION_LOST") this.disconnect();
      this.db.destroy();
    });

    this.db.connect();
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.db.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.end(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

////////////////////////////////////////
// CONNECT DB

let db;

if (process.env.NODE_ENV === 'production') {
  db = new Database({
    host: 'us-cdbr-iron-east-01.cleardb.net',
    user: 'b54d128e57063a',
    password: '31ad088e',
    database: 'heroku_fe54a47bfdd445f'
  });
}
else {
  db = new Database({
    host: 'localhost',
    user: 'root',
    database: 'db_chat'
  });
}

// * Truncate users on server restart (empty rooms)
truncUsers();

// * Create tables if not exists
db.query(`
  CREATE TABLE IF NOT EXISTS tb_users (
    id varchar(45) NOT NULL,
    username varchar(45) DEFAULT NULL,
    room varchar(45) DEFAULT NULL,
    PRIMARY KEY (id)
  );
`);
db.query(`
  CREATE TABLE IF NOT EXISTS tb_messages (
    id int NOT NULL AUTO_INCREMENT,
    user varchar(45) DEFAULT NULL,
    room varchar(45) DEFAULT NULL,
    message varchar(45) DEFAULT NULL,
    time varchar(45) DEFAULT NULL,
    PRIMARY KEY (id)
  );
`);

////////////////////////////////////////
// QUERIES EXPORTS

/// USERS

async function truncUsers() {
  await db.query('TRUNCATE db_chat.tb_users');
}

async function logUsers() {
  const sql = `SELECT * FROM tb_users`;

  // db.query(sql, (err, res) => {
  //   if (err) return console.log(err); // console.log and return
  //   console.log(res);
  // });

  const res = await db.query(sql);
  console.log(res);
}

async function userJoin(id, username, room) {
  const sql = `
    INSERT INTO
    tb_users (id, username, room)
    values ('${id}', '${username}', '${room}')
  `;

  await db.query(sql);
  
  const res = await db.query(`SELECT * FROM tb_users WHERE id = '${id}'`);
  return res[0]; // newly joined user
}

async function userLeave(id) {
  const res = await db.query(`SELECT * FROM tb_users WHERE id = '${id}'`);
  if (!res[0]) return;
  const user = res[0]; // leaving user

  const sql = `
    DELETE FROM tb_users
    WHERE id = '${id}'
  `;

  await db.query(sql);
  return user;
}

async function getRoomUsers(room) {
  const sql = `
    SELECT * FROM tb_users
    WHERE room = '${room}'
  `;

  return await db.query(sql); // users
}

async function getUserById(id) {
  const res = await db.query(`SELECT * FROM tb_users WHERE id = '${id}'`);
  return res[0];
}

async function getRoomUserByName(room, name) {
  const sql = `
    SELECT * FROM tb_users
    WHERE room = '${room}' AND username = '${name}'
  `;
  const res = await db.query(sql);
  return res[0];
}

/// MESSAGES

async function messageStore(room, {username, msg, time}) {
  const sql = `
    INSERT INTO
    tb_messages (user, room, message, time)
    values ('${username}', '${room}', '${msg}', '${time}')
  `;
  await db.query(sql);
}

async function getRoomMessages(room) {
  const sql = `
    SELECT * FROM tb_messages
    WHERE room = '${room}'
  `;

  return await db.query(sql); // messages
}

module.exports = {
  truncUsers,
  logUsers,
  userJoin,
  userLeave,
  getRoomUsers,
  getUserById,
  getRoomUserByName,
  messageStore,
  getRoomMessages
}