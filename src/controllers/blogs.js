const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const BlogPost = require("../models/blogs");

exports.getAll = (req, res, next) => {
  //   res.json({ url: req.originalUrl, method: req.method });
  let currentPage = req.query.page || 1;
  let perPage = req.query.perPage || 5;
  let totalData;
  BlogPost.find()
    .countDocuments()
    .then((count) => {
      totalData = count;
      currentPage = parseInt(currentPage);
      perPage = parseInt(perPage);
      return BlogPost.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((result) => {
      console.log("total data :" + result.length);
      res.status(200).json({
        message: "Blogs successfully called",
        data: result,
        total_data: totalData,
        current_page: currentPage,
        per_page: perPage,
      });
    })
    .catch((err) => next(err));

  // BlogPost.find()
  //   .then((result) =>
  //     res.status(200).json({
  //       message: "Blogs successfully called",
  //       data: result,
  //     })
  //   )
  //   .catch();
};

exports.getBlogById = (req, res, next) => {
  const blogId = req.params.blogId;
  BlogPost.findById(blogId)
    .then((result) => {
      if (!result) {
        const error = new Error("Blog tidak ditemukan");
        error.errorStatus = 404;
        throw error;
      }
      res.status(200).json({
        message: "Blog berhasil ditemukan",
        data: result,
      });
    })
    .catch((err) => next(err));
};

exports.delete = (req, res, next) => {
  const blogId = req.params.blogId;
  BlogPost.findById(blogId)
    .then((blog) => {
      if (!blog) {
        const err = new Error("Blog tidak ditemukan bro");
        err.errorStatus = 404;
        throw err;
      }

      removeFile(blog.image);
      return BlogPost.findByIdAndRemove(blogId);
    })
    .then((result) =>
      res.status(200).json({
        message: "Blog berhasil dihapus",
        data: result,
      })
    )
    .catch((err) => next(err));
};

const removeFile = (filePath) => {
  filePath = path.join(__dirname, "../..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

exports.create = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error("Input value tidak sesuai");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }

  if (!req.file) {
    const err = new Error("Gambar harus diupload");
    err.errorStatus = 422;
    throw err;
  }

  const title = req.body.title;
  const description = req.body.description;
  const image = req.file.path;

  const Posting = new BlogPost({
    title: title,
    description: description,
    image: image,
    author: {
      uid: 1,
      name: "Nikko Fe",
    },
  });

  Posting.save()
    .then((result) => {
      res.status(201).json({
        message: "Create Blog Success",
        data: result,
      });
      next();
    })
    .catch((err) => console.log(err));
};

exports.update = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error("Inputan Salah Bro");
    err.errorStatus = 422;
    err.data = errors.array();
    throw err;
  }

  if (!req.file) {
    const err = new Error("Mana Gambarnyaaaaaa!!!");
    err.errorStatus = 422;
    throw err;
  }

  BlogPost.findById(req.params.blogId)
    .then((blog) => {
      if (!blog) {
        const err = new Error("Blog tidak ditemukan bro");
        err.errorStatus = 404;
        throw err;
      }

      blog.title = req.body.title;
      blog.image = req.file.path;
      blog.description = req.body.description;
      return blog.save();
    })
    .then((result) =>
      res.status(201).json({
        message: "Blog Berhasil diupdate",
        data: result,
      })
    )
    .catch((err) => next(err));
};
