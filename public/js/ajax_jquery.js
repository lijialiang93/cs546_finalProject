(function ($) {
    var myNewTaskForm = $("#addingQuiz");
        //newNameInput = $("#new-task-name"),
        //newDecriptionArea = $("#new-task-description");

    var qId = 1;
    
    $("#add-question").click(function() {
        qId++;
        var markup = "<div id=\"qId" + qId + "\"><label>Question " + qId + " <textarea id=\"q" + qId + "\" cols=\"50\" type=\"text\" /></label></div>";
        $(".questionArea").append(markup);
    })

    $("#remove-question").click(function() {
        var currentId = "#qId" + qId;
        if (qId > 1) {
            qId--;
            $(currentId).remove();
        }
    })

    myNewTaskForm.submit(function (event) {
        event.preventDefault();

        //var newName = newNameInput.val();
        //var newDescription = newDecriptionArea.val();
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
                newContent.html(responseMessage.message);
            });
        }
    });
})(window.jQuery);