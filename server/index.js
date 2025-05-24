

require("dotenv").config(); 
const express = require("express"); //exports express.js library into file 
const { connectToMongoDB } = require("./database"); 
const app = express(); //instance of express

app.use(express.json()); 
// Add CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const router = require("./routes"); //import
app.use("/api", router); //at the endpoint use the router, all routes start with /api

const port = process.env.PORT || 5000; //if env works, 5000

async function startServer(){
    await connectToMongoDB(); //waits for MongoDB to connect , then..
    app.listen(port, () => {
    console.log('Server is listening on http://localhost:' + port); 
    }); 
/*starts the server, listens on the given port 5000, 
and runs when the server starts - back ticks allow variable interpolation*/

}

startServer(); //now server is connected to database 
