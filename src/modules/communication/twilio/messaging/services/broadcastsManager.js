import fs from "fs/promises";
import logger from "../../../../../../logger.js";
import path from "path";

const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("dir:" + currentModuleDir);

const broadcastsFilePath = path.join(
  currentModuleDir.replace(/^\/([A-Z]:)/, "$1"),
  "..",
  "..",
  "..",
  "..",
  "..",
  "..",
  "json_store",
  "broadcasts.json"
);

logger.info("Broadcasts file path: " + broadcastsFilePath);

export const readBroadcasts = async () => {
  logger.info("Read broadcasts triggered.");
  try {
    const broadcastsContent = await fs.readFile(broadcastsFilePath, "utf8");
    logger.info("Broadcasts content: " + broadcastsContent);
    return JSON.parse(broadcastsContent);
  } catch (error) {
    throw error;
  }
};

export const writeBroadcasts = async (broadcastData) => {
  logger.info("Write broadcasts triggered.");
  try {
    await fs.writeFile(
      broadcastsFilePath,
      JSON.stringify(broadcastData, null, 2),
      "utf8"
    );
    logger.info("Broadcasts have been successfully updated.");
  } catch (error) {
    throw error;
  }
};

export const updateBroadcasts = async (broadcast) => {
  logger.info("Update broadcasts triggered: " + broadcast.title);
  try {
    const existingBroadcasts = await readBroadcasts();
    logger.info("existingBroadcasts", existingBroadcasts);

    existingBroadcasts.push(broadcast);

    // Write the updated broadcasts to the file
    await writeBroadcasts(existingBroadcasts);

    return await readBroadcasts();
  } catch (error) {
    throw error;
  }
};

export const getBroadcasts = async () => {
  logger.info("Get broadcasts triggered.");

  try {
    const broadcastData = await readBroadcasts();
    return broadcastData || {};
  } catch (error) {
    throw error;
  }
};
