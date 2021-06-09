import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import { getConfig } from '../config/config'
import { userModel } from '../models/user/user.model'
import { UserDocument } from '../models/user/interfaces'

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: getConfig('JWT_ACCESS_KEY'),
}

passport.use(
  'jwt',
  new JwtStrategy(opts, async ({ data }, done) => {
    try {
      const user = await userModel.findById(data.id)

      if (user) {
        return done(null, user)
      }

      return done(null, false)
    } catch (err) {
      return done(null, false)
    }
  })
)

passport.serializeUser(function (user: UserDocument, done) {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

export { passport }
