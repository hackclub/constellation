const express = require('express')
const app = express()
const port = 3000

const City = "Shelburne"
const State = "VT"
const Country = "US"
const Extra = "test message!"


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/test', (req, res) => {
    res.json({
        City,
        State,
        Country,
    })
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})