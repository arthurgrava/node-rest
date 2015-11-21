var method = User.prototype;

function User() {
}

method.addUser = function (conn, userId, user) {
    conn.set("user_" + userId, JSON.stringify(user));
};

method.getUsers = function (conn, response) {
    conn.keys("user*", function (err, keys) {
        if (err) {
            console.log(err);
        }

        conn.mget(keys, function (err, values) {
            var list = [];
            for (var i = 0 ; i < values.length ; i++) {
                list = list.concat(JSON.parse(values[i]))
            }
            response.json({users:list});
        });
    });
};

method.getUser = function (conn, userId, response) {
    conn.get("user_" + userId, function (err, value) {
        if (err) {
            console.log(err);
        }

        response.json({user:JSON.parse(value)});
    });
}

method.deleteUser = function (conn, userId, response) {
    var key = "user_" + userId;
    conn.exists(key, function (err, exist) {
        if (exist == 1) {
            conn.del(key, function (err, eval) {
                response.json({message:"User " + userId + " deleted"});
            });
        } else {
            response.status(404).json({message:"User " + userId + " not found"});
        }
    });
}

method.updateUser = function (conn, userId, content, response) {
    var key = "user_" + userId;
    conn.exists(key, function (err, exist) {
        if (exist == 1) {
            conn.get(key, function (err, value) {
                var user = JSON.parse(value);
                user.name = content.name; // in this case lets assume it will only update the name
                conn.set(key, JSON.stringify(user), function (err, val) {
                    response.json({message:"User " + userId + " updated"});
                });
            });
        } else {
            response.status(404).json({message:"User " + userId + " not found"});
        }
    });
}

module.exports = User;
