import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { extractProfile } from "../services/customerProfiler.js";

export async function extractCustomerProfile(req, res, next) {
  try {
    const conversationId = req.params.conversationId;
    const profile = await extractProfile(conversationId);
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { customerProfile: profile },
    });

    res.json(profile);

    logger.info(`Customer Profile: ${profile}`);
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}
