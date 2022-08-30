const express = require('express');
const app = express();
const data = require("./data.json");
const fs = require('fs')
const crypto = require("crypto")

app.listen(3000);
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/dashboard', (req, res) => {
    res.render('dashboard')
})

app.get('/create-new-meeting', (req, res) => {
    res.render('create-new-meeting')
})

app.get('/log-in', (req, res) => {
    res.render('log-in')
})
app.get('/sign-up', (req, res) => {
    res.render('sign-up')

})

app.get('/create-new-meeting', (req, res) => {
    res.render('create-new-meeting')
})

app.post('/start-new-meeting', (req, res) => {
    const tmpid = crypto.randomUUID()
    const meetid = tmpid.slice(0,6)
    let title = req.body['meeting-title']
    let time = req.body['meeting-duration-num']
    let userid = Math.floor(1000 + Math.random() * 9000);
    data.meetings.push({
        id:meetid
    })

    data.meetingsobj[meetid] = {
        meetid:meetid,
        time: time,
    };

    fs.writeFile('./data.json', JSON.stringify(data), function writeJSON(err) {
        if (err) return console.log(err);
        console.log('Updated data.json ');
    });

    res.render('meet', { time: time, title: title , meetid:meetid , userid:userid})
})

app.get('/join/:id' , (req,res)=>{
    let id = req.params.id;
    let useridf = Math.floor(1000 + Math.random() * 9000);
    if(data.meetingsobj[id]){
        res.render('meet' , {meetid:id , userid:useridf , time:data.meetingsobj[id].time})
    }
    else{
        res.send("meeting does not exist")
    }
    
})

app.get('/test' , (req,res)=>{
    res.render('test' , {testdata :"Malubulu"})
})
app.post('/sign-up', (req, res) => {
    data.users.push({
        userid: (data.users.length + 1),
        usermail: `${req.body.email}`,
        userpass: `${req.body.password}`
    })

    fs.writeFile('./data.json', JSON.stringify(data), function writeJSON(err) {
        if (err) return console.log(err);
        console.log('Updated data.json ');
    });

    res.render('log-in')

})

app.post('/log-in', (req, res) => {
    let mail = req.body.email
    let pass = req.body.password

    data.users.forEach((e) => {
        if (e.usermail == mail) {
            if (e.userpass == pass) {
                res.render('dashboard')
            }
            else {
                res.render('log-in-fail')
            }
        }

    })

    res.render('log-in-fail');
})
