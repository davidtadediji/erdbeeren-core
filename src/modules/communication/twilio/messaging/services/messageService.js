// src\modules\communication\twilio\messaging\service\messageService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()
const saveMessageToConversation = async (conversationId, sender, content) => {
  return await prisma.message.create({
    data: {
      conversationId: conversationId,
      sender: sender,
      content: content,
    },
  });
};

export { saveMessageToConversation };
