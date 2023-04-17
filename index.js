const express = require("express");
const cookieParser = require("cookie-parser");
const { connection } = require("./config/db");
const { userRouter } = require("./router/userrouter");
const { auth } = require("./middleware/auth");
const nodemailer = require("nodemailer");
const session = require("express-session");
require("dotenv").config();

// NODEMAILER TRANSPORTS CONFIGURATION
const trasports = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "inder39811@gmail.com",
    pass: process.env.GOOGLE_PASS,
  },
});
// OTP GENERATRO
function otpgenerator() {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    resave: true,
    secret: "your secret",
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.send("PSC");
});

app.use("/auth", userRouter);

app.get("/get-otp", async (req, res) => {
  const { email } = req.body; // person's email to which we want to send otp
  const otp = otpgenerator();
  trasports
    .sendMail({
      to: [email],
      from: "inder39811@gmail.com",
      subject: "OTP verification",
      text: `Your OTP for the password reset process is ${otp}`,
    })
    .then((result) => {
      console.log(result);
      req.session.OTP = otp;
      console.log(req.session.OTP, "LINE 57");
      res.send("Email sent");
    })
    .catch((err) => {
      console.log(err);
      console.log(err.message);
      res.send("Something wrong happend");
    });
});

app.get("/verify-otp", async (req, res) => {
  const { OTP } = req.query;
  const serverOtp = req.session.OTP;
  console.log(req.session);
  console.log(OTP, serverOtp);
  if (OTP == serverOtp) {
    /// provide a file which can reset the password
    res.send("OTP verified");
  } else {
    res.send("Wrong otp");
  }
});

app.get("/protected", auth, (req, res) => {
  res.send("Protected data");
});

app.listen(8080, async () => {
  try {
    await connection;
    console.log("LIsteing on 8080");
  } catch (error) {
    console.log(error.message);
  }
});

