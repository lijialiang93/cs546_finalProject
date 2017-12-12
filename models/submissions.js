let mongoose = require('../config/mongoConnection');
const uuidv4 = require('uuid/v4');

let questionSubmissionSchema = mongoose.Schema({
    id:{
        type: String
    },
    answer:{
        type:String
    }
},{ _id : false });

let studentSubmissionSchema = mongoose.Schema({
    studentId:{
        type: String
    },
    answers:[questionSubmissionSchema]
},{ _id : false });

let quizSubmissionSchema = mongoose.Schema({
    quizId:{
        type: String
    },
    studentSubmissions:[studentSubmissionSchema]
},{
    _id : false
});

let submissionSchema = mongoose.Schema({
    _id: {
        type: String
    },
    submissions:[quizSubmissionSchema]
},{
    versionKey: false
});

let Submission = module.exports = mongoose.model('Submissions', submissionSchema);
let studentSubmission = module.exports = mongoose.model('studentSubmission', studentSubmissionSchema);
let quizSubmission = module.exports = mongoose.model('studentSubmissquizSubmissionSchemaion', quizSubmissionSchema);
let questionSubmission = module.exports = mongoose.model('studentSubmissquizQuestionSchema', questionSubmissionSchema);

let exportedMethods = {
    findSubmission(quizId) {
        return Submission.findOne( { "submissions.quizId": quizId} );
    },
    createStudentSubmission(quizId, newStudentSubmission, callback) {
        return Submission.findOne( { "submissions.quizId": quizId} ).then((result) => {
            if (result !== null) {
                let allSubmissions = result;
                let updatedData = {};

                allSubmissions.submissions[0].studentSubmissions.push(newStudentSubmission);

                updatedData = allSubmissions;

                let updateCommand = {
                    $set: updatedData
                };

                Submission.findOneAndUpdate( { "submissions.quizId": quizId}, updateCommand, callback);
            }
            else {
                let newquizSubmission = new quizSubmission({
                    quizId:quizId,
                    studentSubmissions:[newStudentSubmission]
                });
                let newSubmission = new Submission({
                    _id: uuidv4(),
                    submissions:[newquizSubmission]
                });
                newSubmission.save(callback);
            }
        })
    }
}

module.exports = exportedMethods;