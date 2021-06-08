const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const blogsController = require("../controllers/blogs");
// READ -> GET
router.get("/", blogsController.getAll);
router.get("/:blogId", blogsController.getBlogById);
router.delete("/:blogId", blogsController.delete);

// CREATE -> POST
router.post(
  "/",
  [
    body("title").isLength({ min: 5 }).withMessage("title tidak sesuai"),
    body("description")
      .isLength({ min: 5 })
      .withMessage("description tidak sesuai"),
  ],
  blogsController.create
);

// Update -> PUT
router.put(
  "/:blogId",
  [
    body("title").isLength({ min: 5 }).withMessage("title tidak sesuai"),
    body("description")
      .isLength({ min: 5 })
      .withMessage("description tidak sesuai"),
  ],
  blogsController.update
);

module.exports = router;
