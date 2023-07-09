const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (socket, next) {
  //GET token from header
  const token = socket.handshake.headers['x-auth-token'];

  //check if no token
  if (!token) {
    next(new Error("Error Validating Token"));
  }

  //verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtsSecret'));

    socket.user = decoded.user;
    next();
  } catch (err) {
    next(new Error("Error Validating Token"));
  }
};
