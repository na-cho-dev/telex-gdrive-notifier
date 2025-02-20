import express from 'express'
import { google } from 'googleapis'
import cors from 'cors'
import path from 'path'
// import bodyParser from 'body-parser'
import jsonIntegrationRouter from './routers/jsonIntegrationRouter.js'
import telexWebhookRouter from './routers/telexWebhookRouter.js'

const app = express();
const PORT = process.env.PORT || 3000;
const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH

app.use(express.json());
app.use(cors())
// app.use(bodyParser)
app.use(jsonIntegrationRouter)
app.use(telexWebhookRouter)

app.get('/', (req, res) => {
    res.status(200).json({message: 'Telex Drive Backup Notofier!'});
});

const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(serviceAccountPath),
    scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// Function to get files in a folder
async function listFiles(folderId) {
    try {
        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: "files(id, name, mimeType, modifiedTime)",
        });

        return res.data.files;
    } catch (error) {
        console.error("Error fetching files:", error);
        return [];
    }
}

app.get("/monitor/:folderId", async (req, res) => {
    const folderId = req.params.folderId;
    const files = await listFiles(folderId);
    
    if (files.length === 0) {
        return res.json({ message: "No files found in the folder." });
    }

    res.json({ files });
});

// (async () => {
//     const res = await drive.files.list();
//     console.log(res.data);
// })();

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT} : host http://localhost:${PORT}`);
});