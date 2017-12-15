(function ($) {
  var score = $('#score');
  var totalScore = $('#totalScore');
  var successMsgContainer = $('#success-container');
  var errorContainer = $('#error-container');
  var prevScore = $('#prevScore');
  
  $("#gradeForm").submit(function () {
    event.preventDefault();
    errorContainer.addClass('hidden');
    successMsgContainer.addClass('hidden');
    successMsgContainer.empty();
    if (isNaN(score.val()) || score.val() > 100 || score.val() < 0) {
      var errorAlert = $('#score-alert');
      errorContainer.removeClass('hidden');
      errorAlert.text('Score should between 0-' + totalScore.text());
    }
    else {
      const data = {
        role: "teacher",
        score: $('#score').val(),
        quizId: $('#totalScore').data("id"),
        studentId: $('#student').data("id")
      }
      console.log(data);
      var requestConfig = {
        method: "POST",
        url: "/grading",
        contentType: 'application/json',
        data: JSON.stringify(data)
      };

      $.ajax(requestConfig).then(function (responseMessage) {
        console.log(responseMessage);
        if (responseMessage.success == true) {
          successMsgContainer.append(responseMessage.message);
          successMsgContainer.append('&nbsp&nbsp<a href="../allQuizzes">Back to Quiz List</a>');
          successMsgContainer.removeClass("hidden");
          prevScore.text(data.score);
          prevScore.css('color', 'red');
        }
        
      });

    }

  });

})(jQuery);