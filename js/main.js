$(document).ready(function() {  
  $('#navigation a').click(function() { //make the navigation links functional for the example pages
    document.location.href = $(this).attr('href');
  });
  
  
});