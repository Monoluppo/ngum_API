const uploadFile = require('../middleware/upload')
const fs = require('fs')
const baseUrl = 'http://localhost:8080/files/'

// ANCHOR NOTES
// Connection establish
// Use infura connect to ipfs networks
// Latest version of the libary 29/04/2021:  https://www.npmjs.com/package/ipfs-http-client#example
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
const { globSource } = ipfsClient

// POST upload file
const upload = async (req, res) => {
	
	try {
		if (req.files == undefined) {
			console.log('file is undefined')
			return res.status(400).send({ message: 'Please upload a file!' })
		}
		console.log('upload ', res)
		let fileBuffer = req.files.file.data
		let fileName = req.body.fileName
		let fileTopic = req.body.topic
		let subjectID = req.body.subjectID
		let isAssign = req.body.isAssignment
		let memberID = req.body.memberID
		let role = req.body.role
		// Add file to the ipfs
		let fileipfs = await ipfs.add(fileBuffer)
		// Insert into database
		const db = req.app.locals.db
		db.serialize(function () {
			db.run(
				'INSERT INTO Files (topic,hash,subjectID,fileName,isAssignment,memberID,role) VALUES (?,?,?,?,?,?,?)',
				[fileTopic, fileipfs.path, subjectID, fileName, isAssign, memberID, role],
				function (err) {
					if (err) {
						return console.error(err)
					} else {
						res.status(200).send({
							message: 'Success',
							hash: fileipfs.path
						})
					}
				}
			)
		})
	} catch (err) {
		res.status(500).send({
			message: `Could not upload the file: ${req.file}. ${err}`,
		})
	}
}

// GET get all files
const getListFiles = (req, res) => {
	try {
		let SubjectID = req.query.subjectID
		let MemberID = req.query.memberID
		const db = req.app.locals.db
		db.serialize(function () {
			db.all(
				'SELECT topic,hash,subjectID,fileName FROM Files WHERE subjectID =? AND memberID =? ',
				[SubjectID, MemberID],
				function (err, data) {
					if (err) {
						return console.error(err)
					} else {
						res.status(200).send(data)
					}
				}
			)
		})
	} catch (err) {
		res.status(500).send({
			message: `Error from getListFile ${err}`,
		})
	}
}

// GET get assigment and lecture
const getLectureAssignmentStudent = (req, res) => {
	try {
		let SubjectID = req.query.subjectID
		let isAssignment = req.query.isAssignment
		let MemberID = req.query.memberID

		const db = req.app.locals.db
		db.serialize(function () {
			db.all(
				'SELECT subjectID,isAssignment,topic,hash FROM Files WHERE subjectID =? AND LENGTH(memberID) = 4',
				[SubjectID],
				function (err, data) {
					if (err) {
						return console.error(err)
					} else {
						res.status(200).send(data)
					}
				}
			)
		})
	} catch (err) {
		res.status(500).send({
			message: `Error from getLectureAssignment ${err}`,
		})
	}
}

// GET get assignment
const getAssignmentTeacher = (req, res) => {
	try {
		let SubjectID = req.query.subjectID
		let isAssignment = req.query.isAssignment
		let topic = req.query.topic

		const db = req.app.locals.db
		db.serialize(function () {
			db.all(
				'SELECT subjectID,isAssignment,topic,hash,memberID FROM Files WHERE subjectID =? AND isAssignment =? AND topic =? AND LENGTH(memberID) = 10' ,
				[SubjectID, isAssignment, topic],
				function (err, data) {
					if (err) {
						return console.error(err)
					} else {
						res.status(200).send(data)
					}
				}
			)
		})
	} catch (err) {
		res.status(500).send({
			message: `Error getAssignment ${err}`,
		})
	}
}

module.exports = {
	upload,
	getListFiles,
	getLectureAssignmentStudent,
	getAssignmentTeacher,
}
