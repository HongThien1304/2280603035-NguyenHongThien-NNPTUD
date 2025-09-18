const express = require('express')
const app = express()
const port = 3000

// Serve static frontend from /public
app.use(express.static('public'));
app.use(express.json());

let posts = [
    {
      id: "1",
      title: "a title",
      views: 100
    },
    {
      id: "2",
      title: "another title",
      views: 200
    }
  ]

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/posts', (req, res) => {
    res.send(posts)
})
app.get('/posts/:id', (req, res) => {
    let id = req.params.id;
    let post = posts.filter(
        p=>p.id==id
    )
    if(post.length>0){
        res.send(post[0]);
    }else{
        res.status(404).send({
            success:false,
            data:{
                message: "id not found"
            }
        });
    }
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})