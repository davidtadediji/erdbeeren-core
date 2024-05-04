// src\modules\llm_context\util\contextFilePathsUtil.js
import path from "path";
import logger from "../../../../logger.js";

const currentModuleURL = new URL(import.meta.url);
let currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("Context File Paths Util dir: " + currentModuleDir);

currentModuleDir = currentModuleDir.replace(/^\/([A-Z]:)/, "$1");

const getCustomerVectorStorePath = (customersSid) => {
  return path.join(
    currentModuleDir,
    "..",
    "customer_index",
    `${customersSid}.index`
  );
};

const getEnterpriseVectorStorePath = () => {
  return path.join(currentModuleDir, "..", "enterprise_index", "context.index");
};

const getEnterpriseContextFilePath = () => {
  return path.join(currentModuleDir, "..", "repository");
};

export {
  getCustomerVectorStorePath,
  getEnterpriseContextFilePath,
  getEnterpriseVectorStorePath,
};
