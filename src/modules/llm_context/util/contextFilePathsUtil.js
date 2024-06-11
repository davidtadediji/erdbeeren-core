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
    "..",
    "..",
    "..",
    "vector_store",
    "customer_index",
    `${customersSid}_index`
  );
};

const getEnterpriseVectorStorePath = () => {
  return path.join(
    currentModuleDir,
    "..",
    "..",
    "..",
    "..",
    "vector_store",
    "enterprise_index"
  );
};

const getEnterpriseContextFilePath = () => {
  return path.join(currentModuleDir, "..", "..", "..", "..", "repository");
};

export {
  getCustomerVectorStorePath,
  getEnterpriseContextFilePath,
  getEnterpriseVectorStorePath,
};
