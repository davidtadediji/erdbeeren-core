// enterprise_data/index.js

import * as enterpriseConfig from './configurations/enterpriseConfig';
import * as enterpriseApi from './routes/enterpriseRoutes';

export { enterpriseConfig, enterpriseApi };

// Start the API server
enterpriseApi.start();
