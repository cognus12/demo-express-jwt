import mongoose from 'mongoose'
import { getConfig } from '../config/config'

const URI = getConfig('DB_URI')

const connectDataBase = async (): Promise<void> => {
  try {
    await mongoose.connect(URI as string, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  } catch (error) {
    console.error(error.message)
  }
}

connectDataBase()
  .then(() => console.log('Data base connected'))
  .catch(() => 'Data base connection error')
