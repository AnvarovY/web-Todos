const fs = require("fs");
const path = require("path");

/**
 * @param {import('mongodb').Db} db
 */

module.exports = function (app, db) {
    app.get("/", (req, res) => {
        if (!req.session.user) {
            res.redirect("/login/");
            return;
        }

        const html = fs
            .readFileSync(path.join(__dirname, "../assets/index.html"))
            .toString()
            .replace("{{login}}", req.session.user.login);
        
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    });
    
    app.get("/login/", (req, res) => {
        let html = fs
            .readFileSync(path.join(__dirname, "../assets/login/index.html"))
            .toString();

        if (req.session.invalidLoginPassword) {
            delete req.session.invalidLoginPassword;
            html = html.replace(
                "{{message}}",
                '<div class="input invalid">Неправильный логин или пароль</div>'
            );
        } else {
            html = html.replace("{{message}}", "");
        }
        res.setHeader("Content-Type", "text/html");

        res.send(html);
    });

    app.post("/login/", async (req, res) => {
        const login = req.body.login;
        const password = req.body.password;

        const users = db.collection("users");
        const user = await users.findOne({ login: login, password: password });

        if (user) {
            req.session.user = user;
            res.redirect("/");
        } else {
            req.session.invalidLoginPassword = true;
            res.redirect("/login/");
        }
    });


    app.get("/registration/", (req, res) => {
        let html = fs
            .readFileSync(path.join(__dirname, "../assets/registration/index.html"))
            .toString();

        if (req.session.passwordsMissmatch) {
            delete req.session.passwordsMissmatch;
            html = html.replace(
                "{{message}}",
                '<div class="input invalid">Пароли не совпадают</div>'
            );
        } else if (req.session.existingUser) {
            delete req.session.existingUser;
            html = html.replace(
                "{{message}}",
                '<div class="input invalid">Пользователь с таким логином уже существует</div>'
            );
        } else if (req.session.emptyLoginPassword) {
            delete req.session.emptyLoginPassword;
            html = html.replace(
                "{{message}}",
                '<div class="input invalid">Не указан логин или пароль</div>'
            );
        } else {
            html = html.replace("{{message}}", "");
        }
        res.setHeader("Content-Type", "text/html");

        res.send(html);
    });

    app.post("/registration/", async (req, res) => {
        const login = req.body.login;
        const password = req.body.password;
        const passwordRepeat = req.body["password-repeat"];

        const users = db.collection("users");
        const user = await users.findOne({ login: login });

        if (password !== passwordRepeat) {
            req.session.passwordsMissmatch = true;
            res.redirect("/registration/");
        } else if (user) {
            req.session.existingUser = true;
            res.redirect("/registration/");
        } else if (!login || !password) {
            req.session.emptyLoginPassword = true;
            res.redirect("/registration/");
        } else {
            const result = await users.insertOne({
                login: login,
                password: password,
            });
            const user_ = result.ops[0];
            
            req.session.user = user_;

            res.redirect("/");
        }
    });

    app.post("/logout/", (req, res) => {
        delete req.session.user;
        res.redirect("/login/");
    });
};