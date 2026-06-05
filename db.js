//Spajanje na bazu
import dns from 'node:dns';
//Nakon instalacije Node.js 24.16.0, aplikacija više nije radila pa su potrebne ove dvije linije koda kako bi opet sve funkcioniralo kako treba
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

dns.setServers(['8.8.8.8', '1.1.1.1']);
config();

const mongoURI = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;
let dbI = null;

async function connectToDatabase() {
    try {
        const client = new MongoClient(mongoURI);
        await client.connect(); 
        console.log('Uspješno spajanje na bazu podataka');
        dbI = client.db(dbName); 
        await dbI.collection('obstacles').createIndex({ location: "2dsphere" });
        
        console.log("Upsiješno spajanje na bazu podataka");
        return dbI;
    } catch (error) {
        console.error('Greška prilikom spajanja na bazu podataka', error);
        throw error;
    }
}
function getDb() {
    if (!dbI) {
        throw new Error("Baza podataka nije inicijalizirana! Prvo pokreni connectToDatabase().");
    }
    return dbI;
}

export { connectToDatabase, getDb };