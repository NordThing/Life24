const { MongoClient } = require('mongodb');
const DB_NAME = 'health';
const TRAININGS_COLL_NAME = "trainings";
const DB_PASSWORD = 'qgJ3hgFSX7xK7Xh8';
const uri = "mongodb+srv://admin:"+DB_PASSWORD+"@healthpwacluster.j1te5.mongodb.net/health?retryWrites=true&w=majority&poolSize=20";

async function getDBClient(){
    // const client = new MongoClient(uri);
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        return client;
    } catch (e) {
        console.error(e);
        return null;
    } finally {
        // await client.close();
    }
}

async function createResult(newTraining) {
    const client = await getDBClient();
    let id = null;
    if (client) {
        const result = await client.db(DB_NAME).collection(TRAININGS_COLL_NAME).insertOne(newTraining);
        id = result.insertedId;
        client.close();
    }
    return id;
}
async function getResults() {
    const client = await getDBClient();
    let results = [];
    if (client) {
        results = await client.db(DB_NAME).collection(TRAININGS_COLL_NAME).find().toArray();
        client.close();
    }
    return results;
}

exports.getResults = getResults;
exports.createResult = createResult;