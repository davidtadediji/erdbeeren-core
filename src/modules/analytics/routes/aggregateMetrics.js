// src\modules\analytics\routes\metrics.js
import express from 'express';
import * as metricsController from '../controllers/aggregateMetricsController.js';

const router = express.Router();

router.get('/customer-satisfaction-trend', metricsController.getCustomerSatisfactionTrend);
router.get('/average-conversation-duration', metricsController.getAverageConversationDuration);
router.get('/response-time-trend', metricsController.getResponseTimeTrend);
router.get('/demographic-customer-analysis', metricsController.getDemographicCustomerAnalysis);
router.get('/high-frequency-customer-identification', metricsController.getHighFrequencyCustomerIdentification);
router.get('/overall-sentiment-trend', metricsController.getOverallSentimentTrend);

export default router;
