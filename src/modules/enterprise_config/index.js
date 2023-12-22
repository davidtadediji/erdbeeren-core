// enterprise_data/index.js

import * as enterpriseConfig from './configurations/enterpriseConfig';
import * as enterpriseApi from './api/enterpriseApi';

export { enterpriseConfig, enterpriseApi };

// Start the API server
enterpriseApi.start();
