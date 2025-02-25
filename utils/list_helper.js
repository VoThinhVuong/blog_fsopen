const dummy = (blogs) => 1

const totalLikes = (blogs) => {
    console.log(blogs)
    return blogs.reduce((sum, blog) => blog.likes ? sum + blog.likes : sum,0)
}

module.exports = { dummy, totalLikes }