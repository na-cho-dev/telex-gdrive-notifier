import express, { Router } from "express";
import jsonIntegration from "../controllers/jsonIntegrationController";

const jsonIntegrationRouter: Router = express.Router();

jsonIntegrationRouter.get("/integration.json", jsonIntegration);

export default jsonIntegrationRouter;
