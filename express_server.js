const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const check = (thingToCheck, thing, users) => {
  for (const user in users) {
    if (users[user][thingToCheck] === thing) {
      return true;
    }
  }
  return false;
};

app.set("view engine", "ejs");

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function generateRandomString() {
  return Math.random().toString(16).substr(2, 6);
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, users: users, cookie: req.cookies["user_id"], cookieLogin: req.cookies["user_login"]};
  res.render("urls_index", templateVars);
});

app.get("/register-page", (req, res) => {
  const templateVars = {users: users, cookie: req.cookies["user_id"], cookieLogin: req.cookies["user_login"]};
  res.render("urls_register", templateVars);
});

app.get("/login-page", (req, res) => {
  const templateVars = {users: users, cookie: req.cookies["user_id"], cookieLogin: req.cookies["user_login"]};
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {users: users, cookie: req.cookies["user_id"], cookieLogin: req.cookies["user_login"]};
  res.render("urls_new", templateVars);
});

app.post("/urls/new/submit", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL]= req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], users: users, cookie: req.cookies["user_id"], cookieLogin: req.cookies["user_login"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = `http://${urlDatabase[req.params.shortURL]}`;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  let shortURL = generateRandomString();
  urlDatabase[shortURL]= req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_login");
  res.redirect('/login-page');
});

app.post("/login", (req, res) => {
  if(req.body["email"] === '' || req.body["password"] === '') {
    res.send('error status code 400');
  } 
  if (check('email', req.body["email"], users) === true && check('password', req.body["password"], users) === true) {
    res.cookie('user_login', generateRandomString())
    res.redirect('/urls');
  } else {
    res.send('error status code 403')
  }
});

app.post("/register", (req, res) => {
  if(req.body["email"] === '' || req.body["password"] === '' || check('email', req.body["email"], users) === true) {
    res.send('error status code 400');
  }
  let newUser = generateRandomString();
  res.cookie('user_id', newUser)
  users[newUser] = {
    id: newUser,
    email: req.body["email"],
    password: req.body["password"]
  };
  res.redirect("/login-page");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});