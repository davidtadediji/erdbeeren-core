
// src\modules\enterprise_config\routes\detailsRoutes.js

import * as enterpriseConfig from '../configurations/detailsConfig.js';
import logger from '../../../../logger.js';

export const setEnterpriseDetails = (req, res) => {
  logger.info("Body: ", req.body)
  const details = enterpriseConfig.setEnterpriseDetails(req.body);
  res.json({ message: 'Enterprise details updated successfully', details });
};

export const getEnterpriseDetails = (req, res) => {
  const details = enterpriseConfig.getEnterpriseDetails();
  res.json(details);
};
