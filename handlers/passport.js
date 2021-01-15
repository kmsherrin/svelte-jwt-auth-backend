const passport = require('passport')

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const mongoose = require('mongoose')
const User = mongoose.model('User')

require('dotenv').config({ path: '.env' })

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY
}

passport.use(new JwtStrategy(options, async (jwtPayload, done) => {
  try {
    const user = await User.findOne({ _id: jwtPayload.id })
    return done(null, user || false)
  } catch (err) {
    return done(err, false)
  }
}))