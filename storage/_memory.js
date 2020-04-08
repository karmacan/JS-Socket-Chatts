// Derecated by mysql db

const users = []; // all connected clients

function _userJoin(id, username, room) {
  const user = { id, username, room };
  users.push(user);
  return user;
}

function _userLeave(id) {
  const ix = users.findIndex(user => user.id == id);
  if (ix === -1) return;
  return users.splice(ix, 1)[0]; // returns spliced element
}

function _getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

function _getUserById(id) {
  return users.find(user => user.id === id);
}

module.exports = {
  _userJoin,
  _userLeave,
  _getUserById,
  _getRoomUsers
}