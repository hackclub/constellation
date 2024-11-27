const express = require('express')
const app = express()
const port = 3000

const city = "Shelburne"
const state = "VT"
const country = "US"
const slack_id = "U06PR6B8D37"
const extra = "extra info! this isn't going to be used in the submission"


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api', (req, res) => {
    res.json({
        city,
        state,
        country,
        slack_id,
        extra
    })
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})