// setup express server
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// setup routes
const routes = require("./routes");
app.use("/api", routes);
// start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// export app for testing
module.exports = app;
