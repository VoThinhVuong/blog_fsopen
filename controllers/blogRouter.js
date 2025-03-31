const blogRouter = require('express').Router()
const Blog = require("../models/blog")
const User = require("../models/user")
const middleware = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {username: 1, name: 1, id: 1})
    if(blogs) response.json(blogs)
    else response.status(404).end()
})
  
blogRouter.get('/:id', async (request, response) => {
    const id = request.params.id
    const blogs = await Blog.findById(id)
    if(blogs) return response.json(blogs)
    else return response.status(404).end()
})


blogRouter.post('/', middleware.userExtractor, async (request, response) => {
    const {author, title, url, likes } = request.body


    if(!request.user.id) return response.status(401).json({error: 'token invalid'}) 
    const user = await User.findById(request.user.id)

    if(!user) return response.status(404).json({error: "invalid user id"})

    const blog = new Blog({
        title: title,
        author: author,
        user: user.id,
        url: url,
        likes: likes,
        comments: []
    })
    

    if(blog.url == undefined || blog.title == undefined) return response.status(400).send({error: "missing title or url"})

    if(blog.likes == undefined) blog.likes = 0
  
    const result = await blog.save()

    user.blogs = user.blogs.concat(result.id)
    await user.save()

    if (result) return response.status(201).json(result)
    else return response.status(400).end()
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

    const result = await Blog.findById(request.params.id)

    if(!result) return response.status(404).json({error: "invalid blog id"})
        
    if(!(result.user.toString() === request.user.id.toString())) return response.status(401).json({error: "invalid user id"})

    await Blog.findByIdAndDelete(request.params.id)

    const user = User.findById(request.user.id)

    const newBlogs = user.blogs.filter(blog => blog !== request.params.id)
    user.blogs = newBlogs
    await user.save

    return response.status(204).end()
})

blogRouter.put('/:id/like', middleware.userExtractor, async (request, response) => {

    const newLikes = request.body.likes

    const result = await Blog.findById(request.params.id)

    if(!result) return response.status(404).json({error: "invalid blog id"})
        

    const newBlog = await Blog.findByIdAndUpdate(request.params.id, {likes: newLikes},{new: true})
    return response.json(newBlog)
})

blogRouter.post('/:id/comments', middleware.userExtractor, async (request, response) => {

    const newComment = request.body.comments

    const result = await Blog.findById(request.params.id)

    if(!result) return response.status(404).json({error: "invalid blog id"})
        
    const newBlog = await Blog.findByIdAndUpdate(request.params.id, {comments: newComment},{new: true})

    return response.json(newBlog)
})


module.exports = blogRouter