// src\modules\enterprise_config\routes\detailsRoutes.js
import * as enterpriseConfig from "../configurations/detailsConfig.js";
import logger from "../../../../logger.js";

import express from "express";
import { validateEnterpriseDetails } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/setEnterpriseDetails",validateEnterpriseDetails, async (req, res, next) => {
  try {
    logger.info("Body: ", req.body);
    const details = enterpriseConfig.setEnterpriseDetails(req.body);
    res.json({ message: "Enterprise details updated successfully", details });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

router.get("/getEnterpriseDetails", async (req, res, next) => {
  try {
    const details = enterpriseConfig.getEnterpriseDetails();
    res.json(details);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// Export the router
export default router;
