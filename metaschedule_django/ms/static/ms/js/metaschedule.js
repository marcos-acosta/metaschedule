$(document).ready(function(){
    $("#courseSearchButton").change(function() {
        $("#searchContainer").show();
        $("#scheduleContainer").hide();
    });
    $("#schedulesButton").change(function() {
        $("#searchContainer").hide();
        $("#scheduleContainer").show();
    });
});