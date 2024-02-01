const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "blog",
});

app.use((req, res, next) => {
  if (req.session.userId === undefined) {
    // res.redirect('/login');
    console.log("Anda tidak login");
    res.locals.username = "Tamu";
    res.locals.isLoggedIn = false;
  } else {
    console.log("Anda telah login");
    res.locals.username = req.session.username;
    res.locals.isLoggedIn = true;
  }
  next();
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/list", (req, res) => {
  connection.query("SELECT * FROM articles", (error, results) => {
    res.render("list.ejs", { articles: results });
  });
});

app.get("/article/:id", (req, res) => {
  const id = req.params.id;
  connection.query("SELECT * FROM articles WHERE id = ?", [id], (error, results) => {
    res.render("article.ejs", { article: results[0] });
  });
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (error, results) => {
      if (results.length > 0) {
        if (req.body.password == results[0].password) {
          req.session.userId = results[0].id;
          req.session.username = results[0].username;
          res.redirect("/list");
        } else {
          res.redirect("/login");
        }
      }
    }
  );
});

app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    res.redirect("/list");
  });
});

app.listen(3000);
