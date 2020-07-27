const fs = require("fs");
const path = require("path");

module.exports = function (app) {
    app.get("/get-todos", (req, res) => {
        const data = loadData(req.session.login);
    
        res.setHeader("Content-Type", "application/json");
        res.send(data);
    });
    
    app.post("/toggle-todo", (req, res) => {
        const data = loadData(req.session.login);
        const num = req.body.num;
        if (data[num].completed) {
            data[num].completed = false;
        }
        else {
            data[num].completed = true;
        }
        saveData(req.session.login, data);
        res.send("ok");
    });
    
    app.post("/remove-todo", (req, res) => {
        const data = loadData(req.session.login);
        const num = req.body.num;
        data.splice(num, 1);
        saveData(req.session.login, data);
        res.send("ok");
    });
    
    app.post("/add-todo", (req, res) => {
        const data = loadData(req.session.login);
        const newtodo = req.body;
        data.push(newtodo);
        saveData(req.session.login, data);
        res.send("ok");
    });
    
    app.post("/remove-completed", (req, res) => {
        const data = loadData(req.session.login);
        const newData = data.filter(x => !x.completed);
        saveData(req.session.login, newData);
        res.send("ok");
    });
    
    app.post("/all-toggle", (req, res) => {
        const data = loadData(req.session.login);
        const check = req.body;
        if (check.check)  {
            data.forEach(item => {
                item.completed = true;
            });
        }else {
            data.forEach(item => {
                item.completed = false;
            });
        }
        saveData(req.session.login, data);
        res.send("ok");
    });
    
    function loadData(login) {
        return JSON.parse(fs.readFileSync(path.join(__dirname, `data/${login}.json`)));
    }
    
    function saveData(login, data) {
        fs.writeFileSync(path.join(__dirname, `data/${login}.json`), JSON.stringify(data));
    }
};