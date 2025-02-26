const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  for(let blog of helper.initialBlogs){
    let BlogObject = new Blog(blog)
    await BlogObject.save()
  }

})

test("5 blogs are returned as json", async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const res = await api.get('/api/blogs')
  console.log(res.body)
  const blogs = res.body.map(blog => blog)

  assert.strictEqual(blogs.length, helper.initialBlogs.length)
})


test("get 2nd blog through id", async () =>{
  const id = helper.initialBlogs[1]._id
  await api
    .get(`/api/blogs/${id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const res = await api.get(`/api/blogs/${id}`)
  console.log(res.body)
  const blog = res.body
  assert.strictEqual(blog.title,'Go To Statement Considered Harmful')
})

test.only("new blog", async () =>{
  const blog = {
    title: "Testing",
    author: "Vuong",
    url: "https://www.hi.com",
    likes: 0
  }

  await api
    .post(`/api/blogs`)
    .send(blog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const result = await api.get(`/api/blogs`)
  const blogs = result.body.map(blog => blog)

  assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)
  assert.strictEqual(blogs[blogs.length-1].title, "Testing")
})

after(async () => {
  await mongoose.connection.close()
})