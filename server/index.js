const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const routing = require("./routing.js");
const api = require("./api.js");
const app = express();
const session = require("express-session");
const MongoClient = require("mongodb").MongoClient;

const mongoClient = new MongoClient("mongodb://localhost:27017/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(
    session({
        secret: "?v>=Q<'`Ud!C)8Uh",
        saveUninitialized: true,
        resave: false,
    })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let db;
mongoClient.connect((err, client) => {
    if (err) {
        return console.log(err);
    }
    db = client.db("web_todos");
    
    routing(app, db);
    api(app, db);
    
    app.use("/", express.static(path.join(__dirname, "../assets")));
    
    app.listen(3000, () => {
        console.log("http://localhost:3000/");
    });
});


