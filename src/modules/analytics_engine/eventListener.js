// src\modules\analyticsEngine\eventListener.js
import eventEmitter from './eventEmitter.js';
import messageQueue from './messageQueue.js';

eventEmitter.on('interactionTurnCompleted', (message) => {
  sendMessageToQueue('sentimentAnalysisQueue', 'interactionTurnCompleted', message);
});

eventEmitter.on('newMessageCreated', (message) => {
  sendMessageToQueue('frequencyOfInteractionsQueue', 'newMessageCreated', message);
  sendMessageToQueue('conversationDurationQueue', 'newMessageCreated', message);
  // Add other queues as needed
});

eventEmitter.on('customerResponded', (message) => {
  sendMessageToQueue('customerProfileQueue', 'customerResponded', message);
});

eventEmitter.on('agentResponded', (message) => {
  sendMessageToQueue('responseTimeMetricsQueue', 'agentResponded', message);
});

eventEmitter.on('interactionEnded', (message) => {
  // Schedule for one day later (86400000 milliseconds)
  setTimeout(() => {
    sendMessageToQueue('feedbackQueue', 'interactionEnded', message);
  }, 86400000);
});

function sendMessageToQueue(queueName, event, data) {
  const message = { event, data };
  // Call a separate module to handle message production
  messageQueue.produceMessage(queueName, message);
}
