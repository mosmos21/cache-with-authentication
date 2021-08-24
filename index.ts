import express from "express";
import session from "express-session";
import morgan from "morgan";
import mysql from "mysql";
import multer from "multer";
import fs from "fs";

declare module "express-session" {
  interface SessionData {
    isLoggedIn: boolean;
  }
}

const upload = multer({ dest: 'tmp/uploads/' });

const conn = mysql.createConnection({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "app_development"
});
conn.connect();

const app = express();

app.set("view engine", "pug");

app.use(morgan("common"));

app.use(express.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || "session_secret",
  name: "_app",
  resave: true,
  saveUninitialized: true
}));

app.post("/sign_in", (req, res) => {
  req.session.isLoggedIn = true;
  res.redirect("/");
});

app.post("/sign_out", (req, res) => {
  delete req.session.isLoggedIn;
  res.redirect("/");
});

app.get("/authentication", (req, res) => {
  res.status(req.session.isLoggedIn ? 200 : 401).send();
});

app.post("/images", upload.single("file"), (req, res) => {
  if (!req.session.isLoggedIn) {
    if (req.file) {
      fs.rmSync(req.file.path);
    }
    res.status(401).redirect("/");
    return;
  }

  if (req.file) {
    conn.query({
      sql: "INSERT INTO `images` (`file_name`, `path`) VALUES (?, ?)",
      values: [req.file.originalname, req.file.path]
    });
  }

  res.redirect("/");
});

app.get<{ id: number }>("/images/:id", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.status(401).send();
    return;
  }

  conn.query({
   sql: "SELECT `path` FROM `images` WHERE `id` = ? LIMIT 1",
   values: [req.params.id]
  }, (err, results) => {
    if (err) {
      res.status(500).send();
      return;
    }

    if (Array.isArray(results) && "path" in results[0]) {
      const file = fs.readFileSync(results[0].path);
      res.set('Content-Type', 'image/png');
      res.send(file);
    }
  });
});

app.get("/", (req, res) => {
  conn.query(
    "SELECT `id`, `file_name` FROM `images`",
    (err, results) => {
      res.render("index", {
        isLoggedIn: !!req.session.isLoggedIn,
        images: err ? [] : results
      });
    }
  );
});

app.listen(3001, () => {
  console.log("server started.");
});
