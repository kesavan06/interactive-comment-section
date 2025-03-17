const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pubDir = path.join(__dirname, "/public");
const viewPath = path.join(__dirname, "/view");

app.set("view engine", "ejs");
app.set("views", viewPath);
app.use(express.static(pubDir));

const dbConnection = mysql.createConnection({
  host: "mysql-1adb12a9-kesavan-bed8.h.aivencloud.com",
  port:"17832",
  user: "avnadmin",
  password: "AVNS_sQ94r5cb1uAh-xBI6qf",
  database: "defaultdb",
});

dbConnection.connect((err) => {
  if (err) {
    console.log("Not connected: " + err);
  } else {
    console.log("database connected");
  }
});

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/login", async (req, res) => {
  try {
    const userDetails = await checkUser();
    if (userDetails.length === 0) {
      await insertUser();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/comments", async (req, res) => {
  try {
    const getComments = () => {
      return new Promise((resolve, reject) => {
        dbConnection.query(
          `SELECT c.*, 
           (SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.id) as reply_count 
           FROM comments c 
           ORDER BY created_at DESC`,
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });
    };
    const comments = await getComments();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.post("/comment", async (req, res) => {
  try {
    const insertComment = () => {
      return new Promise((resolve, reject) => {
        dbConnection.query(
          "INSERT INTO comments (username, content, parent_id, likes) VALUES (?, ?, ?, 0)",
          [req.body.userName, req.body.comment, req.body.parentId || null],
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          }
        );
      });
    };
    await insertComment();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

app.post("/like", async (req, res) => {
  try {
    await dbConnection.query(
      "UPDATE comments SET likes = likes + ? WHERE id = ?",
      [req.body.value, req.body.commentId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update likes" });
  }
});

app.listen(3020, () => {
  console.log("Server connected: http://localhost:3020");
});