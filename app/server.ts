import { createServer } from 'http'
import { EXPRESS_APP } from './app'
import { getConfig } from './config/config'

const PORT = getConfig('PORT')

const server = createServer(EXPRESS_APP)

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  console.log('Press CTRL-C to stop\n')
})
