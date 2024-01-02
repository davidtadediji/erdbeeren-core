// src\modules\enterprise_config\routes\detailsRoutes.js
import * as enterpriseConfig from "../configurations/detailsConfig.js";
import logger from "../../../../logger.js";

import express from "express";
import { validateEnterpriseDetails } from "../middlewares/validationMiddleware.js";
import { authenticateJWT, hasPermission } from "../../authentication/middleware/authMiddleware.js";
import { ROLES } from "../../authentication/config/roles.js";

const router = express.Router();

// Protect the route with authentication and permission check
router.post(
  "/setEnterpriseDetails",
  authenticateJWT, // Ensure the user is authenticated
  hasPermission([ROLES.ADMIN]), // Ensure the user has the 'admin' role
  validateEnterpriseDetails, // Validate the request payload
  async (req, res, next) => {
    try {
      logger.info("Body: ", req.body);
      const details = await enterpriseConfig.setEnterpriseDetails(req.body);
      res.json({ message: "Enterprise details updated successfully", details });
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  }
);

router.get("/getEnterpriseDetails", async (req, res, next) => {
  try {
    const details = await enterpriseConfig.getEnterpriseDetails();
    res.json(details);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// Export the router
export default router;
