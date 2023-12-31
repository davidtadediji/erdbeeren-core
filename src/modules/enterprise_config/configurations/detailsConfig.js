// src\modules\enterprise_config\configurations\detailsConfig.js
import fs from 'fs';
import logger from '../../../../logger.js';
import path from 'path';

const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("dir:" + currentModuleDir);

const configFilePath = path.join(currentModuleDir.replace(/^\/([A-Z]:)/, '$1'), '..', '..', '..', '..', 'config', 'details.json');

logger.info("Config file path: " + configFilePath)

export const readConfigFile = () => {
  logger.info("Read config file triggered.")
  try {
    if (fs.existsSync(configFilePath)) {
      const configFileContent = fs.readFileSync(configFilePath, 'utf8');
      logger.info("Config file content: " + configFileContent);
      return JSON.parse(configFileContent);
    } else {
      const error = new Error('File path is not recognized.');
      logger.error(error.message);
      throw error;
    }
  } catch (error) {
    logger.error('Error reading configuration file:', error);
    throw error;
  }
};

export const writeConfigFile = (configData) => {
  logger.info("Write config file triggered.")
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2), 'utf8');
    logger.info('Configuration file has been successfully updated.');
  } catch (error) {
    logger.error('Error writing configuration file:', error);
    throw error;
  }
};

export const setEnterpriseDetails = ({ name, industry, location, contactEmail, customSettings }) => {
  logger.info("Set config file triggered: " + name);

  const existingConfig = readConfigFile();


  // Update the properties directly
  existingConfig.name = name || existingConfig.name;
  existingConfig.industry = industry || existingConfig.industry;
  existingConfig.location = location || existingConfig.location;
  existingConfig.contactEmail = contactEmail || existingConfig.contactEmail;
  existingConfig.customSettings = { ...existingConfig.customSettings, ...customSettings };

  // Write the updated configuration to the file
  writeConfigFile(existingConfig);

  return readConfigFile();
};


export const getEnterpriseDetails = () => {
  logger.info("Get config file triggered.")

  const configData = readConfigFile();
  return configData || {};
};
