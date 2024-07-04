import fs from "fs/promises";
import logger from "../../../../logger.js";
import path from "path";

// construct file path to json file containing configuration settings
const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);
const configFilePath = path.join(
  currentModuleDir.replace(/^\/([A-Z]:)/, "$1"),
  "..",
  "..",
  "..",
  "..",
  "json_store",
  "master.json"
);

// Function to read JSON from storage, to be called by the getEnterprise details function
export const readConfigFile = async () => {
  logger.info("Read config file triggered.");
  try {
    // Read the file content using the file system readFile method
    const configFileContent = await fs.readFile(configFilePath, "utf8");
    // parse the json and return it to the frontend
    return JSON.parse(configFileContent);
  } catch (error) {
    throw error;
  }
};

// Function to write JSON to storage, to be called by setEnterpriseDetails function
export const writeConfigFile = async (configData) => {
  logger.info("Write config file triggered.");
  try {
    // use the writeFile function after stringifying the json data passed
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

// Function for the admin to set the enterprise configuration
export const setEnterpriseDetails = async ({
  name,
  industry,
  address,
  city,
  country,
  contactEmail
}) => {
  logger.info("Set config file triggered: " + name);
  try {
    // get the current enterprise details
    const existingConfig = await readConfigFile();
    /* The admin may not want to set all the attributes 
    so we check if an attribute is passed before adding to the updated configuration */
    existingConfig.name = name || existingConfig.name;
    existingConfig.industry = industry || existingConfig.industry;
    existingConfig.address = address || existingConfig.address;
    existingConfig.contactEmail = contactEmail || existingConfig.contactEmail;
    existingConfig.city = city || existingConfig.city;
    existingConfig.country = country || existingConfig.country;
    // Write the updated configuration to the file
    await writeConfigFile(existingConfig);
    // return the update to the admin
    return await readConfigFile();
  } catch (error) {
    throw error; 
  }
};

// Function for the admin to get the current enterprise configuration
export const getEnterpriseDetails = async () => {
  logger.info("Get config file triggered.");
  try {
    const configData = await readConfigFile();
    return configData || {};
  } catch (error) {
    throw error; 
  }
};
