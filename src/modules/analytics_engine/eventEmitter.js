// src\modules\analyticsEngine\eventEmitter.js
import EventEmitter from 'events';

class ConversationEventEmitter extends EventEmitter {}

const conversationEventEmitter = new ConversationEventEmitter();

export default conversationEventEmitter;
