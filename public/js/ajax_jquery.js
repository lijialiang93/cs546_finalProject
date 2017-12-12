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

        var newName = newNameInput.val();
        var newDescription = newDecriptionArea.val();
        var newContent = $("#new-content");

        if (newName && newDescription) {
            var requestConfig = {
                method: "POST",
                url: "/api/todo",
                contentType: 'application/json',
                data: JSON.stringify({
                    name: newName,
                    description: newDescription,
                    testField: 12,
                    testBool: true
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                console.log(responseMessage);
                newContent.html(responseMessage.message);
                //                alert("Data Saved: " + msg);
            });
        }
    });
})(window.jQuery);