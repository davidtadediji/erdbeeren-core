// src\modules\analyticsEngine\eventListener.js
import eventEmitter from "./eventEmitter.js";
import messageQueue from "./messageQueue.js";
import logger from "../../../logger.js";

eventEmitter.on("newMessageCreated", ({ conversationId, messageId }) => {
  // logger.info("NewMessage recieved: " + conversationId + " and " + messageId);
  sendMessageToQueue(
    "frequencyOfInteractionsQueue",
    "newMessageCreated",
    conversationId
  );
  sendMessageToQueue(
    "conversationDurationQueue",
    "newMessageCreated",
    conversationId
  );
  sendMessageToQueue("entityRecognitionQueue", "newMessageCreated", messageId);
  // Add other queues as needed
});

eventEmitter.on("customerResponded", ({ conversationId, messageId }) => {
  // logger.info("CustomerResponded recieved: " + conversationId + " and " + messageId)
  sendMessageToQueue("customerProfileQueue", "customerResponded", messageId);
  sendMessageToQueue(
    "customerResponseTimeQueue",
    "customerResponded",
    conversationId
  );
  sendMessageToQueue("sentimentAnalysisQueue", "customerResponded", messageId);
});

eventEmitter.on("agentResponded", ({ messageId }) => {
  sendMessageToQueue("agentResponseTimeQueue", "agentResponded", messageId);
});

eventEmitter.on("interactionEnded", (message) => {
  // Schedule for one day later (86400000 milliseconds)
  setTimeout(() => {
    sendMessageToQueue("feedbackQueue", "interactionEnded", message);
  }, 86400000);
});

function sendMessageToQueue(queueName, event, data) {
  const message = { event, data };
  // logger.info("Send to message queue:" + JSON.stringify(message, null, 2))
  // Call a separate module to handle message production
  messageQueue.produceMessage(queueName, message);
}
