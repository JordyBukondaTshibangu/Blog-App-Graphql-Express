const bcrypt = require('bcrypt')
const validator = require('validator')
const User = require('../models/user')
const Post = require('../models/post')
const { clearImage } = require('../util/file')
const jwt = require('jsonwebtoken')

module.exports = {
    createUser : async ({ userInput }, req) => {

        const existingUser =  await User.findOne({email : userInput.email})
        if(existingUser){
            const error = new Error('User already exists !')
            throw error
        }
        const errors = []

        if(!validator.isEmail(userInput.email)){
            errors.push({message : 'E-mail is Invalid'})
        }
        if(validator.isEmpty(userInput.password) || 
           !validator.isLength(userInput.password, { min : 5})
        ){
            errors.push({ message : 'Password too short !'})
        }
        if(errors.length > 0){
            const error = new Error('Invalid Input')
            error.data = errors;
            error.code = 422;
            throw error
        }
        const hashedPassword = await bcrypt.hash(userInput.password, 12)
        const user = new User({
            email : userInput.email,
            name : userInput.name,
            password : hashedPassword
        })
        const createUser = await user.save()
        return { ...createUser._doc, _id: createUser._id.toString()}

    },
    login : async ({email, password}) => {
        const user = await User.findOne({email : email})
            if(!user){
                const error = new Error('User not found')
                error.code = 401
                throw error
            }
        const isMatch = await bcrypt.compare(password, user.password) 
        if(!isMatch){
            const error = new Error('Password is incorrect')
            error.code = 401
            throw error
        }
        const token = await jwt.sign({
            userId : user._id.toString(),
            email : user.email
        }, 'thisisasecretkey',
        {expiresIn : '5h'}
        )

        return {token, userId : user._id.toString() }

    },
    createPost : async ({postInput}, req) => {

        if(!req.isAuth){
            const error = new Error('Not Authenticated')
            error.code = 401
            throw error
        }
       const user = await User.findById(req.userId)
        if(!user){
            const error = new Error('Invalid user.')
            error.code = 401
            throw error
        }
        const errors = []
        if(
            validator.isEmpty(postInput.title) || 
           !validator.isLength(postInput.title, { min : 5})
        ){
            errors.push({message : 'Title is too short'})
        }
        if(
            validator.isEmpty(postInput.content) || 
           !validator.isLength(postInput.content, { min : 5})
        ){
            errors.push({message : 'Content is too short'})
        }
        if(errors.length > 0){
            const error = new Error('Invalid Input')
            error.data = errors;
            error.code = 422;
            throw error
        }

        const post = new Post({
            title : postInput.title,
            content : postInput.content,
            imageUrl : postInput.imageUrl,
           creator : user
        });
        const createdPost = await post.save()
        user.posts.push(createdPost)
        await user.save()
        console.log(user)

        return {
            ...createdPost._doc, 
            _id : createdPost._id.toString(),
            createdAt : createdPost.createdAt.toISOString(),
            updatedAt : createdPost.updatedAt.toISOString()
        }
    },
    posts : async({page}, req) => {
        if(!req.isAuth){
            const error = new Error('Not Authenticated')
            error.code = 401
            throw error
        }
        if(!page){
            page = 1;
        }
        const perPage = 2
        const totalPosts = await Post.find().countDocuments()
        const posts = await Post.find()
            .sort({ createdAt : - 1})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('creator')
        return { posts: posts.map(post =>{
            return { 
                ...post._doc, 
                _id : post._id.toString(),
                createdAt : post.createdAt.toISOString(),
                updatedAt : post.updatedAt.toISOString()
            }
        }), totalPosts}

    },
    post : async ({id}, req) => {
        if(!req.isAuth){
            const error = new Error('Not Authenticated')
            error.code = 401
            throw error
        }
        const posts = await Post.find()

        const post = posts.find(p => {
            p._id.toString() == id.toString()
            return p
        })
        if(!post){
            const error = new Error('No post found !')
            error.code = 404
            throw error
        }      
        console.log(post)
        return {
            ...post._doc,
            _id : post._id.toString(),
            createdAt : post.createdAt.toISOString(),
            updatedAt : post.updatedAt.toISOString()
        }
        
    },
    updatePost : async ({id, postInput}, req) => {
        if(!req.isAuth){
            const error = new Error('Not Authenticated')
            error.code = 401
            throw error
        }
        const post = await Post.findById(id).populate('creator')

        if(!post){
            const error = new Error('No post found!')
            error.code = 404
            throw error
        }
        if(post.creator._id.toString() !== req.userId.toString()){
            const error = new Error(' Not Authorized')
            error.code = 403
            throw error
        }

        const errors = []
        if(
            validator.isEmpty(postInput.title) || 
           !validator.isLength(postInput.title, { min : 5})
        ){
            errors.push({message : 'Title is too short'})
        }
        if(
            validator.isEmpty(postInput.content) || 
           !validator.isLength(postInput.content, { min : 5})
        ){
            errors.push({message : 'Content is too short'})
        }
        if(errors.length > 0){
            const error = new Error('Invalid Input')
            error.data = errors;
            error.code = 422;
            throw error
        }

        post.title = postInput.title
        post.content = postInput.content

        if(postInput.imageUrl !== 'undefined'){
            post.imageUrl = postInput.imageUrl
        }
        const updatedPost = await post.save()
        return {
            ...updatedPost._doc,
            _id : updatedPost._id.toString(),
            createdAt : updatedPost.createdAt.toISOString(),
            updatedAt : updatedPost.updatedAt.toISOString()
        }



    },
    deletePost : async({id}, req) => {
        if(!req.isAuth){
            const error = new Error('Not Authenticated')
            error.code = 401
            throw error
        }

        const post = await Post.findById(id)
        if(!post){
            const error = new Error('No post found!')
            error.code = 404
            throw error
        }
        if(post.creator.toString() !== req.userId.toString()){
            const error = new Error(' Not Authorized')
            error.code = 403
            throw error
        }
        clearImage(post.imageUrl)
        await Post.findByIdAndRemove(id)
        const user = await User.findById(req.userId)
        user.posts.push(id)
        await user.save()
        return true
    },
    user : async(args, req) =>{
        if(!req.isAuth){
            const error = new Error('Not Authenticated')
            error.code = 401
            throw error
        }
        const user = await User.findById(req.userId)
        if(!user){
            const error = new Error('No user found!')
            error.code = 404
            throw error
        }
        return {
            ...user._doc,
            _id : user._id.toString()
        }
    },
    updateStatus : async ({status}, req) => {
        if(!req.isAuth){
            const error = new Error('Not Authenticated')
            error.code = 401
            throw error
        }
        const user = await User.findById(req.userId)
        if(!user){
            const error = new Error('No user found!')
            error.code = 404
            throw error
        }
        user.status = status;
        await user.save()
        return {
            ...user._doc,
            _id : user._id.toString()
        }

    }
}