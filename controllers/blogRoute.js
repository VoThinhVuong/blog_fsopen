const blogRouter = require('express').Router()
const Blog = require("../models/blog")


blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
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
    const blog = new Blog(request.body)
    console.log(blog.url)

    if(blog.url == undefined || blog.title == undefined) return response.status(400).send({error: "missing title or url"})

    if(blog.likes == undefined) blog.likes = 0
  
    const result = await blog.save()

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