const bcrypt = require('bcryptjs')
const User = require('../models/user')
const helper = require('./test_helper')
const {test, beforeEach, describe} = require('node:test')
const assert = require('node:assert')
const app = require('../app')
const supertest = require('supertest')


const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root',name: "testing", passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creating a user with username length < 3', async ()=> {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
        username: 'ml',
        name: 'Matti Luukkainen',
        password: 'salainen',
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })


  test('creating a user with password length < 3', async ()=> {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'sa',
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creating a user with existing username in DB', async ()=> {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Matti Luukkainen',
      password: 'sa',
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})