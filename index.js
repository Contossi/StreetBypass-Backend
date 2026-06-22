//glavni file
//Ovdje ce se nalazit: 
//spajanje sa db.js
//GET metoda "/", koja ce prikazivat mapu iz mapbox,
//POST metoda za dodavanje informacija i objekta na specificna mjesta na mapi te ubacivanje koordinata u db. 
import express from 'express';
import { connectToDatabase, getDb } from './db.js';
import { ObjectId } from 'mongodb';
import cors from 'cors'

const app = express();
app.use(express.json());
app.use(cors());
await connectToDatabase();


app.get("/api/obstacles", async (req, res) => {
    try {
        const lng = parseFloat(req.query.lng);
        const lat = parseFloat(req.query.lat);

        const db = getDb();
        
        const obstacles = await db.collection('obstacles').find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: 10000
                }
            }
        }).toArray();
        res.status(200).json(obstacles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/obstacles", async (req, res) => {
    try {
        const {type,location} = req.body;
        const newObstacle = {
            type: type,
            location: location,
            createdAt: new Date()
        };
        const db = getDb();
        const result = await db.collection('obstacles').insertOne(newObstacle);

        res.status(201).json({
            success: true,
            obstacle:{
                _id: result.insertedId.toString(),
                ...newObstacle
            }
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.delete("/api/obstacles/:id", async (req,res) => {
    try {
        const id = req.params.id
        const db = getDb()
        const result = await db.collection('obstacles').deleteOne({
            _id: new ObjectId(id)
        })

        if (result.deletedCount === 0) {
            return res.status(404).json({error: "Obstacle not found"})
        }

        res.status(200).json({success: true})
    
    }   catch (error){
        res.status(500).json({error: error.message})
    }
})      

const PORT = 3000;
app.listen(PORT, error => {
    if (error) {
        console.error(`Greška prilikom pokretanja poslužitelja: ${error.message}`);
    }  else {
        console.log(`Server radi na http://localhost:${PORT}`);
    }
})

console.log(process.env.MONGO_URI);
console.log(process.env.MONGO_DB_NAME);
