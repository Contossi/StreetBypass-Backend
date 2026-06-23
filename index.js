import express from 'express';
import { connectToDatabase, getDb } from './db.js';
import { ObjectId } from 'mongodb';
import cors from 'cors'
import { hashPassword, checkPassword, generateJWT, authMiddleware } from './auth.js'

const app = express();
app.use(express.json());
app.use(cors());
await connectToDatabase();


app.get("/api/obstacles", async (req, res) => {
    try {
        const west = Number(req.query.west)
        const south = Number(req.query.south)
        const east = Number(req.query.east)
        const north = Number(req.query.north)

        if (
            !Number.isFinite(west) ||
            !Number.isFinite(south) ||
            !Number.isFinite(east) ||
            !Number.isFinite(north)
        ) {
            return res.status(400).json({
                error: "Valid west, south, east and north bounds are required"
            })
        }
        const viewport ={
            type:"Polygon",
            coordinates: [[
                [west,south],
                [east, south],
                [east, north],
                [west, north],
                [west, north],
                [west, south]
            ]]
        }

        const db = getDb();

        const obstacles = await db.collection('obstacles').find({
            location: {
                $geoIntersects: {
                    $geometry: viewport

                }
            }
        }).toArray();
        res.status(200).json(obstacles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ error: 'Korisničko ime i lozinka su obavezni' })
        }
        const db = getDb()
        const existing = await db.collection('users').findOne({ username })
        if (existing) {
            return res.status(400).json({ error: 'Korisničko ime već postoji' })
        }
        const hashedPassword = await hashPassword(password)
        if (!hashedPassword) {
            return res.status(500).json({ error: 'Greška pri hashiranju lozinke' })
        }
        await db.collection('users').insertOne({ username, password: hashedPassword })
        res.status(201).json({ message: 'Korisnik uspješno registriran' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ error: 'Korisničko ime i lozinka su obavezni' })
        }
        const db = getDb()
        const user = await db.collection('users').findOne({ username })
        if (!user) {
            return res.status(401).json({ error: 'Neispravni podaci za prijavu' })
        }
        const valid = await checkPassword(password, user.password)
        if (!valid) {
            return res.status(401).json({ error: 'Neispravni podaci za prijavu' })
        }
        const token = await generateJWT({ id: user._id.toString(), username: user.username })
        if (!token) {
            return res.status(500).json({ error: 'Greška pri generiranju tokena - provjeri JWT_SECRET na serveru' })
        }
        res.status(200).json({ jwt_token: token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post("/api/obstacles", authMiddleware, async (req, res) => {
    try {
        const {type,location} = req.body;
        const newObstacle = {
            type: type,
            location: location,
            createdAt: new Date(),
            addedBy: req.authorised_user.username
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

app.put("/api/obstacles/:id", authMiddleware, async (req,res) => {
    try{
        const id =req.params.id
        const {type,location} = req.body

        if(!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "invalid obstacle ID" })
        }

        if(!type || !location) {
            return res.status(400).json({
                error:"type and location are required"
            })
        }

        const db = getDb()

        const result = await db.collection("obstacles").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    type,
                    location,
                    updatedAt:new Date()
                }
            }
        )

        if(result.matchedCount === 0) {
            return res.status(404).json({ error: "Obstacle not found"})
        }
        const updatedObstacle = await db.collection("obstacles").findOne({
            _id: new ObjectId(id)
        })

        res.status(200).json({
            success: true,
            obstacle: {
                ...updatedObstacle,
                _id: updatedObstacle._id.toString()
            }
        })
    }   catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.delete("/api/obstacles/:id", authMiddleware, async (req,res) => {
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
