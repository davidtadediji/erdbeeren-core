import { PrismaClient } from "@prisma/client";
import logger from "../../../../logger.js";
import { extractProfile } from "../../llm_context/services/customerProfiler.js";

const prisma = new PrismaClient();

export async function getAllAgentIds(req, res, next) {
  logger.info("Get all agent ids triggered");
  try {
    const agents = await prisma.user.findMany({
      where: { role: "agent" },
      select: {
        id: true,
      },
    });

    logger.info(JSON.stringify(agents));

    const agentIds = agents.map((agent) => agent.id);

    logger.info(JSON.stringify(agentIds));

    res.json({
      agentIds,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAvgAgentResponseTime(req, res, next) {
  try {
    const agentId = req.params.agentId;

    const agent = await prisma.user.findUnique({
      where: { id: parseInt(agentId) },
    });

    const avgAgentResponseTime = agent.averageResponseTime;

    console.log("avgAgentResponseTime", avgAgentResponseTime)

    res.json({
      agent: agentId,
      metric: "Agent Response Time Metrics",
      avgAgentResponseTime,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
}
