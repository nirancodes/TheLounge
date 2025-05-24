const express = require("express"); 
const router = express.Router();
const { getConnectedClient } = require("./database");
const { ObjectId } = require("mongodb"); 
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const getCollection = () => {
    const client = getConnectedClient(); 
    const collection = client.db("todosdb").collection("todos"); 
    return collection; 
}

// GET all todos
router.get("/todos", async (req, res) => {
    try {
        const collection = getCollection(); 
        const todos = await collection.find({}).toArray();
        res.status(200).json(todos); 
    } catch (error) {
        console.error("GET /todos error:", error);
        res.status(500).json({ error: "Database error" });
    }
}); 

// POST new todo
router.post("/todos", async (req, res) => {
    try {
        const collection = getCollection(); 
         let { todo, status = false, deadline = null } = req.body;
        
         if (!todo || typeof todo !== "string" || !todo.trim()) {
    return res.status(400).json({ mssg: "Invalid or empty todo" });
  }
        
        const newTodo = await collection.insertOne({
    todo: todo.trim(),
    status,
    deadline,
  });
        res.status(201).json({
    todo: todo.trim(),
    status,
    deadline,
    _id: newTodo.insertedId,
  });
    } catch (error) {
        console.error("POST /todos error:", error);
        res.status(500).json({ error: "Database error" });
    }
}); 



// DELETE todo
router.delete("/todos/:id", async (req, res) => {
    try {
        const collection = getCollection(); 
        const _id = new ObjectId(req.params.id);
        const result = await collection.deleteOne({ _id }); 
        res.status(200).json(result); 
    } catch (error) {
        console.error("DELETE /todos error:", error);
        res.status(500).json({ error: "Database error" });
    }
}); 

// PUT update todo
router.put("/todos/:id", async (req, res) => {
    try {
        const collection = getCollection(); 
        const _id = new ObjectId(req.params.id);
        const { status } = req.body;
        
        if (typeof status !== "boolean") {
            return res.status(400).json({ error: "Status must be boolean" }); 
        }
        
        const result = await collection.updateOne({ _id }, { $set: { status } });
        res.status(200).json(result); 
    } catch (error) {
        console.error("PUT /todos error:", error);
        res.status(500).json({ error: "Database error" });
    }
}); 

//GET QUOTE:
router.get("/quote", async (req, res) => {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();
    res.status(200).json(data[0]); // sends one quote object
  } catch (err) {
    console.error("Quote fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});


module.exports = router;