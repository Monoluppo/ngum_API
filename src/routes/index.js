const express = require("express");
const router = express.Router();
const controller = require("../controller/file.controller");

let routes = (app) => {
  router.post("/upload", controller.upload);
  router.get("/getListFiles", controller.getListFiles);
  router.get("/download", controller.download);
  router.get("/getLectureAssignment", controller.getLectureAssignment);
  router.get("/getAssignment", controller.getAssignment);
  app.use(router); 
};

module.exports = routes;
