////////////////////////////////////////
/// CONNECT SOCKET

// CONNECT TO SERVER (trigger connection on listener)
// const socket = io.connect('http://localhost:5000'); // socket is client itself 
const socket = io.connect(_proxy); // socket is client itself 

/// THROW EVENT |test| (with null) [to server]
//socket.emit('_check', null);

/// CATCH EVENT |test| (with null)
//socket.on('_roger', () => console.log('Server roger success!'));

////////////////////////////////////////
/// JOIN ROOM

const getUrlParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

const joinObject = {
  username: getUrlParam('username'),
  room: getUrlParam('room')
};

/// THROW EVENT (with object)
socket.emit('_join', joinObject);

////////////////////////////////////////
/// REJOIN ON RECONNECT

let hostId = '-1';

socket.on('reconnect', () => {
  socket.emit('_join', joinObject);
  hostId = '-1';
});

////////////////////////////////////////
/// UPDATE SIDEBAR

const elRoom = document.querySelector('#room');
const elSelf = document.querySelector('#self');
const elUsers = document.querySelector('#users');

/// CATCH EVENT (with object)
socket.on('_update', ({ room, selfId = '-1', users}) => {
  elRoom.textContent = room;
  elUsers.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement("li");
    // If coming become a page host
    if (selfId === user.id && hostId === '-1') {
      elSelf.innerText = '• ' + user.username;
      hostId = user.id;
    }
    // If one is alredy a page host
    else if (user.id === hostId) {
      null;
    }
    // 
    else {
      li.innerText = user.username;
      elUsers.appendChild(li);
    }
  });
});

////////////////////////////////////////
/// EMMIT MESSAGE

const elChatForm = document.querySelector('#chat-form');

elChatForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const elInputMsg = ev.target.elements.msg; // by id (msg)
  const msg = elInputMsg.value;

  /// THROW EVENT (with string) [to server for passing it further to all]
  socket.emit('_message', msg);
  
  elInputMsg.value = ''; // empty input
  elInputMsg.focus(); // set focus
});

////////////////////////////////////////
/// RECIEVE MESSAGE

const renderMessage = (data) => {
  const { username, msg, time } = data;
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
    <div class="message">
      <p class="meta">${username} <span>${time}</span></p>
      <p class="text">${msg}</p>
    </div>
  `;

  const elChatMessages = document.querySelector('.chat-messages');
  elChatMessages.appendChild(div);

  elChatMessages.scrollTop = elChatMessages.scrollHeight; // scroll focus on last
}

/// CATCH EVENT (with object)
socket.on('_message', (data) => {
  renderMessage(data);
});

////////////////////////////////////////
/// RETRIVE MESSAGES (http) [once on page load]
 
window.addEventListener("load", async () => {
  const res = await fetch(`${_proxy}/api/messages/${getUrlParam('room')}`);
  const { messages } = await res.json();
  if (!messages) return;
  messages.forEach(({user, message, time}) => {
    const data = { username: user, msg: message, time };
    renderMessage(data);
  });
});
