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
  const rooms = [] /* id, theme, limit_time, ideas{id, text}, counter */
  const io = require('socket.io').listen(server)

  io.on('connection', (socket) => {

    // ルーム作成
    socket.on('create-room', ()  => {
      const repeat_count = 10
      for (let i = 0; i < repeat_count; i++) {
        const room_id = Math.floor( Math.random() * 100000000 )
        // まだsocket roomsに存在しないroom_idになったらルームを作る
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
            ideas: [],
            counter: 0
          })
          // clientにroom_idを通知する
          io.to(socket.id).emit('reply-for-create-room', { isCreated: true, room_id: room_id })
          break
        }
        if (i == repeat_count - 1) {
          // repeat_count中にルームを作れなかったら、clientにルーム作成の失敗を通知する
          io.to(socket.id).emit('reply-for-create-room', { isCreated: false })
        }
      }
    })

    // テーマを設定
    socket.on('set-theme', req => {
      // req = { room_id, theme }
      const room = rooms.find((room) => room.id == req.room_id)
      room.theme = req.theme
      io.in(room.id).emit('update-theme', { theme: room.theme })
    })

    // ルームに参加
    socket.on('join-room', room_id => {
      const room = rooms.find((room) => room.id == room_id)
      if (room) {
        socket.join(room_id)
        io.to(socket.id).emit('reply-for-join-room', true, room.theme, room.limit_time)
        io.to(socket.id).emit('update-ideas', room.ideas)
        io.in(room_id).emit('update-members', io.sockets.adapter.rooms[room_id].length)
      } else {
        io.to(socket.id).emit('reply-for-join-room', false, null, null)
      }
    })

    // ルームからぬける
    socket.on('leave-room', room_id => {
      const room = io.sockets.adapter.rooms[room_id]
      if (room) {
        socket.leave(room_id)
        socket.to(room_id).emit('update-members', room.length)

        if (room.length < 1) {
          rooms.filter((room, index) => {
            if (room.id == room_id) {
              rooms.splice(index, 1)
            }
          })
        }
      } else {
      }
    })

    // ブレストを開始する
    socket.on('start', room_id => {
      io.in(room_id).emit('start')
    })

    // アイデアを追加する
    socket.on('add-idea', req => {
      // req = { room_id, idea }
      const room = rooms.find((room) => room.id == req.room_id)
      room.ideas.push({
        id: `${socket.id}-${room.counter++}`,
        text: req.idea
      })
      io.in(room.id).emit('update-ideas', room.ideas)
    }) 

    // アイデアの順番を入れ替える
    socket.on('sort-idea', (room_id, idea_id, new_index) => {
      const room = rooms.find((room) => room.id == room_id)
      room.ideas.filter((idea, index) => {
        if (idea.id == idea_id) {
          room.ideas.splice(index, 1)
          room.ideas.splice(new_index, 0, idea)
        }
      })
      io.in(room_id).emit('update-ideas', room.ideas)
    })

    // アイデアを削除する
    socket.on('remove-idea', (room_id, idea_id) => {
      const room = rooms.find((room) => room.id == room_id)
      room.ideas.filter((idea, index) => {
        if (idea.id == idea_id) {
          room.ideas.splice(index, 1)
        }
      })
      io.in(room_id).emit('update-ideas', room.ideas)
    })
  })
}

start()
