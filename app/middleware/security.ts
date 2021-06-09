import { passport } from '../providers/passport.provider'

export const onlyAuthorised = passport.authenticate('jwt', { session: false })
