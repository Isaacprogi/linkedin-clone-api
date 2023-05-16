const Post = require('../models/Post')
const Comment = require('../models/Comment')
const User = require('../models/User')

const addComment = async(req,res,next) =>{
    if(!req.params.id ){
        return next(new Error('post id is missing'))
    }
    if(!req.body.comment){
        return next(new Error('please enter coment data'))
    }
    try {
        const user = await User.findOne({_id:req.user._id})

        if(!user){
            return next(new Error('user is not valid'))
        }

        const post = await Post.findOne({_id:req.params.id})
        if(!post){
            return next(new Error('post does not exist'))
        }

        const newComment = new Comment({
            post:req.params.id,
            comment:req.body.comment,
            user:req.user?._id
        })
        let comment = await Comment.create(newComment)

        comment = await comment.populate('user', '_id photo firstname lastname title')

        

        post.comments.push(newComment?._id)
        await post.save()
      
      res.status(200).json(comment)
    }catch(error){
        next(error)
    }
}


const deleteComment = async(req,res,next) =>{
    if(!req.params.id || !req.body.postId){
        return next(new Error('missing parameters'))
    }
    try {
        const post = await Post.findOne({_id:req.body.postId})
        if(!post){
            return next(new Error('post does not exist'))
        }
      const realComment = await Comment.findOne({feed:req.body.postId ,_id:req.params.id})
      if(!realComment){
          return next(new Error('comment does not exist at all'))
      }
      const comment = await Comment.findOneAndDelete({feed:req.body.postId ,_id:req.params.id})
      post.comments.pull(comment._id)
      await post.save()
      res.status(200).json('deleted successfully')
    }catch(error){
        next(error)
    }
}


module.exports = {
    addComment,
    deleteComment
}

