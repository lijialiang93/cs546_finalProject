let mongoose = require('../config/mongoConnection');

let studentSubmissionSchema = mongoose.Schema({
    studentId:{
        type: String
    },
    answer:{
        type:Array
    }
},{ _id : false });

let quizSubmissionSchema = mongoose.Schema({
    quizId:{
        type: String
    },
    studentSubmission:[studentSubmissionSchema]
},{
    _id : false
});

let submissionSchema = mongoose.Schema({
    submissions:[quizSubmissionSchema]
},{
    versionKey: false
});

let Submission = module.exports = mongoose.model('Submission', submissionSchema);
let studentSubmission = module.exports = mongoose.model('studentSubmission', studentSubmissionSchema);
let quizSubmission = module.exports = mongoose.model('studentSubmissquizSubmissionSchemaion', quizSubmissionSchema);

module.exports.findSubmission = function(quizId,callback){
    let query = {"submissions.quizID":quizId};
    Submission.findOne(query,callback);
}

module.exports.createStudentSubmission = function(quizId,newStudentSubmission,callback){
    Submission.findSubmission(quizId,function(err,result){
        if(result!=null){
            result.submissions.studentSubmission.push(newStudentSubmission);
        }
        else{
            let newquizSubmission = new quizSubmission({
                quizId:quizId,
                studentSubmission:[newStudentSubmission]
            });
        }
    })

}