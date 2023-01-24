const otpService = require("../services/otp-service");
const hashService = require("../services/hash-service");
const userService = require("../services/user-service");
const tokenService = require("../services/token-service");
const UserDto = require("../dtos/user-dto");

class AuthController {
  async sendOtp(req, res) {
    const { phone } = req.body;

    /**Phone number required check */
    if (!phone) {
      res.status(400).json({ message: "Phone field is required" });
    }

    /**Generating otp */
    const otp = await otpService.generateOtp();

    /**Hashing Otp */
    const ttl = 1000 * 60 * 3; //3min expire time
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = hashService.hashOtp(data);

    /**Sending Otp */
    try {
      await otpService.sendBySms(phone, otp);
      res.json({
        hash: `${hash}.${expires}`,
        phone,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Otp sending failed" });
    }
  }

  /******** **************/

  /**Verify Otp */
  async verifyOtp(req, res) {
    const { otp, hash, phone } = req.body;
    if (!otp || !hash || !phone) {
      res.status(400).json({ message: "All fields are required" });
    }
    const [hashedOtp, expires] = hash.split(".");
    if (Date.now() > +expires) {
      res.status(400).json({ message: "OTP expired" });
    }
    const data = `${phone}.${otp}.${expires}`;
    const isValid = otpService.verifyOtp(hashedOtp, data);
    if (!isValid) {
      res.status(400).json({ message: "Invalid OTP" });
    }

    /**Finding User in db */
    let user;

    try {
      user = await userService.findUser({ phone });
      if (!user) {
        user = await userService.createUser({ phone });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Database Error" });
    }

    /**Generating token */
    const { accessToken, refreshToken } = tokenService.generateTokens({
      _id: user._id,
      activated: false,
    });

    ///Storing refresh token in db
    await tokenService.storeRefreshToken(refreshToken, user._id);

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    const userDto = new UserDto(user); //Modifying user properties;

    res.json({ user: userDto, auth: true });
  }

  /**Refreshing access token */

  async refresh(req, res) {
    //We will get refresh token from cookie
    const { refreshToken: refreshTokenFromCookie } = req.cookies;

    //Then check whether token is valid or not
    let userData;
    try {
      userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
    } catch (err) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    //Check whether this token exist in db or not
    try {
      const token = await tokenService.findRefreshToken(
        userData._id,
        refreshTokenFromCookie
      );
      if (!token) {
        return res.status(401).json({ message: "Invalid Token" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Token not found" });
    }

    //Check if valid user
    const user = await userService.findUser({ _id: userData._id });
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    //Generate new tokens
    const { accessToken, refreshToken } = tokenService.generateTokens({
      _id: userData._id,
    });

    //Update Refresh token
    try {
      await tokenService.updateRefreshToken(userData._id, refreshToken);
    } catch (err) {
      return res.status(500).json({ message: "Internal Error" });
    }

    //Putting tokens in cookie
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    const userDto = new UserDto(user); //Modifying user properties;

    res.json({ user: userDto, auth: true });
  }

  /**Logout user */
  async logout(req, res) {
    const { refreshToken } = req.cookies;
    //Deleting refresh token from db
    await tokenService.removeToken(refreshToken);

    //Deleting cookies
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.json({ user: null, auth: false });
  }
}

module.exports = new AuthController();
