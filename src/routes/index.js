const express = require("express");
const router = express.Router();
const controller = require("../controller/file.controller");

let routes = (app) => {
  router.post("/upload", controller.upload);
  router.get("/getListFiles", controller.getListFiles);
  router.get("/getLectureAssignmentStudent", controller.getLectureAssignmentStudent);
  router.get("/getAssignmentTeacher", controller.getAssignmentTeacher);
  app.use(router); 
};

module.exports = routes;
