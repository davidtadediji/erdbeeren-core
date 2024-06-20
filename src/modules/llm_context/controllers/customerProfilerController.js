import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { extractProfile } from "../services/customerProfiler.js";

export async function extractCustomerProfile(req, res, next) {
  try {
    const customerId = req.params.customerId;
    const profile = await extractProfile(customerId);
    await prisma.conversation.update({
      where: { participantSid: customerId },
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
