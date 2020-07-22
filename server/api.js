const fs = require("fs");
const path = require("path");

module.exports = function (app) {
    app.get("/get-todos", (req, res) => {
        const data = loadData();
    
        res.setHeader("Content-Type", "application/json");
        res.send(data);
    });
    
    app.post("/toggle-todo", (req, res) => {
        const data = loadData();
        const num = req.body.num;
        if (data[num].completed) {
            data[num].completed = false;
        }
        else {
            data[num].completed = true;
        }
        saveData(data);
        res.send("ok");
    });
    
    app.post("/remove-todo", (req, res) => {
        const data = loadData();
        const num = req.body.num;
        data.splice(num, 1);
        saveData(data);
        res.send("ok");
    });
    
    app.post("/add-todo", (req, res) => {
        const data = loadData();
        const newtodo = req.body;
        data.push(newtodo);
        saveData(data);
        res.send("ok");
    });
    
    app.post("/remove-completed", (req, res) => {
        const data = loadData();
        const newData = data.filter(x => !x.completed);
        saveData(newData);
        res.send("ok");
    });
    
    app.post("/all-toggle", (req, res) => {
        const data = loadData();
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
        saveData(data);
        res.send("ok");
    });
    
    function loadData() {
        return JSON.parse(fs.readFileSync(path.join(__dirname, "../data.json")));
    }
    
    function saveData(data) {
        fs.writeFileSync(path.join(__dirname, "../data.json"), JSON.stringify(data));
    }
};