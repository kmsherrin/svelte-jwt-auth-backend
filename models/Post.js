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
  foreignField: 'post',
  count: true
})

postSchema.virtual('commentTop', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  options: {
    sort: {
      score: 1
    },
    limit: 3
  }
})

postSchema.virtual('contentStart').get(function() {
  let contentStartFmt = this.content.slice(0, 300) + "...";
  return  contentStartFmt;
})

postSchema.virtual('dateFmt').get(function() {
  let date = this.createdAt.toLocaleString()
  return date;
})


function autoPopulate (next) {
  this.populate('commentsCount')
  this.populate('commentTop')
  this.populate('user')
  next()
}

postSchema.pre('find', autoPopulate)
postSchema.pre('findOne', autoPopulate)

module.exports = mongoose.model('Post', postSchema)