const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = require('express')()

require('dotenv').config({ path: '.env' })

mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})

mongoose.connection.on('error', (err) => {
  console.error('Connection error on database:', err)
})

//require('./models/Story.js')
//require('./models/Comment.js')
require('./models/User.js')

require('./handlers/passport')

app.use(cors())

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.end('hello world!')
})

app.use('/', require('./routes/users_route'))
app.use('/', require('./routes/auth'))
//app.use('/stories', require('./routes/stories'))

app.use((req, res) => {
  res
    .status(404)
    .json({
      message: 'not found'
    })
})

app.use((err, req, res, next) => {
  let error = {
    status: err.status || 500,
    message: err.message || 'Something went wrong!'
  }
  if (process.env.NODE_ENV === 'development') {
    error['stack'] = err.stack
  }
  res
    .status(err.status || 500)
    .json(error)
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Authentication is running on port ${port}`))