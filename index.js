//glavni file
//Ovdje ce se nalazit: 
//spajanje sa db.js
//GET metoda "/", koja ce prikazivat mapu iz mapbox,
//POST metoda za dodavanje informacija i objekta na specificna mjesta na mapi te ubacivanje koordinata u db. 
import express from 'express';
import { connectToDatabase } from './db.js';

const app = express();
let db = await connectToDatabase();

app.use(express.json());

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
