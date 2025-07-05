const jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next) {                            console.log("in admin");
  if (!req.user || req.user.role !== "admin") {                                       
    return res.status(403).json({ message: "Need Admin Permission ❌" });
  }
  next(); // ✅ Allow if admin
}

module.exports = verifyAdmin;
