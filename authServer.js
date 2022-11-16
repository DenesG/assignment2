
const express = require("express")
const { handleErr } = require("./errorHandler.js")
const { asyncWrapper } = require("./asyncWrapper.js")
const dotenv = require("dotenv")
dotenv.config();
const userModel = require("./userModel.js")
const tokenModel = require("./tokens.js")
const { connectDB } = require("./connectDB.js")
const {
    PokemonBadRequest,
    PokemonDbError
  } = require("./errors.js")

var cookieParser = require('cookie-parser');

const secret = '795e7f4982353c677fb869b27cf8752e42925594c1762ee4370fa6cf591f29054e9525f93e1a38b74c7be3be3815e3109da59cf785346b652d51ba5fee49a0c0'

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://denesg:chebu997@cluster0.mcn7j6b.mongodb.net/MyDatabase?retryWrites=true&w=majority";


const app = express()

const start = asyncWrapper(async () => {
  await connectDB();


  app.listen(process.env.authServerPort, (err) => {
    if (err)
      throw new PokemonDbError(err)
    else
      console.log(`Phew! Server is running on port: ${process.env.authServerPort}`);
  })
})
start()

app.use(express.json())


const bcrypt = require("bcrypt")
app.post('/register', asyncWrapper(async (req, res) => {
  const { username, password, email, admin } = req.body
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const id = require("crypto").randomBytes(64).toString("hex")
  const token = jwt.sign({ _id: id }, secret)
  if(admin == "true") {
    const userWithHashedPassword = { ...req.body, password: hashedPassword, admin: true, token: token, token_id: id}
    const user = await userModel.create(userWithHashedPassword)
    res.send(user)
  }
  else {
    const userWithHashedPassword = { ...req.body, password: hashedPassword, admin: false, token: token, token_id: id}
    const user = await userModel.create(userWithHashedPassword)
    res.send(user)
  }
  

 
  
}))

app.use(cookieParser());
const jwt = require("jsonwebtoken");
const { raw } = require("express");

app.post('/login', asyncWrapper(async (req, res) => {
  const { username, password } = req.body
  const user = await userModel.findOne({ username })
  if (!user) {
    throw new PokemonBadRequest("User not found")
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    throw new PokemonBadRequest("Password is incorrect")
  }
  if(user.admin) {
    const token = {token: user.token, admin: true}
    const token_entry = await tokenModel.create(token)
  }
  else {
    const token = {token: user.token, admin: false}
    const token_entry = await tokenModel.create(token)
  }
  
  res.send(user)
  
}))

app.post('/logout', asyncWrapper(async (req, res) => {
    const { username, password } = req.body
    const user = await userModel.findOne({ username })
    if (!user) {
    throw new PokemonBadRequest("Not logged in")
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    throw new PokemonBadRequest("Password is incorrect")
  }

  const doc = await tokenModel.findOneAndRemove({ token: user.token })
  res.clearCookie("auth-token")
  res.send("Cookie has been cleared")

    }))

app.use(handleErr)