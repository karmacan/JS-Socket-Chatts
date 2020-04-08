const moment = require('moment');

module.exports = objectMessage = (username = 'Chat Bot', msg) => {
  return {
    username,
    msg,
    time: moment().format('h:mm a')
  };
}