const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['link', 'text'],
    required: true
  },
  content: String,
  score: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true }
})

postSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'story',
  count: true
})

function autoPopulate (next) {
  this.populate('commentsCount')
  this.populate('user')
  next()
}

postSchema.pre('find', autoPopulate)
postSchema.pre('findOne', autoPopulate)

module.exports = mongoose.model('Post', postSchema)