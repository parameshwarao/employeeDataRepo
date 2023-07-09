let _http = require('http');
let socketio = require('socket.io');
let httpServer;
let io;

const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const redis = require("redis");

const config = require('config');

const socketAuth = require('../middleware/socketAuth');



const redisConfigurationKeys = {
    _password: config.get("redisPassword"),
    _host: config.get("redisHost"),
    _port: config.get("redisPort")
};

//util

const _formatMessage = require("./../libs/channelLib").formatMessage;
const _getLoggedUserInfo = require("./../libs/channelLib").loggerUserdetails;

//pull out create server from redis import
const { createClient } = redis;
let redisClient;

//common group
const groupChatRoom = "commonGroup";

let sendExistingStoredMessages = async (socket) => {
    let chatData = await redisClient.LRANGE("chatMessages", "0", "-1");


    if (chatData && chatData.length > 0) {
        chatData.map(chatmessageObject => {
            let chatMessageObject = JSON.parse(chatmessageObject);

            //pull out all data
            let { userid, message, messageType } = chatMessageObject;



            socket.emit("message", _formatMessage(userid, message, messageType));
        });

    }
}

let redisClientInstanceWithAdapter = async (socketIOInstance) => {
    try {
        let pubClient = createClient({
            password: redisConfigurationKeys._password,
            socket: {
                host: redisConfigurationKeys._host,
                port: redisConfigurationKeys._port
            }
        });
        await pubClient.connect();
        console.log('Redis DB Connected for pub /sub..');
        let subClient = pubClient.duplicate();
        socketIOInstance.adapter(createAdapter(pubClient, subClient));

    }
    catch (err) {
        console.error(err.message);
        //exit process with failure
        process.exit(1);

    }

}

//to redis db CRUD
let redisDBClient = async () => {
    try {
        redisClient = createClient({
            password: redisConfigurationKeys._password,
            socket: {
                host: redisConfigurationKeys._host,
                port: redisConfigurationKeys._port
            }
        });
        await redisClient.connect();
        console.log('Redis DB Connected for CRUD..');
    }
    catch (err) {
        console.error(err.message);
        //exit process with failure
        process.exit(1);

    }

}


let socketInstance = (app) => {
    httpServer = _http.createServer(app);

    //enable cors for socket io
    io = socketio(httpServer, {
        cors: {
            origin: '*',
        }
    });

    //redis client for pub/sub

    redisClientInstanceWithAdapter(io);

    //redis client for crud
    redisDBClient();

    io.on("connection", (socket) => {


        //single client
        //socket.emit("message","welcome");

        //send existing messages
        sendExistingStoredMessages(socket);





        //grounchat join event
        socket.on("groupChatJoin", (socketObject) => {
            //join user to common chat room
            socket.join(groupChatRoom);
            let { username } = socketObject;



            //broadcast to everyone except the client
            socket.broadcast.to(groupChatRoom).emit("message", _formatMessage(username, `${username} has joined`, `joined`));
        });

        socket.on("messages", ({ from, message }) => {
            let messageObject = JSON.stringify(_formatMessage(from, message, `chatMessage`));
            redisClient.rPush("chatMessages", messageObject);

            //emit to everyone client
            io.in(groupChatRoom).emit("message", _formatMessage(from, message, `chatMessage`));

        });

        socket.on("userIdle", ({ username }) => {

            //emit to everyone client
            io.in(groupChatRoom).emit("message", _formatMessage(username, `${username} is idle!`, `userIdle`));

        });


        socket.on("disconnect", async () => {



            if (socket.user && socket.user.id) {
                //pull out user id
                let leftUsername = "";
                let { user: { id } } = socket;

                let userDetails = await _getLoggedUserInfo(id);



                if (userDetails) {
                    let { name } = userDetails;
                    leftUsername = name;
                }

                //emit to everyone client
                io.in(groupChatRoom).emit("message", _formatMessage(leftUsername, `${leftUsername} has left`, `left`));

            }


        });

    });



    const PORT = process.env.PORT || 5000;

    httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));

}

module.exports = socketInstance;