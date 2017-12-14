(function ($) {
  var score = $('#score');
  $("#gradeForm").submit(function(){
    if(isNaN(score.val())||score.val()>100||score.val()<0){
      var errorContainer = $('#error-container');
      var errorAlert = $('#score-alert');
      errorContainer.removeClass('hidden');
      errorAlert.text('Score should between 0-100');
      return false;
    }
    else{
      alert('quiz graded!');
      return true;
    }
});

})(jQuery);