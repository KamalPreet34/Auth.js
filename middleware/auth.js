const jwt = require("jsonwebtoken");
const { Blacklist } = require("../model/blacklist");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const auth = async (req, res, next) => {
  // verify accessToken
  // check if it is not blacklisted
  // then call next
  const { pscAccessToken } = req.cookies;
  const isTokenBlacklisted = await Blacklist.findOne({ token: pscAccessToken });
  if (isTokenBlacklisted)
    return res.status(400).send({ msg: "Please login..." });

  jwt.verify(
    pscAccessToken,
    "jwtsecretkeyfromenvfile",
    async (err, decoded) => {
      if (err) {
        if (err.message === "jwt expired") {
          const newAccessToken = await fetch(
            "http://localhost:8080/auth/refresh-token",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: req.cookies.pscRefreshToken,
              },
            }
          ).then((res) => res.json());
          res.cookie("pscAccessToken",newAccessToken,{maxAge:2000*60});
          next();
        }
      } else {
        console.log(decoded);
        next();
      }
    }
  );
};


module.exports = { auth };
