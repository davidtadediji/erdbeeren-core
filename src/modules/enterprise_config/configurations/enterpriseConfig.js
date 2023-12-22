// enterpriseConfig.js

import fs from 'fs';

const configFilePath = '../../../config/data-config.json';

const readConfigFile = () => {
  try {
    if (fs.existsSync(configFilePath)) {
      const configFileContent = fs.readFileSync(configFilePath, 'utf8');
      return JSON.parse(configFileContent);
    }
    return {};
  } catch (error) {
    console.error('Error reading configuration file:', error);
    return {};
  }
};

const writeConfigFile = (configData) => {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2), 'utf8');
    console.log('Configuration file has been successfully updated.');
  } catch (error) {
    console.error('Error writing configuration file:', error);
  }
};

export const setEnterpriseDetails = ({ name, industry, location, contactEmail, customSettings }) => {
  const existingConfig = readConfigFile();
  const updatedEnterpriseDetails = {
    name: name || existingConfig.enterprise?.name,
    industry: industry || existingConfig.enterprise?.industry,
    location: location || existingConfig.enterprise?.location,
    contactEmail: contactEmail || existingConfig.enterprise?.contactEmail,
    customSettings: { ...existingConfig.enterprise?.customSettings, ...customSettings },
  };

  const updatedConfig = { ...existingConfig, enterprise: updatedEnterpriseDetails };
  writeConfigFile(updatedConfig);
};

export const getEnterpriseDetails = () => {
  const configData = readConfigFile();
  return configData.enterprise || {};
};
