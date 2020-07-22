const fs = require("fs");
const path = require("path");

module.exports = function (app) {
    app.get("/", (req, res) => {
        const html = fs
            .readFileSync(path.join(__dirname, "../assets/index.html"))
            .toString();
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    });
    
    app.get("/login/", (req, res) => {
        const html = fs
            .readFileSync(path.join(__dirname, "../assets/login/index.html"))
            .toString();

        // говорим, что ответом будет документ в формате html
        res.setHeader("Content-Type", "text/html");

        // отсылаем документ клиенту
        res.send(html);
    });

    app.get("/registration/", (req, res) => {
        const html = fs
            .readFileSync(path.join(__dirname, "../assets/registration/index.html"))
            .toString();

        // говорим, что ответом будет документ в формате html
        res.setHeader("Content-Type", "text/html");

        // отсылаем документ клиенту
        res.send(html);
    });
};