const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await nuxt.ready()
  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  const server = app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
  socketStart(server)
  console.log('socket.io started.')
}

function socketStart(server) {
  const rooms = [] /* id, theme, limit_time, idea_count */
  const io = require('socket.io').listen(server)

  io.on('connection', (socket) => {
    console.log(`socket ${socket.id} connected.`)

    // ルーム作成
    socket.on('create-room', (theme, limit_time)  => {
      const repeat_count = 10
      for (let i = 0; i < repeat_count; i++) {
        const room_id = Math.floor( Math.random() * 100000000 )
        // まだ存在しないroom_idになったらルームを作る
        if (!io.sockets.adapter.rooms[room_id]) {
          // もしroomsに同じroom_idのオブジェクトが残っていたら削除する
          rooms.filter((room, index) => {
            if (room.id == room_id) {
              rooms.splice(index, 1)
            }
          })
          // roomsにroom情報を追加する
          rooms.push({
            id: room_id,
            theme: theme,
            limit_time: limit_time,
            idea_count: 0
          })
          // clientにroom_idを通知する
          io.to(socket.id).emit('reply-for-create-room', true, room_id)
          console.log(`socket ${socket.id} created room ${room_id}.`)
          break
        }
        if (i == repeat_count - 1) {
          // repeat_count中にルームを作れなかったら、clientにルーム作成の失敗を通知する
          io.to(socket.id).emit('reply-for-create-room', false, null)
          console.log(`socket ${socket.id} failed to create room.`)
        }
      }
    })

    // ルームに参加
    socket.on('join-room', room_id => {
      const room = rooms.find((room) => room.id == room_id)
      if (room) {
        socket.join(room_id)
        io.to(socket.id).emit('reply-for-join-room', true, room.theme, room.limit_time)
        io.in(room_id).emit('update-members', io.sockets.adapter.rooms[room_id].length)
        console.log(`socket ${socket.id} joined room ${room_id}`)
      } else {
        io.to(socket.id).emit('reply-for-join-room', false, null, null)
        console.log(`socket ${socket.id} failed to join room ${room_id}`)
      }
    })

    // ルームからぬける
    socket.on('leave-room', room_id => {
      const room = io.sockets.adapter.rooms[room_id]
      if (room) {
        socket.leave(room_id)
        socket.to(room_id).emit('update-members', room.length)
        console.log(`socket ${socket} left from room ${room_id}`)

        if (room.length < 1) {
          rooms.filter((room, index) => {
            if (room.id == room_id) {
              rooms.splice(index, 1)
            }
          })
        }
      } else {
        console.log(`socket ${socket} failed to leave from room ${room_id}`)
      }
    })

    // ブレストを開始する
    socket.on('start', room_id => {
      io.in(room_id).emit('start')
      console.log(`socket ${socket} started to bs on room ${room_id}`)
    })

    // アイデアを追加する
    socket.on('add-idea', (room_id, idea) => {
      const room = rooms.find((room) => room.id == room_id)
      io.in(room_id).emit('add-idea',
        {
          id: `${socket.id}-${room.idea_count}`,
          text: idea
        }
      )
      room.idea_count++
      console.log(`socket ${socket.id} add idea ${idea} to room ${room_id}`)
    }) 

    // アイデアを削除する
    socket.on('remove-idea', (room_id, idea_id) => {
      io.in(room_id).emit('remove-idea', idea_id)
      console.log(`socket ${socket.id} remove idea ${idea_id} from room ${room_id}`)
    })
  })
}

start()
