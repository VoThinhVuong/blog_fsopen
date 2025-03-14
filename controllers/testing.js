const testing = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


testing.post('/reset', async (request, response) => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    return response.status(200).end()
})


module.exports = testing