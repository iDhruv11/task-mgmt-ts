import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Task Manager API Running");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
