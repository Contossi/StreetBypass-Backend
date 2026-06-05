//Spajanje na bazu
import dns from 'node:dns';
//Nakon instalacije Node.js 24.16.0, aplikacija više nije radila pa su potrebne ove dvije linije koda kako bi opet sve funkcioniralo kako treba
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

dns.setServers(['8.8.8.8', '1.1.1.1']);
config();

let mongoURI = process.env.MONGO_URI;
let db_name = process.env.MONGO_DB_NAME;
let db = await connectToDatabase();

async function connectToDatabase() {
    try {
        const client = new MongoClient(mongoURI);
        await client.connect(); 
        console.log('Uspješno spajanje na bazu podataka');
        let db = client.db('naziv_baze_podataka'); 
        return db;
    } catch (error) {
        console.error('Greška prilikom spajanja na bazu podataka', error);
        throw error;
    }
}


export { connectToDatabase };