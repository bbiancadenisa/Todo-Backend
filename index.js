const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3001;
const Todo = require("./schemas/Todo");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello App");
});

app.get("/all-todos", async (req, res) => {
  try {
    let query = Todo.find();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * pageSize;
    const total = await Todo.countDocuments();
    const pages = Math.ceil(total / pageSize);
    query = query.skip(skip).limit(pageSize);

    if (page > pages) {
      res.status(404).json({
        status: "fail",
        message: "page not found",
      });
    }

    const result = await query;
    return res.status(200).json({
      count: result.length,
      page,
      pages,
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json(err);
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const result = await Todo.findByIdAndDelete(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(404).json(err);
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const result = await Todo.findOneAndUpdate(
      { _id: req.params.id },
      {
        tasks: req.body.tasks,
      }
    );
    console.log(result);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(404).json(err);
  }
});

app.post("/add-todo", async (req, res) => {
  console.log("Body: ", req.body);
  const todo = new Todo(req.body);
  const result = await todo.save();
  return res.status(200).json(result);
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  next();
});

app.use("*", (req, res) =>
  res.status(404).json({ message: "Pagina nu a fost gasita" })
);

const mongoURI = "mongodb://localhost:27017";
mongoose.connect(
  mongoURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to database");
  }
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
