// src\modules\enterprise_config\routes\detailsRoutes.js
import logger from "../../../../logger.js";
import * as enterpriseConfig from "../configurations/detailsConfig.js";

import express from "express";
import { authenticateJWT, hasPermission } from "../../authentication/middleware/authMiddleware.js";
import { validateEnterpriseDetails } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/set-enterprise-details",
  authenticateJWT, 
  hasPermission(["manageConfiguration"]),
  validateEnterpriseDetails, 
  async (req, res, next) => {
    try {
      logger.info("Body: ", req.body);
      const details = await enterpriseConfig.setEnterpriseDetails(req.body);
      res.json({ message: "Enterprise details updated successfully", details });
    } catch (error) {
      next(error); 
    }
  }
);

router.get("/get-enterprise-details", async (req, res, next) => {
  try {
    const details = await enterpriseConfig.getEnterpriseDetails();
    res.json(details);
  } catch (error) {
    next(error); 
  }
});

export default router;
