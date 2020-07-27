const fs = require("fs");
const path = require("path");

module.exports = function (app) {
    app.get("/", (req, res) => {
        if (!req.session.login) {
            res.redirect("/login/");
            return;
        }

        const html = fs
            .readFileSync(path.join(__dirname, "../assets/index.html"))
            .toString()
            .replace("{{login}}", req.session.login);
        
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

    app.post("/login/", (req, res) => {
        const login = req.body.login;
        const password = req.body.password;

        const users = JSON.parse(
            fs.readFileSync(path.join(__dirname, "users.json"))
        );
        const user = users.find(
            (x) => x.login === login && x.password === password
        );

        if (user) {
            req.session.login = login;
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

    app.post("/registration/", (req, res) => {
        const login = req.body.login;
        const password = req.body.password;
        const passwordRepeat = req.body["password-repeat"];

        const users = JSON.parse(
            fs.readFileSync(path.join(__dirname, "users.json"))
        );

        if (password !== passwordRepeat) {
            req.session.passwordsMissmatch = true;
            res.redirect("/registration/");
        } else if (users.some((x) => x.login === login)) {
            req.session.existingUser = true;
            res.redirect("/registration/");
        } else if (!login || !password) {
            req.session.emptyLoginPassword = true;
            res.redirect("/registration/");
        } else {
            users.push({ login: login, password: password });
            fs.writeFileSync(
                path.join(__dirname, "users.json"),
                JSON.stringify(users)
            );

            fs.writeFileSync(
                path.join(__dirname, `data/${login}.json`),
                JSON.stringify([])
            );

            req.session.login = login;

            res.redirect("/");
        }
    });

    app.post("/logout/", (req, res) => {
        delete req.session.login;
        res.redirect("/login/");
    });
};