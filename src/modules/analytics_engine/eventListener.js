// src\modules\analyticsEngine\eventListener.js
import conversationEventEmitter from "./eventEmitter.js";
import messageQueue from "./messageQueue.js";

// function to add action to queue
const sendMessageToQueue = (queueName, event, data) => {
  const message = { event, data };
  // add message to queue
  messageQueue.produceMessage(queueName, message);
};

// trigger actions when a new message is sent
conversationEventEmitter.on(
  "newMessageCreated",
  ({ conversationId, messageId }) => {
    // add conversation length calculation to queue
    sendMessageToQueue(
      "conversationLengthQueue",
      "newMessageCreated",
      conversationId
    );
    // add conversation duration calculation to queue
    sendMessageToQueue(
      "conversationDurationQueue",
      "newMessageCreated",
      conversationId
    );
  }
);

// trigger actions when an LLM agent responds
conversationEventEmitter.on(
  "agentResponded",
  ({ messageId, conversationId }) => {
    sendMessageToQueue(
      "agentResponseTimeQueue",
      "agentResponded",
      conversationId
    );
  }
);

// trigger actions when a human agent responds
conversationEventEmitter.on("humanResponded", ({ agentId, messageId }) => {
  sendMessageToQueue("humanAgentResponseTimeQueue", "humanResponded", agentId);
});

// trigger actions when a customer responds
conversationEventEmitter.on(
  "customerResponded",
  ({ conversationId, messageId }) => {
    // add customer response time calculation to queue
    sendMessageToQueue(
      "customerResponseTimeQueue",
      "customerResponded",
      conversationId
    );
    // add sentiment analysis to queue
    sendMessageToQueue(
      "sentimentAnalysisQueue",
      "customerResponded",
      messageId
    );
  }
);

// // trigger actions when a conversation interactions ends
// conversationEventEmitter.on("interactionEnded", (message) => {
//   // add feedback analysis to queue - scheduled for one day after last message
//   setTimeout(() => {
//     sendMessageToQueue("feedbackQueue", "interactionEnded", message);
//   }, 86400000);
// });
