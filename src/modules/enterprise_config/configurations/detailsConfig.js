import fs from "fs/promises";
import logger from "../../../../logger.js";
import path from "path";

const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("dir:" + currentModuleDir);

const configFilePath = path.join(
  currentModuleDir.replace(/^\/([A-Z]:)/, "$1"),
  "..",
  "..",
  "..",
  "..",
  "json_store",
  "master.json"
);

logger.info("Config file path: " + configFilePath);

export const readConfigFile = async () => {
  logger.info("Read config file triggered.");
  try {
    const configFileContent = await fs.readFile(configFilePath, "utf8");
    logger.info("Config file content: " + configFileContent);
    return JSON.parse(configFileContent);
  } catch (error) {
    throw error;
  }
};

export const writeConfigFile = async (configData) => {
  logger.info("Write config file triggered.");
  try {
    await fs.writeFile(
      configFilePath,
      JSON.stringify(configData, null, 2),
      "utf8"
    );
    logger.info("Configuration file has been successfully updated.");
  } catch (error) {
    throw error;
  }
};

export const setEnterpriseDetails = async ({
  name,
  industry,
  location,
  contactEmail,
  customSettings,
}) => {
  logger.info("Set config file triggered: " + name);
  try {
    const existingConfig = await readConfigFile();

    existingConfig.name = name || existingConfig.name;
    existingConfig.industry = industry || existingConfig.industry;
    existingConfig.location = location || existingConfig.location;
    existingConfig.contactEmail = contactEmail || existingConfig.contactEmail;
    existingConfig.customSettings = {
      ...existingConfig.customSettings,
      ...customSettings,
    };

    // Write the updated configuration to the file
    await writeConfigFile(existingConfig);

    return await readConfigFile();
  } catch (error) {
    throw error; 
  }
};

export const getEnterpriseDetails = async () => {
  logger.info("Get config file triggered.");

  try {
    const configData = await readConfigFile();
    return configData || {};
  } catch (error) {
    throw error; 
  }
};
