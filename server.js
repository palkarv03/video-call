// Importing the modules
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid'); // Using the latest version of unique Id
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// Setting the view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);

// Rendering the HTML files
app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

// Creating the API
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

// Establishing the socket connection
io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', message);
    });
  });
});

// Listening to port
const PORT = process.env.port || 5000;
server.listen(PORT, () => console.log(`Server Listening on Port ${PORT}`));
