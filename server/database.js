
//GETTING THE KEY (MONGODB CONNECTION STRING)
require("dotenv").config(); 
//reads secrets from a .env file so as to not share them accidently 

const { MongoClient, ServerApiVersion } = require("mongodb"); 
//MongoClient is a tool from MongoDB that allows app to talk to the database: key

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/"; 
//address of MongoDB - allows for both cloud database (like Atlas), or the default/local one


//SETTING UP "RULES" FOR THE KEY (CONNECTION OPTIONS)
const options = { //extra rules for how the key works
    serverApi:{
        version: ServerApiVersion.v1, 
        strict: true, 
        depricationErrors: true, //for old, outdated cmmds
    }
}; 

//not making a client all the time - use the same client if already connected 
let client; //think: a box to store the connection key, so as to not loose it 
const connectToMongoDB = async () => { //async for a function that is going to do something that takes time - without it the app would crash due to no data
    if(!client){ //do I already have akey? 
        try{ //if not, make a new key
            client = await MongoClient.connect(uri,options); //waits for fetching the data from the database; app pauses until database responds 
            console.log("Connected to MongoDB"); 
        }catch(error){ //if smth goes wrong, log the error 
            console.log(error); 
        }
    }
    return client; //return the key 
    //app doesn't make a new key every time and reuses the same ones 
}; 

const getConnectedClient = () => client; //allows other files to ask for the client key 

module.exports = {connectToMongoDB,getConnectedClient}; //makes these functions available to other files 

