const express = require('express');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.urlencoded({
    extended: false
}));

//Index page, gatekeeps if user is logged in
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/html/login.html');
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/html/signup.html');
});

app.use(express.static(__dirname + "/"));

app.get("*", (req, res) => {
    res.status(404).render("404");
  })
  
  app.listen(port, () => {
      console.log("Node application listening on port " + port);
  });