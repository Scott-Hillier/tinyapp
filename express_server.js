const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers.js"); // Function used for getting user information from a given email
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

// Used for verifying that emails are matching
const check = (thingToCheck, thing, users) => {
  for (const user in users) {
    if (users[user][thingToCheck] === thing) {
      return true;
    }
  }
  return false;
};

app.set("view engine", "ejs");

// Databases:
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

function generateRandomString() {
  return Math.random().toString(16).substr(2, 6);
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Loads index page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.session.user_id,
    email: users[req.session.user_id]?.email,
  };
  console.log("URLDATABASE", urlDatabase);
  console.log("REQ.PARAMS", req.session.user_id);
  res.render("urls_index", templateVars);
});

// Loads the registration page
app.get("/register", (req, res) => {
  const templateVars = { users: users, user_id: req.session.user_id };
  res.render("urls_register", templateVars);
});

// Loads the login page
app.get("/login", (req, res) => {
  const templateVars = { users: users, user_id: req.session.user_id };
  res.render("urls_login", templateVars);
});

// Loads the Create New URL page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.send("Must be logged in to create a new URL");
  }
  const templateVars = {
    users: users,
    user_id: req.session.user_id,
    email: users[req.session.user_id].email,
  };
  res.render("urls_new", templateVars);
});

// Generates the short URL and redirects to the index page
app.post("/urls/new/submit", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    user_id: req.session.user_id,
    email: users[req.session.user_id].email,
  };
  res.redirect(`/urls/${shortURL}`);
});

// Loads the Edit page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    users: users,
    user_id: req.session.user_id,
    email: users[req.session.user_id].email,
  };
  res.render("urls_show", templateVars);
});

// Hyperlinks the short URLs
app.get("/u/:shortURL", (req, res) => {
  const longURL = `http://${urlDatabase[req.params.shortURL].longURL}`;
  res.redirect(longURL);
});

// Deletes the saved URL if the creator is logged in
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].user_id) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

// Redirects to the Edit page
app.post("/urls/:shortURL/edit", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

// Allows the creator of the URL to edit the chosen URL
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].user_id) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.longURL,
      user_id: req.session.user_id,
      email: users[req.session.user_id].email,
    };
  } else {
    res.send("Error: Cannot access URLs of other people");
  }
  res.redirect(`/urls/${req.params.shortURL}`);
});

// Logout and delete cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Verifies that the login information is correct, creates encrypted cookies, and brings the user to the index page
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
    res.status(403).send("Error: email or passwords do not match");
  }
});

// Allows the user to register on the website and verifies that the given url does not already exist
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
  res.redirect("/login");
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

// Notifies that the server is listening and functioning
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
