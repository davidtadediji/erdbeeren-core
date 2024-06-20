import logger from "../../../../logger.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPendingTicketIds = async (agentId) => {
  try {
  } catch (error) {
    throw new Error(error);
  } finally {
    await prisma.$disconnect();
  }
};

export const getSolvedTicketIds = async (agentId) => {
  try {
  } catch (error) {
    throw new Error(error);
  } finally {
    await prisma.$disconnect();
  }
};
