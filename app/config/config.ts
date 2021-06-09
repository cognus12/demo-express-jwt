import dotenv from 'dotenv'

dotenv.config()

export const appConfig = {
  PORT: process.env.PORT || 3000,
  DB_URI: process.env.URI,
  SALT: process.env.SALT_ROUNDS || '10',
  JWT_ACCESS_KEY: process.env.JWT_ACCESS_KEY,
  JWT_REFRESH_KEY: process.env.JWT_REFRESH_KEY,
  JWT_ACCESS_EXP: process.env.JWT_ACCESS_EXP,
  JWT_REFRESH_EXP: process.env.JWT_REFRESH_EXP,
}

type GlobalConfig = typeof appConfig

type GlobalConfigKey = keyof GlobalConfig

export const getConfig = <K extends GlobalConfigKey>(key: K): GlobalConfig[K] => appConfig[key]
