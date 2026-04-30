const jwt = require('jsonwebtoken');

const verifyWebSocketToken = (protocol) => {
  if (!protocol) {
    return null;
  }

  try {
    const decoded = jwt.verify(protocol, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = { verifyWebSocketToken };
