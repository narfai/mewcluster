document.addEventListener("DOMContentLoaded", function(event) {
  var socket = io();
  socket.on('message', function(data){
    console.log('server say '+data);
  });
  document.querySelector('form').addEventListener('submit', function(event){
    //event.stopImmediatePropagation();
    event.preventDefault();
    var data = document.getElementById('data').value;
    console.log('Send', data, ' to server');
    socket.emit('message', data);
  });
});
