const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers.js");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
const check = (thingToCheck, thing, users) => {
  for (const user in users) {
    if (users[user][thingToCheck] === thing) {
      return true;
    }
  }
  return false;
};

app.set("view engine", "ejs");

const users = {};

const urlDatabase = {};

function generateRandomString() {
  return Math.random().toString(16).substr(2, 6);
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    cookie: req.session.user_id,
    email: users[req.session.user_id]?.email,
  };
  res.render("urls_index", templateVars);
});

app.get("/register-page", (req, res) => {
  const templateVars = { users: users, cookie: req.session.user_id };
  res.render("urls_register", templateVars);
});

app.get("/login-page", (req, res) => {
  const templateVars = { users: users, cookie: req.session.user_id };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: users,
    cookie: req.session.user_id,
    email: users[req.session.user_id]?.email,
  };
  res.render("urls_new", templateVars);
});

app.post("/urls/new/submit", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    cookie: req.session.user_id,
    email: users[req.session.user_id]?.email,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    users: users,
    cookie: req.session.user_id,
    email: users[req.session.user_id]?.email,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = `http://${urlDatabase[req.params.shortURL].longURL}`;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id.id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id.id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
  }
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login-page");
});

app.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  const user = getUserByEmail(email, users);

  if (req.body["email"] === "" || req.body["password"] === "") {
    res.status(400).send("Error: fields must be filled");
  }

  if (
    check("email", req.body["email"], users) === true &&
    bcrypt.compareSync(password, user.password)
  ) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Error: email or password already exist");
  }
});

app.post("/register", (req, res) => {
  if (
    req.body["email"] === "" ||
    req.body["password"] === "" ||
    check("email", req.body["email"], users) === true
  ) {
    res.status(400).send("Error: email already exists");
  }
  let newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: req.body["email"],
    password: bcrypt.hashSync(req.body["password"], 10),
  };
  res.redirect("/login-page");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
