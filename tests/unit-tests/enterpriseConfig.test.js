import fs from 'fs';
import path from 'path'; // Import the path module

import {
  readConfigFile,
  writeConfigFile,
  setEnterpriseDetails,
  getEnterpriseDetails,
} from "../../src/modules/enterprise_config/configurations/enterpriseConfig.js";

const configFilePath = path.resolve(__dirname, '../../config/data-config.json');

describe("readConfigFile", () => {
  it("should return an empty object if the config file does not exist", () => {
    const result = readConfigFile();
    expect(result).toEqual({});
  });

  it("should return the contents of the config file if it exists", () => {
    const configFileContent =
      '{ "name": "My Enterprise", "industry": "Retail" }';
      fs.writeFileSync(configFilePath, JSON.stringify(configFileContent, null, 2), 'utf8');
      const result = readConfigFile();
      console.log("result: ", result)
    expect(result).toEqual({ name: "My Enterprise", industry: "Retail" });
  });

  it("should catch errors when reading the config file", () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    readConfigFile();

    expect(console.error).toHaveBeenCalledWith(
      "Error reading configuration file:",
      expect.any(Error)
    );

    console.error = originalConsoleError;
  });
});

describe("writeConfigFile", () => {
  it("should write the config data to the config file", () => {
    const configData = { name: "My Enterprise", industry: "Retail" };
    writeConfigFile(configData);

    const configFileContent = fs.readFileSync(configFilePath, "utf8");
    expect(JSON.parse(configFileContent)).toEqual(configData);
  });

  it("should catch errors when writing the config file", () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    writeConfigFile();

    expect(console.error).toHaveBeenCalledWith(
      "Error writing configuration file:",
      expect.any(Error)
    );

    console.error = originalConsoleError;
  });
});

describe("setEnterpriseDetails", () => {
  it("should update the enterprise details in the config file", () => {
    const existingConfig = { name: "My Enterprise", industry: "Retail" };
    const updatedEnterpriseDetails = {
      name: "My New Enterprise",
      industry: "Technology",
    };

    setEnterpriseDetails(updatedEnterpriseDetails);

    const configFileContent = fs.readFileSync(configFilePath, "utf8");
    const updatedConfig = JSON.parse(configFileContent);
    expect(updatedConfig.enterprise).toEqual(updatedEnterpriseDetails);
  });
});

describe("getEnterpriseDetails", () => {
  it("should return the enterprise details from the config file", () => {
    const existingConfig = { name: "My Enterprise", industry: "Retail" };

    const enterpriseDetails = getEnterpriseDetails();
    expect(enterpriseDetails).toEqual(existingConfig.enterprise);
  });
});
