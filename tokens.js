const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  token: {
    type: String
  },
  admin: {
    type: Boolean
  }
})

module.exports = mongoose.model('tokens', schema) //pokeUser is the name of the collection in the db