const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs',{url: 1, author: 1, title: 1, likes: 1, comments: 1})
  return response.status(201).json(users)
})


usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (password.length < 3) return response.status(400).send({error: "password must be at least 3 characters long"})

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  return response.status(201).json(savedUser)
})

module.exports = usersRouter