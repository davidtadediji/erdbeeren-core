import express from "express";

import multiparty from "multiparty";
import {
  authenticateJWT,
  hasPermission,
} from "../../authentication/middleware/authMiddleware.js";
import {
  deleteFile,
  listFiles,
  renameFile,
  uploadFiles,
  viewFile,
} from "../services/fileService.js";
import logger from "../../../../logger.js";

const router = express.Router();

// Protect the '/upload' route with authentication and permission check
router.post(
  "/upload",
  authenticateJWT,
  hasPermission(["manageLLM"]),
  async (req, res, next) => {
    try {
      const form = new multiparty.Form();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          return next(err);
        }

        try {
          const uploadedFiles = await uploadFiles(files.file);
          res.json(uploadedFiles);
        } catch (error) {
          next(error);
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Protect the '/:filename' (delete) route with authentication and permission check
router.delete(
  "/delete/:filename",
  authenticateJWT,
  hasPermission(["manageLLM"]),
  async (req, res, next) => {
    const { filename } = req.params;
    try {
      const result = await deleteFile(filename);
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      next(error);
    }
  }
);

// Protect the '/:filename' (rename) route with authentication and permission check
router.put(
  "/rename/:filename",
  authenticateJWT,
  hasPermission(["manageLLM"]),
  async (req, res, next) => {
    const { filename } = req.params;
    const { newFilename } = req.body;
    try {
      const result = await renameFile(filename, newFilename);
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      next(error);
    }
  }
);

// Protect the '/list' route with authentication and permission check
router.get(
  "/list",
  authenticateJWT,
  hasPermission(["manageLLM"]),
  async (req, res, next) => {
    try {
      const files = await listFiles();
      res.json({ files });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/view/:filename",
  authenticateJWT,
  hasPermission(["manageLLM"]),
  async (req, res, next) => {
    const { filename } = req.params;

    try {
      const { fileStream, contentType } = await viewFile(filename);

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
