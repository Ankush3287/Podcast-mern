const crypto = require("crypto");

class HashService {
  hashOtp(data) {
    return crypto
      .createHmac("sha256", process.env.hash_secret)
      .update(data)
      .digest("hex");
  }
}

module.exports = new HashService();
