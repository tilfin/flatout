const app = require('./server')
const port = process.env.PORT || 3000;
const server = app.listen(port)
console.info(`Browse http://localhost:${port}/test/`)
