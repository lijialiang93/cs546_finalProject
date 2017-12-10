let mongoose = require('../config/mongoConnection');

let questionSchema = mongoose.Schema({
    content:{
        type: String
    }
},{ _id : false });

let quizSchema = mongoose.Schema({
    _id:{
        type: String
    },
    name:{
        type: String
    },
    totalScore:{
        type: Number
    },
    questions:[questionSchema]
},{
    versionKey: false
});

let Quiz = module.exports = mongoose.model('Quiz', quizSchema);

module.exports.createQuiz = function(newQuiz,callback){
    newQuiz.save(callback);
}