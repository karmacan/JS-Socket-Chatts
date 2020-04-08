// Set audio
$(document).ready(() => {
  const audio = new Audio('http://localhost:5000/lost-star.mp3');
  audio.volume = 0.1;
  audio.play();
});

////////////////////////////////////////
/// VALID JOIN

const elForm = document.querySelector('form');
const elUsername = document.querySelector('#username');
const elRoom = document.querySelector('#room');

elForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();

  const queryParams = `?username=${elUsername.value}&room=${elRoom.value}`;

  const opts = {
    headers: {'Content-Type': 'application/json'}
  };

  const res = await fetch(`${_proxy}/api/user${queryParams}`, opts); // _proxy comes from _global.js included in index.html
  
  // Check if user in the room
  if (res.status === 400) {
    const resBody = await res.json();
    _alert(resBody.msg);
    return;
  }

  /// REDIRRECT
  window.location.href = `/chat${queryParams}`;
});