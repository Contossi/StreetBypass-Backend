//glavni file
//Ovdje ce se nalazit: 
//spajanje sa db.js
//GET metoda "/", koja ce prikazivat mapu iz mapbox,
//POST metoda za dodavanje informacija i objekta na specificna mjesta na mapi te ubacivanje koordinata u db. 
import express from 'express';
import { connectToDatabase } from './db.js';
import createObstacle from './models/Obstacle.js';

const app = express();
app.use(express.json());
let db = await connectToDatabase();

await obstaclesCollection.createIndex({ location: '2dsphere' });

const testObstacle = createObstacle({
    type:'lp1', //crv

    location: {
        type: 'Point',
        coordinates: [13.853656,44.85282]
    },
     city: 'Pula',
     verified: true,
     addedBy: 'user101'
});

async function testSave() {
    try {
        const result = await obstaclesCollection.insertOne(testObstacle);
        console.log('Prepreka uspješno pohranjena', result_insertedId);
        console.log(' createdAt: ', testObstacle.createdAt);
    }   catch (err) {
        console.error('Greška pri pohrani:', err.message);
    }
}
await testSave();


app.get("/", (req, res) => {
    res.send("StreetBypass navigacija");
});




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
