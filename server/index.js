const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const routing = require("./routing.js");
const api = require("./api.js");
const app = express();

app.use(bodyParser.json());

routing(app);
api(app);

app.use("/", express.static(path.join(__dirname, "../assets")));

app.listen(3000, () => {
    console.log("http://localhost:3000/");
});

