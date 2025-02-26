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
    if(blogs) response.json(blogs)
    else response.status(404).end()
})


blogRouter.post('/', async (request, response) => {
    const blog = new Blog(request.body)
  
    const result = await blog.save()

    if (result) response.status(201).json(result)
    else response.status(404).end()
})

module.exports = blogRouter