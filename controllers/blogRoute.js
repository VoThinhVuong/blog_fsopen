const blogRouter = require('express').Router()
const Blog = require("../models/blog")
const User = require("../models/user")


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


blogRouter.post('/', async (request, response) => {
    const {userId, author, title, url, likes } = request.body

    const user = await User.findById(userId)

    if(!user) return response.status(400).send({error: "user not found"})

    const blog = new Blog({
        title: title,
        author: author,
        user: user.id,
        url: url,
        likes: likes
    })
    

    if(blog.url == undefined || blog.title == undefined) return response.status(400).send({error: "missing title or url"})

    if(blog.likes == undefined) blog.likes = 0
  
    const result = await blog.save()

    user.blogs = user.blogs.concat(result.id)
    await user.save()

    if (result) return response.status(201).json(result)
    else return response.status(400).end()
})

blogRouter.delete('/:id', async (request, response) => {
    const result = await Blog.findByIdAndDelete(request.params.id)
    if(result) return response.status(204).end()
    else return response.status(404).end()
})

blogRouter.put('/:id', async (request, response) => {

    const newLikes = request.body.likes

    const result = await Blog.findByIdAndUpdate(request.params.id, {likes: newLikes},{new: true})
    if(result) return response.json(result)
    else return response.status(404).end()
})


module.exports = blogRouter