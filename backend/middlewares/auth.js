const jwt = require('jsonwebtoken'); // ✅ typo: should be 'jsonwebtoken', not 'jsonwebtokens'
require('dotenv').config();

function verifyToken(req, res, next) {                              console.log("in auth");
  const authHeader = req.headers['authorization']; // ✅ headers are lowercase

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(' ')[1]; // ✅ extract token after "Bearer"

  if (!token) {
    return res.status(401).json({ message: "Token malformed" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user; // attach decoded user info to request
    next();          // ✅ VERY important: allow the next middleware/route to run
  });
}

module.exports = verifyToken;
