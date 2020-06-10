/* Global variables */
var course_data;
var stump_data;
var selectedCourses = [];
var course_keys;
var search_data;
var search_data_keys;

/* JQUERY */
$(document).ready(function(){
    /* Get course data */
    $.getJSON('https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc', function(all_data) {
        course_data = all_data['data']['courses'];
        course_keys = Object.keys(course_data);
        console.log('Got course data');
        generateStumps();
        console.log('Instantiated stump data')
        generateSearches();
        console.log('Instantiated searches')
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
    /* Test button */
    $("#testButton").click(function(){
        
    });
    /* Type in search bar */
    $("#courseSearch").keyup(function(){
        let query = $("#courseSearch").val().toLowerCase();
        if (query == '') {
            $("#searchResults").replaceWith('<div id="searchResults"></div>');
        } else {
            let results = searchStrings(query, search_data_keys);
            let cards = constructSearchCards(results, 15);
            $("#searchResults").replaceWith(cards);
        }
    });
    /* Add a course to your cart */
    $("#resultsContainer").on("click", "#addCourseButton", function(){
        let code = $(this).attr("data-id");
        selectedCourses.push(code);
        updateCourseList();
    })
    /* Remove a course from your cart */
    $("#rightSide").on("click", "#removeCourseButton", function(){
        let code = $(this).attr("data-id");
        removeItemOnce(selectedCourses, code);
        updateCourseList();
    })
});

/* Searches array of strings for query */
function searchStrings(query, arr) {
    let results = [];
    let words = query.split(' ');
    let reSearch = '';
    for (let i = 0; i < words.length; i++) {
        reSearch += '(?=.*' + words[i] + ')';
    }
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].toLowerCase().match(reSearch)) {
            results.push(arr[i])
        }
    }
    return results;
}

/* Constructs HTML for query cards */
function constructSearchCards(results, cap) {
    let coursesAdded = 0;
    let cardsHtml = '<div id="searchResults">';
    for (let i = 0; i < results.length; i++) {
        if (selectedCourses.includes(results[i])) {
            continue;
        }
        let sections = search_data[results[i]];
        cardsHtml +=    '<div class="card '+ getColor(results[i], search_data_keys) +' mb-1" id="' + results[i] + 
                        '" style="border-color: rgba(255, 0, 0, 0);"><div class="card-body">' + results[i] + 
                        ' | ' + sections["credits"] + 
                        ' credits <button type="button" class="close float-right" id="addCourseButton" data-id="' + 
                        results[i] + '"><span aria-hidden="true" style="color: white;">+</span></button></div></div>';
        coursesAdded++;
        if (coursesAdded == cap) {
            break;
        }
    }
    cardsHtml += '</div>';
    return cardsHtml;
}

/* Constructs HTML for selected course cards */
function constructSelectedCards() {
    let cardsHtml = '<div id="courseList">';
    for (let i = 0; i < selectedCourses.length; i++) {
        let sections = search_data[selectedCourses[i]]
        cardsHtml +=    '<div class="card ' + getColor(selectedCourses[i], search_data_keys) + ' mb-1" id="' + 
                        selectedCourses[i] + '"><div class="card-body">' + selectedCourses[i] + ' | ' + sections["credits"] + 
                        ' credits<button type="button" class="close float-right" id="removeCourseButton" data-id="' + 
                        selectedCourses[i] + '"> <span aria-hidden="true" style="color: white;">&times;</span></button></div></div>';
    }
    cardsHtml += '</div>';
    return cardsHtml;
}

/* Update course list */
function updateCourseList() {
    $("#courseSearch").trigger("keyup");
    let cards = constructSelectedCards();
    $("#courseList").replaceWith(cards);
    $("#creditCount").replaceWith('<span id="creditCount">' + getCreditTotal() + '</span>');
}

/* Remove item from array */
function removeItemOnce(arr, value) { 
    let index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

/* Get total credits of selected courses */
function getCreditTotal() {
    let count = 0.0;
    for (let i = 0; i < selectedCourses.length; i++) {
        count += parseFloat(search_data[selectedCourses[i]]["credits"]);
    }
    return count;
}

/* Get CSS color of a course */
function getColor(code, list) {
    let colors = ["redCard", "greenCard", "yellowCard", "blueCard", "orangeCard", "purpleCard", "mintCard", "pinkCard", "aquaCard", "steelCard"]
    let len = list.length;
    let index = list.indexOf(code);
    let location = Math.trunc((index / len) * 10);
    return colors[location];
}

/* Cut a code down to a stump */
function stumpify(code) {
    return code.split('-')[0];
}

/* Generate mapping of stumps to sections */
function generateStumps() {
    stump_data = {};
    for (let i = 0; i < course_keys.length; i++) {
        let stump = stumpify(course_keys[i]);
        // Already have this stump
        if (stump_data.hasOwnProperty(stump)) {
            // Just add this section
            stump_data[stump]["sections"].push(course_keys[i]);
        } else {
            // Instantiate it!
            stump_data[stump] = {
                sections: [course_keys[i]]
            };
        }
    }
}

/* Generate mapping of stump+name to stump */
function generateSearches() {
    search_data = {};
    stump_keys = Object.keys(stump_data)
    for (let i = 0; i < stump_keys.length; i++) {
        let course = course_data[stump_data[stump_keys[i]]["sections"][0]];
        search_data[stump_keys[i] + ' ' + course['courseName']] = {
            "stump": stump_keys[i],
            "credits": course['courseCredits']
        }
    }
    search_data_keys = Object.keys(search_data);
}