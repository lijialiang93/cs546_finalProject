(function ($) {
    var addingQuizForm = $("#addingQuiz");
    var addQuestionButton = $("#add-question");
    var removeQuestionButton = $("#remove-question");

    const errorContainer = document.getElementById("error-container");
    const successMsgContainer = document.getElementById("success-container");

    var qId = 1;
    
    addQuestionButton.click(function() {
        errorContainer.classList.add("hidden");
        successMsgContainer.classList.add("hidden");
        qId++;
        var markup = "<div id=\"qId" + qId + "\"><label>Question " + qId + " <textarea id=\"q" + qId + "\" cols=\"50\" type=\"text\" /></label></div>";
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

        var newContent = $("#new-content");

        var quizName = "test quiz";
        var totalScore = 100;
        var questions = new Array();

        for (i = 1; i <= qId; i++) {
            var qContent = $("#q" + i).val();
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

        if (markup) {
            var requestConfig = {
                method: "POST",
                url: "/postQuiz",
                contentType: 'application/json',
                data: JSON.stringify(markup)
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                console.log(responseMessage);
                //newContent.html(responseMessage.message);
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
                //newContent.html(responseMessage.message);
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