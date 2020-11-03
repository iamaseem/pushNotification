const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cors = require('cors')
const webpush = require('web-push')
const { Pool, Client } = require('pg')

const app = express()
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    port: 5432,
})

client.connect()

let msg = null;

client.query('SELECT * FROM pushes;', (err, res) => {
  console.log(err, res.rows)
  msg = res.rows;
  console.log(msg[0])
  client.end()
})

dotenv.config()

app.use(cors())
app.use(bodyParser.json())

webpush.setVapidDetails(process.env.WEB_PUSH_CONTACT, process.env.PUBLIC_VAPID_KEY, process.env.PRIVET_VAPID_KEY)

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/notifications/subscribe', (req, res) => {
    const subscription = req.body
    console.log(subscription)

    const payload = JSON.stringify(msg[0])

    webpush.sendNotification(subscription,  payload).then(result => console.log(result)).catch(e => console.log(e.stack))

    res.status(200).json({'success': true})
});

app.listen(9000, () => console.log('the server has been started in 9000'))