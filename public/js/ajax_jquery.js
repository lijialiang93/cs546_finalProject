(function ($) {
    var addingQuizForm = $("#addingQuiz");
    var addQuestionButton = $("#add-question");
    var removeQuestionButton = $("#remove-question");

    const errorContainer = document.getElementById("error-container");
    const successMsgContainer = document.getElementById("success-container");
    const scoreContainer = document.getElementById("score-error");

    var qId = 1;
    
    addQuestionButton.click(function() {
        errorContainer.classList.add("hidden");
        successMsgContainer.classList.add("hidden");
        qId++;
        var markup = "<li id=\"qId" + qId + "\"><h4 class=\"text\">Question " + qId + "</h4><textarea id=\"q" + qId + "\" cols=\"50\" type=\"text\" /></li>";
        $(".questionArea").append(markup);
    })

    removeQuestionButton.click(function() {
        successMsgContainer.classList.add("hidden");
        var currentId = "#qId" + qId;
        if (qId > 1) {
            qId--;
            $(currentId).remove();
        }
        else {
            errorContainer.classList.remove("hidden");
        }
    })

    addingQuizForm.submit(function (event) {
        event.preventDefault();

        errorContainer.classList.add("hidden");
        successMsgContainer.classList.add("hidden");
        scoreContainer.classList.add("hidden");

        var quizName = $("#quiz-name").val();
        var totalScore = 0;
        var questions = new Array();
        var allQuestionFilled = true;

        try {
            totalScore = parseFloat($("#quiz-score").val(), 10);
            console.log(totalScore);
            if (totalScore <= 0 || isNaN(totalScore)) {
                scoreContainer.classList.remove("hidden");
            }
        } catch (err) {
            scoreContainer.classList.remove("hidden");
        }

        for (i = 1; i <= qId; i++) {
            var qContent = $("#q" + i).val();
            if (!qContent) {
                allQuestionFilled = false;
                errorContainer.classList.remove("hidden");
            }
            let question = {
                id: i,
                content: qContent
            };
            questions.push(question);
        }

        let markup = {
            name: quizName,
            totalScore: totalScore,
            questions: questions
        };

        if (markup && markup.totalScore > 0 && allQuestionFilled) {
            var requestConfig = {
                method: "POST",
                url: "/postQuiz",
                contentType: 'application/json',
                data: JSON.stringify(markup)
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                console.log(responseMessage);
                successMsgContainer.classList.remove("hidden");
            });
        }
    });

    $.urlParam = function(name){
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        return results[1] || 0;
    }

    var studentQuizForm = $("#student-take-quiz-form");

    studentQuizForm.submit(function (event) {
        event.preventDefault();

        successMsgContainer.classList.add("hidden");
        errorContainer.classList.add("hidden");

        let currentQuestionNo = 1;
        let studentId = $("#student-id").val();
        var answers = new Array();

        $("textarea").each(function() {
            var value = $(this).val();
            let currentAnswer = {
                id: currentQuestionNo,
                answer: value
            };
            currentQuestionNo++;
            answers.push(currentAnswer);
        })

        if (answers) {
            var requestConfig = {
                method: "POST",
                url: "/submit?quizId=" + $.urlParam('quizId') + "&studentId=" + studentId,
                contentType: 'application/json',
                data: JSON.stringify(answers)
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                console.log(responseMessage);
                if (responseMessage.success == true) {
                    successMsgContainer.classList.remove("hidden");
                }
                else {
                    errorContainer.classList.remove("hidden");
                }
            });
        }
    });

})(window.jQuery);