const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

const Post = mongoose.model('Post')
const Comment = mongoose.model('Comment')

router.get('/', async (req, res) => {
  const stories = await Post
    .find()
    .limit(+req.query.limit || 10)
    .skip(+req.query.offset || 0)
    .sort(
      req.query.sort === 'top'
        ? { 'score': -1 }
        : { 'createdAt': -1 }
    )
  res.json({
    data: stories,
    totalCount: await Post.countDocuments()
  })
})

router.get('/:postId', async (req, res) => {
  const post = await Post.findOne({ _id: req.params.postId })
  res.json(post)
})

router.post('/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const post = await (new Post({
      title: req.body.title,
      type: req.body.type,
      content: req.body.content,
      user: req.user._id
    }).save())
    res.json(post)
  }
)

router.put(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let post = await Post.findOne({ _id: req.params.postId })
    if (!post.user.equals(req.user._id)) {
      res
        .status(401)
        .json({
          message: 'You cannot edit a post that you have not created!'
        })
      return
    }
    post.title = req.body.title
    post.content = req.body.content
    post = await post.save()
    res.json(post)
  }
)

router.delete(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let post = await Post.findOne({ _id: req.params.postId })
    if (!post.user.equals(req.user._id)) {
      res
        .status(401)
        .json({
          message: 'You cannot delete a post that you have not created!'
        })
      return
    }
    await post.deleteOne({ _id: post._id })
    res.json({
      message: 'deleted!'
    })
  }
)


// End point for upvoting a post
router.post('/:postId/upvote', async (req, res) => {
  let post = await Post.findOne({ _id: req.params.postId })
  post.score = post.score + 1
  await post.save()
  res.json({
    message: 'upvoted!'
  })
})

// Get the comments associated with a post
router.get('/:postId/comments', async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId, parent: null })
  res.json(comments)
})


// Making comments on a post

router.post(
  '/:postId/comments',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let comment = await (new Comment({
      content: req.body.content,
      post: req.params.postId,
      parent: req.body.parent,
      user: req.user._id
    }).save())
    comment = await Comment.populate(comment, ['replies', 'user'])
    res.json(comment)
  }
)

router.post('/:postId/comments/:commentId/upvote', async (req, res) => {
  let comment = await Comment.findOne({
    _id: req.params.commentId,
    post: req.params.postId
  })
  comment.score = comment.score + 1
  await comment.save()
  res.json({
    message: 'upvoted!'
  })
})

module.exports = router