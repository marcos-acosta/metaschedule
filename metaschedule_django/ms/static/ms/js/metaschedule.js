/* Global variables */
var course_data;
var selectedCourses = [];
var keys;

/* JQUERY */
$(document).ready(function(){
    /* Get course data */
    $.getJSON('https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc', function(all_data) {
        course_data = all_data['data']['courses'];
        keys = Object.keys(course_data);
        console.log('Got course data');
    });
    /* Switch between tabs */
    $("#courseSearchButton").change(function() {
        $("#searchContainer").show();
        $("#scheduleContainer").hide();
    });
    $("#schedulesButton").change(function() {
        $("#searchContainer").hide();
        $("#scheduleContainer").show();
    });
    /* Search button */
    $("#search").click(function(){
        // alert(course_data['data']['courses']['AFRI 010A AF-01']['courseCredits'])
        const stump = new CodeStump('AFRI 010A AF', [1, 2, 3, 4]);
        alert(stump.codeStump);
    });
    /* Test button */
    $("#testButton").click(function(){
        // console.log(cards);
    });
    /* Type in search bar */
    $("#courseSearch").keyup(function(){
        // alert($(this).val());
        let query = $("#courseSearch").val().toLowerCase();
        let results = searchStrings(query, keys);
        let cards = constructCards(results, 10);
        $("#searchResults").replaceWith(cards);
    });
    /* Add a course to your cart */
    $("#resultsContainer").on("click", ".close", function(){
        console.log($(this).attr("data-id"));
    })
});

/* CodeStump object */
function CodeStump(codeStump, courses) {
    this.codeStump = codeStump;
    this.courses = courses;
    this.numCourses = courses.length;
}

/* Searches array of strings for query */
function searchStrings (query, arr) {
    let results = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].toLowerCase().match(query)) {
            results.push(arr[i])
        }
    }
    return results;
}

/* Builds cards to select from list of results */
function constructCards(results, cap) {
    results = results.slice(0, Math.min(cap, results.length));
    let cardsHtml = '<div id="searchResults">';
    for (let i = 0; i < results.length; i++) {
        cardsHtml +=    '<div class="card"><div class="card-body">' + results[i] + ' | ' + 
                        course_data[results[i]]['courseName'] + '<span class="text-muted ml-2">' + 
                        course_data[results[i]]['courseCredits'] + ' credits</span>' + 
                        '<button type="button" class="close float-right" data-id="' + results[i] + '">' + 
                        '<span aria-hidden="true">+</span></button></div></div>';
    }
    cardsHtml += '</div>';
    return cardsHtml;
}