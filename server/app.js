// setup express server
const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup routes
app.use("/api", router);

// export app for testing
module.exports = app;
