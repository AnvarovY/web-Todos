const ObjectId = require('mongodb').ObjectId;

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

        if (data[num].todo.completed) {
            data[num].todo.completed = false;
        }
        else {
            data[num].todo.completed = true;
        }
        saveData(req.session.user._id, data[num]._id, data[num].todo);
        res.send("ok");
    });
    
    app.post("/remove-todo", async (req, res) => {
        const data = await loadData(req.session.user._id);
        const num = req.body.num;
        removeData(req.session.user._id, data[num]._id);
        res.send("ok");
    });
    
    app.post("/add-todo", async (req, res) => {
        const data = db.collection("data");
        const newtodo = req.body;

        await data.insertOne({ todo: newtodo, userId: req.session.user._id });
        res.send("ok");
    });
    
    app.post("/remove-completed", async (req, res) => {
        const data = await loadData(req.session.user._id);
        
        data.forEach(item => {
            if (item.todo.completed) {
                removeData(req.session.user._id, item._id);
            }
        });
        res.send("ok");
    });
    
    app.post("/all-toggle", async (req, res) => {
        const data = await loadData(req.session.user._id);
        const check = req.body;

        data.forEach(item => {
            item.todo.completed = !!check.check;
            saveData(req.session.user._id, item._id, item.todo);
        });
        res.send("ok");
    });
    
    async function loadData(userId) {
        const data = db.collection("data");

        return await data.find({userId: userId}).toArray()
    }
    
    async function saveData(userId, todoid, userData) {
        const data = db.collection("data");

        await data.updateOne({ userId: userId, _id: ObjectId(todoid) }, { $set: {todo: userData}});
    }

    async function removeData(userId, todoid) {
        const data = db.collection("data");

        await data.remove({ userId: userId, _id: ObjectId(todoid) });
    }
};