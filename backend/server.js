require("dotenv").config();
const express = require("express");
const app = express();
const router = require("./routes");
const dbConnect = require("./database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ACTIONS = require("./actions");
const server = require("http").createServer(app);

/**Web socket setup */
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

/**Cookie-parser */
app.use(cookieParser());

const corsOption = {
  credentials: true,
  origin: ["http://localhost:3000"],
};
app.use(cors(corsOption));

app.use("/storage", express.static("storage")); //Middleware to serve static files from storage folder

const PORT = process.env.PORT || 5000;

/**Database Connection */
dbConnect();

app.use(express.json({ limit: "8mb" }));

app.use(router);

app.get("/", (req, res) => {
  res.send("Hello from expressjs");
});

/**Sockets */

//Mapping socket id with user
const socketUserMapping = {};

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
    socketUserMapping[socket.id] = user;

    //getting all connected clients in a room
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

    clients.forEach((clientId) => {
      //clientId means every user's(who are already connected) socket id
      io.to(clientId).emit(ACTIONS.ADD_PEER, {
        //sending ever client that is connected that this new user with socket id wants to connect
        peerId: socket.id,
        createOffer: false, //Clients don't have to create offer, I am joining so I will create offer
        user,
      });
      socket.emit(ACTIONS.ADD_PEER, {
        //sending to the user that wants to connect
        peerId: clientId, //Who all are going to connect with me(all the clients)
        createOffer: true,
        user: socketUserMapping[clientId],
      });
    });

    socket.join(roomId); //if there is no room with this roomId that means we are the first one here so it will create a new room(socket room) with this roomid
  });

  //Handle relay ice
  socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
    io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
      peerId: socket.id,
      icecandidate,
    });
  });

  //Hande relay sdp
  socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
    io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
      peerId: socket.id,
      sessionDescription,
    });
  });

  /**Handle Mute/Unmute */
  socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.MUTE, {
        peerId: socket.id,
        userId,
      });
    });
  });
  socket.on(ACTIONS.UN_MUTE, ({ roomId, userId }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      io.to(clientId).emit(ACTIONS.UN_MUTE, {
        peerId: socket.id,
        userId,
      });
    });
  });

  socket.on(ACTIONS.MUTE_INFO, ({ userId, roomId, isMute }) => {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    clients.forEach((clientId) => {
      if (clientId !== socket.id) {
        console.log("mute info");
        io.to(clientId).emit(ACTIONS.MUTE_INFO, {
          userId,
          isMute,
        });
      }
    });
  });

  //Leaving room

  const leaveRoom = () => {
    const { rooms } = socket;
    Array.from(rooms).forEach((roomId) => {
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      clients.forEach((clientId) => {
        io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
          peerId: socket.id,
          userId: socketUserMapping[socket.id]?._id,
        });
        // socket.emit(ACTIONS.REMOVE_PEER, {
        //   peerId: clientId,
        //   userId: socketUserMapping[clientId]?._id,
        // });
      });
      socket.leave(roomId);
    });

    delete socketUserMapping[socket.id];
  };
  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on("disconnecting", leaveRoom);
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
