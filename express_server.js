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
const urlsForUser = (id) => {
  const userURL = {};
  for (const url in urlDatabase) {
    if (id === [req.params.shortURL].userID) {
      console.log("YES");
      userURL = [req.params.shortURL].userID;
    }
  }
  console.log(userURL)
  return userURL;
};

app.set("view engine", "ejs");

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "aJ48lW": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
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
  urlDatabase[shortURL]= {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  console.log('urlDatabase: ', urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users: users, cookie: req.cookies["user_id"], cookieLogin: req.cookies["user_login"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = `http://${urlDatabase[req.params.shortURL].longURL}`;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log('URL DATABASE', urlDatabase[req.params.shortURL])
  console.log('DATABASE', urlDatabase)
  console.log(req.params)
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]}
  };
  res.redirect(`/urls/${req.params.shortURL}`);
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