let mongoose = require('../config/mongoConnection');

let questionSchema = mongoose.Schema({
    id: {
        type: String
    },
    content: {
        type: String
    }
}, { _id: false });

let quizSchema = mongoose.Schema({
    _id: {
        type: String
    },
    name: {
        type: String
    },
    totalScore: {
        type: Number
    },
    questions: [questionSchema]
}, {
        versionKey: false
    });

let Quiz = module.exports = mongoose.model('Quiz', quizSchema);

module.exports.createQuiz = async function (newQuiz) {
    try {
        await newQuiz.save();;
    } catch (error) {
        console.log(error);
    }
    
}

module.exports.getQuizById = async function (_id) {
    try {
        return await Quiz.findOne({ '_id': _id });
    } catch (error) {
        console.log(error);
    }
}
module.exports.getAllQuizzes = async function () {
    try {
        return await Quiz.find({});
    } catch (error) {
        console.log(error);
    }
}