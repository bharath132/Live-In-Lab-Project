import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://x_subas_X:Subash%232004@cluster0.gua9efp.mongodb.net/Agriadvisor?retryWrites=true&w=majority&appName=Cluster0";
let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI not set, using hardcoded URI.");
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;
