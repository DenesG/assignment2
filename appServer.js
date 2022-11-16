const mongoose = require("mongoose")
const express = require("express")
const { connectDB } = require("./connectDB.js")
const { populatePokemons } = require("./populatePokemons.js")
const { getTypes } = require("./getTypes.js")
const { handleErr } = require("./errorHandler.js")
const tokenModel = require("./tokens.js")
const {
  PokemonBadRequest,
  PokemonBadRequestMissingID,
  PokemonBadRequestMissingAfter,
  PokemonDbError,
  PokemonNotFoundError,
  PokemonDuplicateError,
  PokemonNoSuchRouteError
} = require("./errors.js")

const { asyncWrapper } = require("./asyncWrapper.js")

const app = express()

const dotenv = require("dotenv")
dotenv.config();


const secret = '795e7f4982353c677fb869b27cf8752e42925594c1762ee4370fa6cf591f29054e9525f93e1a38b74c7be3be3815e3109da59cf785346b652d51ba5fee49a0c0'

const start = asyncWrapper(async () => {
    await connectDB();
    const pokeSchema = await getTypes();
    pokeModel = await populatePokemons(pokeSchema);

  
    app.listen(process.env.appServerPort, (err) => {
      if (err)
        throw new PokemonDbError(err)
      else
        console.log(`Phew! Server is running on port: ${process.env.appServerPort}`);
    })
  })
  start()
  app.use(express.json())

const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
  const token = req.query["token"]
  
  if (!token) {
    throw new PokemonBadRequest("Access denied")
  }
  try {
    const verified = jwt.verify(token, secret) // nothing happens if token is valid
    next()
  } catch (err) {
    throw new PokemonBadRequest("Invalid token")
  }
}

app.use(auth) // Boom! All routes below this line are protected
app.get('/api/v1/pokemons', asyncWrapper(async (req, res) => {
  if (!req.query["count"])
    req.query["count"] = 10
  if (!req.query["after"])
    req.query["after"] = 0
  
  if (!req.query["token"])
    throw new PokemonDbError("Access denied")
  
  const token = req.query["token"]
  
  const doc = await tokenModel.findOne({ token: token })

  if (doc) {
    const docs = await pokeModel.find({})
    .sort({ "id": 1 })
    .skip(req.query["after"])
    .limit(req.query["count"])
    res.json(docs) }
  else 
    res.send("ACCESS DENIED. PLEASE LOGIN");
  // try {
  
  // } catch (err) { res.json(handleErr(err)) }
}))

app.get('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {
  // try {
  if (!req.query["token"])
    throw new PokemonDbError("Access denied")
  
  const token = req.query["token"]

  const doc = await tokenModel.findOne({ token: token })
  
  if (doc) {
    const { id } = req.params
    const docs = await pokeModel.find({ "id": id })
    if (docs.length != 0) 
      res.json(docs)
      else{
        throw new PokemonNotFoundError("");
      }
    }
  else {
    res.send("ACCESS DENIED. PLEASE LOGIN");}
  // } catch (err) { res.json(handleErr(err)) }
}))

app.post('/api/v1/pokemon/', asyncWrapper(async (req, res) => {
  if (!req.query["token"])
    throw new PokemonDbError("Access denied")
  
  const token = req.query["token"]

  const doc = await tokenModel.findOne({ token: token })
  if(doc) {
    if (doc.admin) {
      console.log(doc)
    if (!req.body.id) throw new PokemonBadRequestMissingID()
    const poke = await pokeModel.find({ "id": req.body.id })
    if (poke.length != 0) throw new PokemonDuplicateError()
    const pokeDoc = await pokeModel.create(req.body)
    res.json({
      msg: "Added Successfully"
    })
    }
    else {
      throw new Error("Sorry you must be an admin to perform this request")
    }
  }
  else {
    res.send("ACCESS DENIED. PLEASE LOGIN");
  }
}))

app.delete('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {
  if (!req.query["token"])
    throw new PokemonDbError("Access denied")
  
  const token = req.query["token"]

  const doc = await tokenModel.findOne({ token: token })

  if(doc) {
    if(doc.admin) {
      const docs = await pokeModel.findOneAndRemove({ id: req.params.id })
  if (docs)
    res.json({
      msg: "Deleted Successfully"
    })
  else
    throw new PokemonNotFoundError("");
  }
  else {
    throw new Error("Sorry you must be an admin to perform this request")
  }
    }
    
  else {
    res.send("ACCESS DENIED. PLEASE LOGIN");
  }
}))

app.put('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {
  if (!req.query["token"])
    throw new PokemonDbError("Access denied")
  
  const token = req.query["token"]

  const doc = await tokenModel.findOne({ token: token })
  if(doc) {
    if(doc.admin) {
      const selection = { id: req.params.id }
      const update = req.body
      const options = {
        new: true,
        runValidators: true,
        overwrite: true
      }
      const doc = await pokeModel.findOneAndUpdate(selection, update, options)
  
      if (doc) {
        res.json({
            msg: "Updated Successfully",
            pokeInfo: doc})
        } 
      else {
        throw new PokemonNotFoundError("");
        }
    }
else {
      throw new Error("Sorry you must be an admin to perform this request")
    }
    
  }
  else {
    res.send("ACCESS DENIED. PLEASE LOGIN");
  }
  
}))

app.patch('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {
  if (!req.query["token"])
    throw new PokemonDbError("Access denied")
  
  const token = req.query["token"]

  const doc = await tokenModel.findOne({ token: token })
  if(doc) {
    if(doc.admin) {
      const selection = { id: req.params.id }
    const update = req.body
    const options = {
    new: true,
    runValidators: true
  }
  const doc = await pokeModel.findOneAndUpdate(selection, update, options)
  if (doc) {
    res.json({
      msg: "Updated Successfully",
      pokeInfo: doc
    })
  } else {
   
    throw new PokemonNotFoundError("");
  }
    }
    else {
      throw new Error("Sorry you must be an admin to perform this request")
    }
    
  }
  else {
    res.send("ACCESS DENIED. PLEASE LOGIN");
  }
  
 
}))

app.get("*", (req, res) => {
  // res.json({
  //   msg: "Improper route. Check API docs plz."
  // })
  throw new PokemonNoSuchRouteError("");
})

app.use(handleErr)