var express = require("express");
var parser = require('body-parser');
var redis = require("redis");
var UserModel = require("./app/models/user.js");


var app = express();
var redisClient = redis.createClient();
var userHandler = new UserModel();

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

var port = process.env.NODE_REST_PORT || 8999;

var router = express.Router(); 

router.get("/", function (request, response) {
    console.log("processing / request");
    response.json({ "app": "node-rest", "version": "1.0.0" });  
});

// auth middleware
router.use(function (request, response, next) {
    console.log("Authenticated user");
    next();
});

// user rest stuff
router.route("/users")
.get(function (request, response) {
    userHandler.getUsers(redisClient, response);
}).post(function (request, response) {
    var user = {
        "userId" : request.body.userId,
        "name" : request.body.name,
    }
    userHandler.addUser(redisClient, user.userId, user);
    response.json({ message : "ok" })
});

router.route("/users/:userId")
.get(function (request, response) {
    userHandler.getUser(redisClient, request.params.userId, response);
})
.delete(function (request, response) {
    userHandler.deleteUser(redisClient, request.params.userId, response);
})
.put(function (request, response) {
    var content = {
        "name" : request.body.name,
    }
    userHandler.updateUser(redisClient, request.params.userId, content, response);
});

app.use("/api", router);
app.listen(port);

console.log("RESTful API started on localhost an listenning on " + port);