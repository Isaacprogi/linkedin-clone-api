const Post = require('../models/Post')
const User = require('../models/User')
const Comment = require('../models/Comment')
const fs = require('fs-extra')
const Repost = require('../models/Repost')
const {cloudinary} = require('../config/cloudinaryConfig')

const getPosts = async (req, res, next) => {
    let page;

    if(req.query.page){
        page = parseInt(req.query.page)
    }
    else{
        page = 1;
    }
    //define limit per page
    const limit = 10;
    const skip = (page - 1) * limit

    //const total posts
    const total = await Post.countDocuments({})

    try {
        let posts = await Post.find()
        .populate('user', "_id, firstname title lastname photo")
        .populate('likes', "_id, firstname title lastname photo")
        .populate({
            path:'comments',
            populate: {
                path:'user',
                select:'_id firstname lastname username photo title'
            }
        })
        .populate({
            path: 'reposts',
            populate: {
                path:'user',
                select:'_id firstname lastname username photo title'
            }
        })
        .sort({updatedAt:-1}).skip(skip).limit(limit)
        res.status(200).json(posts)
    } catch (error) {
        next(error)
    }
}



const getSinglePost = async (req, res, next) => {
    try {
        const posts = await Post.find({ user: req.params.id })
        .populate('user', "_id, firstname lastname photo")
        .populate('likes', "_id, firstname lastname photo")
        .populate('comments')
        .populate({
            path: 'reposts',
            populate: {
                path:'user',
                select:'_id firstname lastname username photo title'
            }
        })
        .sort({updatedAt:-1})
         res.status(200).json(posts)
    } catch (error) {
        next(error)
    }
}


const addPost = async (req, res, next) => {
    if (!req.body.post && !req.body.file) {
        return next({ message: "add a post" })
    }

    try {
        const post = await Post.create({
            post: req.body.post,
            user: req.user._id,
            file: req.body.file,
            type:req.body?.type,
            fileWidth:req.body.fileWidth,
            fileHeight:req.body.fileHeight
        })

        const newPost = await Post.findById(post?._id).populate('user', " _id firstname title lastname photo")
        return res.status(200).json(newPost)

    } catch (error) {
        next(error)
    }
}


const deletePost = async (req, res, next) => {
    if(!req.params.id){
       return next(new Error('missing parameter'))
    }
    try {
        const post = await Post.findByIdAndDelete({ _id: req.params.id },{new:true})
        const comment = await Comment.deleteMany({ post: req.params.id })
        const repost = await Repost.deleteMany({post:req.params.id})

        if(post?.format === 'video'){
            await fs.remove(`./public/post/videos/${post?.file}`)
            return res.status(200).json('file has been deleted')
        }
        if(post?.format === 'image'){
            await fs.remove(`./public/post/images/${post?.file}`)
            return res.status(200).json('file has been deleted')
        }
        res.status(200).json('file deleted successfully')
    } catch (error) {
        next(error)
    }
}


const likePost = async (req, res, next) => {
    if (!req.body.userId) {
        return next({ message: "you cant like this post" })
    }
    try {

        const userIdCheck = await User.findById({ _id: req.body.userId })
        if (!userIdCheck) {
            return next({ message: "you can't like this post" })
        }

        const check = await Post.findById({ _id: req.params.id })
        if (!check) {
            return next({ message: "post doesnt exist" })
        }

        if (!check?.likes?.includes(req.body.userId)) {
            let likedPost = await Post.findByIdAndUpdate({ _id: req.params.id },
                { $push: { likes: req.body.userId }}, { new: true }).populate('user', "_id firstname title lastname photo").populate('likes', "_id firstname lastname title photo").populate('comments')
                .populate({
                    path:'comments',
                    populate: {
                        path: 'user',
                        select: '_id firstname lastname username photo title'
                    }
                })
            return res.status(200).json(likedPost)
        }
        let likedPost = await Post.findByIdAndUpdate({ _id: req.params.id },
            { $pull: { likes: req.body.userId } 
            }, { new: true }).populate('user', "_id firstname title  lastname photo").
            populate('likes', "_id firstname title lastname photo")
            .populate({
                path:'comments',
                populate: {
                    path: 'user',
                    select: '_id firstname lastname username photo title'
                }
            })
        return res.status(200).json(likedPost)

    } catch (error) {
        next(error)
    }
}



const updatePost = async (req, res, next) => {
    if (!req.body.post || !req.params.id ) {
        return next({ message: "you cant like this post" })
    }
    try {
        let updatedPost = await Post.findByIdAndUpdate({ _id: req.params.id },
            { $set: { post: req.body.post } }, { new: true }
        ).populate('user', " _id firstname lastname photo").populate('likes', " _id firstname lastname photo")
        .populate({
            path:'comments',
            populate: {
                path: 'user',
                select: '_id firstname lastname username photo title'
            }
        })
        .populate({
            path: 'reposts',
            populate: {
                path:'user',
                select:'_id firstname lastname username photo title'
            }
        })
        res.status(200).json(updatedPost)

    } catch (error) {
        next(error)
    }
}




const repostPost = async (req, res, next) => {
    if(!req.params.id){
        return next(new Error('missing parameter'))
    }
    try {
        const post = await Post.findById({ _id: req.params.id })
        if (!post) {
            return next(new Error('post does not exist'))
        }

        const repost = await Repost.create({
            post:req.params.id,
            user:req.user._id,
        })

        post.reposts?.push(repost._id)

        let newPost = await post.save()
        newPost = await newPost.populate({
            path: 'reposts',
            populate: {
                path:'user',
                select:'_id firstname lastname username photo title'
            }
        })   
        res.status(200).json(newPost)
    } catch (error) {
        next(error)
    }
}



const postFileUpload = async (req, res, next) => {
    const file = req.file.path
    if(req.file.mimetype.split('/')[0] === 'image'){
        try{
            const uploadedResponse = await cloudinary.uploader.upload(file,
                {uploadpreset:'linkedn_uploads'}
                )
            return res.status(200).json(uploadedResponse)   
        }catch(error){
            return next(error)
        }
    }

    if(req.file.mimetype.split('/')[0] === 'video'){
        try{
            const uploadedResponse = await cloudinary.uploader.upload(file,
                {   resource_type:"video",
                    uploadpreset:'linkedn_uploads',
                  }
                )
              return res.status(200).json(uploadedResponse)    
        }catch(error){
            return next(error)
        }
    }
     
}



module.exports = { addPost, getPosts, getSinglePost, likePost, repostPost, postFileUpload, deletePost, updatePost }