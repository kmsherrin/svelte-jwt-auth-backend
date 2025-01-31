const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true }
})

commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent'
})

function autoPopulate (next) {
  this.populate('replies')
  this.populate('user')
  next()
}

commentSchema.pre('find', autoPopulate)
commentSchema.pre('findOne', autoPopulate)

module.exports = mongoose.model('Comment', commentSchema)