const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')

const api = supertest(app)

describe("Testing on DB with blogs", () => {
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
    const blog = res.body
    assert.strictEqual(blog.title,'Go To Statement Considered Harmful')
  })

  test("new blog", async () =>{
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

  test("new blog with messing likes", async () =>{
    const blog = {
      title: "Testing",
      author: "Vuong",
      url: "https://www.hi.com",
    }

    await api
      .post(`/api/blogs`)
      .send(blog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const result = await api.get(`/api/blogs`)
    const blogs = result.body.map(blog => blog)

    assert.strictEqual(blogs.length, helper.initialBlogs.length + 1)
    assert.strictEqual(blogs[blogs.length-1].likes, 0)
  })

  test("new blog without title and url", async () =>{
    const blog = {
      author: "Vuong"
    }

    await api
      .post(`/api/blogs`)
      .send(blog)
      .expect(400)

    const result = await api.get(`/api/blogs`)
    const blogs = result.body.map(blog => blog)

    assert.strictEqual(blogs.length, helper.initialBlogs.length)
  })

  test("delete 2nd blog", async () =>{
    const id = helper.initialBlogs[1]._id

    await api
      .delete(`/api/blogs/${id}`)
      .expect(204)

    const result = await api.get(`/api/blogs`)
    const blogs = result.body.map(blog => blog)

    assert.strictEqual(blogs.length, helper.initialBlogs.length - 1)
    assert(!blogs.includes(helper.initialBlogs[1]._id))
  })

  test("update 2nd blog", async () =>{
    const id = helper.initialBlogs[1]._id

    await api
      .put(`/api/blogs/${id}`)
      .send({likes : 400})
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const result = await api.get(`/api/blogs`)
    const blogs = result.body.map(blog => blog)

    assert.strictEqual(blogs.length, helper.initialBlogs.length)
    assert.strictEqual(blogs[1].likes, 400)
  })

})

describe("Testing on DB with no blogs", () => {
  test("delete non-existing blog", async () =>{
    const id = helper.initialBlogs[1]._id

    await api
      .delete(`/api/blogs/${id}`)
      .expect(404)
  })

  test("update non-existing blog", async () =>{
    const id = helper.initialBlogs[1]._id

    await api
      .put(`/api/blogs/${id}`)
      .send({likes : 2})
      .expect(404)
  })

})

after(async () => {
  await mongoose.connection.close()
})