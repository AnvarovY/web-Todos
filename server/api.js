const fs = require("fs");
const path = require("path");
 

/**
 * @param {import('mongodb').Db} db
 */
module.exports = function (app, db) {
    app.get("/get-todos", async (req, res) => {
        const data = await loadData(req.session.user._id);
    
        res.setHeader("Content-Type", "application/json");
        res.send(data);
    });
    
    app.post("/toggle-todo", async (req, res) => {
        const data = await loadData(req.session.user._id);
        const num = req.body.num;

        if (data.listTodos[num].completed) {
            data.listTodos[num].completed = false;
        }
        else {
            data.listTodos[num].completed = true;
        }
        saveData(req.session.user._id, data.listTodos);
        res.send("ok");
    });
    
    app.post("/remove-todo", async (req, res) => {
        const data = await loadData(req.session.user._id);
        const num = req.body.num;

        data.listTodos.splice(num, 1);
        saveData(req.session.user._id, data.listTodos);
        res.send("ok");
    });
    
    app.post("/add-todo", async (req, res) => {
        const data = await loadData(req.session.user._id);
        const newtodo = req.body;
        
        data.listTodos.push(newtodo);
        saveData(req.session.user._id, data.listTodos);
        res.send("ok");
    });
    
    app.post("/remove-completed", async (req, res) => {
        const data = await loadData(req.session.user._id);
        const newData = data.listTodos.filter(x => !x.completed);

        saveData(req.session.user._id, newData);
        res.send("ok");
    });
    
    app.post("/all-toggle", async (req, res) => {
        const data = await loadData(req.session.user._id);
        const check = req.body;

        data.listTodos.forEach(item => {
            item.completed = !!check.check;
        });
        saveData(req.session.user._id, data.listTodos);
        res.send("ok");
    });
    
    async function loadData(userId) {
        const data = db.collection("data");
        /* или в случае поиска по ObjectId
        const ObjectId = require('mongodb').ObjectId;
    
        const o_id = new ObjectId(userId);
        return await data.findOne({ userId: o_id });
        
        или return await data.findOne({ userId: ObjectId(userId) });
        */
        return await data.findOne({ userId: userId });
    }
    
    async function saveData(userId, userData) {
        const data = db.collection("data");

        await data.updateOne({ userId: userId }, { $set: {listTodos: userData}});
    }
};