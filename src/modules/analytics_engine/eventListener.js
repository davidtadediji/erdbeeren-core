// src\modules\analyticsEngine\eventListener.js
import eventEmitter from './eventEmitter.js';
import messageQueue from './messageQueue.js';
import logger from "../../../logger.js"


eventEmitter.on('newMessageCreated', (message) => {
  logger.info("New message created listened.")
  sendMessageToQueue('frequencyOfInteractionsQueue', 'newMessageCreated', message);
  sendMessageToQueue('conversationDurationQueue', 'newMessageCreated', message);
  // Add other queues as needed
});

eventEmitter.on('customerResponded', (message) => {
  sendMessageToQueue('customerProfileQueue', 'customerResponded', message);
  sendMessageToQueue('customerResponseTimeQueue', 'customerResponded', message);
  sendMessageToQueue('sentimentAnalysisQueue', 'interactionTurnCompleted', message);

});

eventEmitter.on('agentResponded', (message) => {
  sendMessageToQueue('agentResponseTimeQueue', 'agentResponded', message);
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
