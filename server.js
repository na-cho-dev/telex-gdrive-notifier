import express from 'express'
import cors from 'cors'
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

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT} : host http://localhost:${PORT}`);
});