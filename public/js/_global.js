// In order to use of _global varibles in other scripts,
// _global file must be included in target html
// before other js scripts of target

const _proxy = 'http://localhost:5000';

function _alert(msg = 'Something went wrong!') {
  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.innerHTML = `
    <h2>Alert</h2>
    <p>${msg}</p>
  `;
  document.querySelector('body').appendChild(alert);

  setTimeout(() => {
    document.querySelector('body').removeChild(alert);
  }, 2000);
}