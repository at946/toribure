const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const rooms = []
/*
{
  id: Integer
  theme: String
  limit_time: String [sec]
  count: Integer [for id]
}
*/

io.on('connection', (socket) => {
  console.log(`socket_id: ${socket.id} connected.`)

  socket.on('check-room', room_id => {
    const room = io.sockets.adapter.rooms[room_id]
    if (room && room.length > 0) {
      io.to(socket.id).emit('reply-check-room', false, room_id)
      console.log('false')
    } else {
      io.to(socket.id).emit('reply-check-room', true, room_id)
      console.log('true')
    }
  })

  socket.on('create-room', (room_id, theme, limit_time) => {
    const room = rooms.find((room) => room.id == room_id)
    if (room) {
      room.theme = theme
      room.limit_time = limit_time
      room.count = 0
    } else {
      rooms.push({
        id: room_id,
        theme: theme,
        limit_time: limit_time,
        count: 0,
      })
    }
  })

  socket.on('join-room', (room_id) => {
    const room = rooms.find((room) => room.id == room_id)
    if (room) {
      socket.join(room_id)
      io.to(socket.id).emit('send-setting', room.theme, room.limit_time)
      io.in(room_id).emit('update-member-count', io.sockets.adapter.rooms[room_id].length)
      console.log(`socket ${socket.id} join to room ${room_id}`)  
    } else {
      io.to(socket.id).emit('no-room')
      console.log(`socket ${socket.id} tried to join to no existing room ${room_id}`)
    }
  })

  socket.on('leave-room', (room_id) => {
    const room = io.sockets.adapter.rooms[room_id]
    if (room) {
      socket.leave(room_id)
      socket.to(room_id).emit('update-member-count', room.length)
      console.log(`socket ${socket.id} left from room ${room_id}`)
      if (room.length <= 0) {
        rooms.filter((room, index) => {
          if (room.id == room_id) {
            rooms.splice(index, 1)
          }
        })
      }
    } else {
      console.log(`[Info] socket ${socket.id} attempts to leave no existing room ${room_id}`)
    }
  })

  socket.on('start-timer', (room_id) => {
    io.in(room_id).emit('start-timer')
    console.log(`socket ${socket.id} starts room ${room_id}`)
  })

  socket.on('add-idea', (idea, room_id) => {
    io.in(room_id).emit('add-idea', idea)
    console.log(`receive idea ${JSON.stringify(idea)} to room ${room_id}`)
  })

  socket.on('delete-idea', (idea_id, room_id) => {
    socket.to(room_id).emit('delete-idea', idea_id)
    console.log(`delete idea ${idea_id} in room ${room_id}`)
  })
})

server.listen(3001)
