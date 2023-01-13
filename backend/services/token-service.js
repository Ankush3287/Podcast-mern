const jwt = require("jsonwebtoken");
const RefreshModel = require("../models/refresh-model");
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn: "1m",
    });
    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
      expiresIn: "1y",
    });
    return { accessToken, refreshToken };
  }

  async storeRefreshToken(token, userId) {
    try {
      await RefreshModel.create({
        token,
        userId,
      });
    } catch (err) {
      console.log(err.message);
    }
  }

  /**Verify Access Token */
  async verifyAccessToken(token) {
    return jwt.verify(token, accessTokenSecret);
  }

  /**Verify Refresh Token */
  async verifyRefreshToken(refreshToken) {
    return jwt.verify(refreshToken, refreshTokenSecret);
  }

  /**Find Refresh Token in DB */
  async findRefreshToken(userId, refreshToken) {
    return await RefreshModel.findOne({ userId: userId, token: refreshToken });
  }

  //Updating refresh token
  async updateRefreshToken(userId, refreshToken) {
    return await RefreshModel.updateOne(
      { userId: userId },
      { token: refreshToken }
    );
  }

  /**Remove token */
  async removeToken(refreshToken) {
    return await RefreshModel.deleteOne({ token: refreshToken });
  }
}

module.exports = new TokenService();
