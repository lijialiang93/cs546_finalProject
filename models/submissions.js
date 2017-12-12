let mongoose = require('../config/mongoConnection');
const uuidv4 = require('uuid/v4');

let questionSubmissionSchema = mongoose.Schema({
    id: {
        type: String
    },
    answer: {
        type: String
    }
}, { _id: false });

let studentSubmissionSchema = mongoose.Schema({
    studentId: {
        type: String
    },
    answers: [questionSubmissionSchema]
}, { _id: false });

let submissionSchema = mongoose.Schema({
    _id: {
        type: String
    },
    quizId: {
        type: String
    },
    studentSubmissions: [studentSubmissionSchema]
}, {
        versionKey: false
    });

let Submission = module.exports = mongoose.model('Submissions', submissionSchema);
let studentSubmission = module.exports = mongoose.model('studentSubmission', studentSubmissionSchema);
let questionSubmission = module.exports = mongoose.model('studentSubmissquizQuestionSchema', questionSubmissionSchema);

let exportedMethods = {
    findStudentSubmission(quizId, studentId, callback) {
        Submission.findOne({
            "quizId": quizId,
            "studentSubmissions.studentId": studentId
        }, callback);
    },

    findSubmissionByQuizId(quizId, callback) {
        Submission.findOne({ "quizId": quizId }, { "studentSubmissions": 1, "quizId": 1 }, callback);
    },

    findSubmissionByQuizIdAndStudentId(quizId, studentId, callback) {
        Submission.findOne({
            "quizId": quizId,
            "studentSubmissions.studentId": studentId
        },
        {
            studentSubmissions: { $elemMatch: { studentId: studentId } },
        }, 
        callback);
    },
    
    createStudentSubmission(quizId, newStudentSubmission, callback) {
        return Submission.findOne({ "quizId": quizId }).then((result) => {
            if (result !== null) {
                let allSubmissions = result;
                let updatedData = {};

                allSubmissions.studentSubmissions.push(newStudentSubmission);

                updatedData = allSubmissions;

                let updateCommand = {
                    $set: updatedData
                };

                Submission.findOneAndUpdate({ "quizId": quizId }, updateCommand, callback);
            }
            else {
                let newquizSubmission = new Submission({
                    _id: uuidv4(),
                    quizId: quizId,
                    studentSubmissions: [newStudentSubmission]
                });
                newquizSubmission.save(callback);
            }
        })
    }
}

module.exports = exportedMethods;