const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://localhost:8080/files/";


// ANCHOR NOTES 
// Connection establish
// Use infura connect to ipfs networks
// Latest version of the libary 29/04/2021:  https://www.npmjs.com/package/ipfs-http-client#example
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
const { globSource } = ipfsClient


const upload = async (req, res) => {
  try {

    if (req.files == undefined) {
      return res.status(400).send({ message: 'Please upload a file!' })
    }
    let fileBuffer = req.files.file.data
    let fileName = req.body.fileName
    let fileTopic = req.body.topic
    let subjectID = req.body.subjectID
    let isAssign = req.body.isAssignment
    let memberID = req.body.memberID
    let role = req.body.role
    let fileipfs = await ipfs.add(fileBuffer)
    console.log(fileipfs)
    const db = req.app.locals.db;
    db.serialize(function () {
      db.run("INSERT INTO Files (topic,hash,subjectID,fileName,isAssignment,memberID,role) VALUES (?,?,?,?,?,?,?)", [fileTopic, fileipfs.path, subjectID, fileName, isAssign, memberID, role], function (err) {
        if (err) {
          return console.error(err);
        }
        console.log('insert into db success');
      })
    })

    res.status(200).send({
      message: 'Uploaded the file successfully: ' + req.files.file.name,
    })

  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file}. ${err}`,
    });
  }
};

const getListFiles = (req, res) => {
  try {

    let SubjectID = req.query.subjectID
    let MemberID = req.query.memberID

    const db = req.app.locals.db;
    db.serialize(function () {
      db.all("SELECT topic,hash,subjectID,fileName FROM Files WHERE subjectID =? AND memberID =? ", [SubjectID, MemberID], function (err,data) {
        console.log(data)
        if (err) {
          return console.error(err);
        }
        console.log('get from db success');
        console.log(SubjectID);
        console.log(MemberID);
      })
    })

    res.status(200).send({
      message: 'Your file is here: https:/ipfs.io/ipfs/(hashcode)',
    })
  }
  catch (err) {
    console.log(err);
  }
};


const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};


const getLectureAssignment = (req, res) => {
  try {

    let SubjectID = req.query.subjectID
    let isAssignment = req.query.isAssignment
    let MemberID = req.query.memberID

    const db = req.app.locals.db;
    db.serialize(function () {
      db.all("SELECT subjectID,isAssignment,memberID FROM Files WHERE subjectID =? AND isAssignment =? AND memberID =? ", [SubjectID,isAssignment,MemberID], function (err,data) {
        console.log(data)
        if (err) {
          return console.error(err);
        }
        console.log('get from db success');
        console.log(SubjectID);
        console.log(isAssignment);
        console.log(MemberID);
      })
    })

    res.status(200).send({
      message: 'Your lecture assignment is here: https:/ipfs.io/ipfs/(hashcode)',
    })
  }
  catch (err) {
    console.log(err);
  }
};

const getAssignment = (req, res) => {
  try {

    let SubjectID = req.query.subjectID
    let isAssignment = req.query.isAssignment
    let topic = req.query.topic

    const db = req.app.locals.db;
    db.serialize(function () {
      db.all("SELECT subjectID,isAssignment,topic FROM Files WHERE subjectID =? AND isAssignment =? AND topic =? ", [SubjectID,isAssignment,topic], function (err,data) {
        console.log(data)
        if (err) {
          return console.error(err);
        }
        console.log('get from db success');
        console.log(SubjectID);
        console.log(isAssignment);
        console.log(topic);
      })
    })

  
    res.status(200).send({
      message: 'Your assignment in here: https:/ipfs.io/ipfs/(hashcode)',
    })

  }
  catch (err) {
    console.log(err);
  }
};

module.exports = {
  upload,
  getListFiles,
  download,
  getLectureAssignment,
  getAssignment,
};
