/* Global variables */
var section_to_data;
var section_to_data_keys;

var selected_courses = [];

var stump_to_data;

var queries;

var pending_course;
var current = 0;

var non_conflicts;

/* JQUERY */
$(document).ready(function(){
    /* Get course data */
    $.getJSON('https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc', function(all_data) {
        collectData(all_data);
        $('#courseSearch').prop("disabled", false);
        $('#loadingSpinner').hide();
    });
    /* Switch between tabs */
    $("#courseSearchButton").change(function() {
        $("#searchContainer").show();
        $("#mainSelectedCoursesCard").show();
        $("#scheduleContainer").css('display', 'none');
        $("#scheduleGeneratorContainer").hide();
    });
    $("#schedulesButton").change(function() {
        $("#searchContainer").hide();
        $("#mainSelectedCoursesCard").hide();
        $("#scheduleContainer").css('display', 'inline-block');
        $("#scheduleGeneratorContainer").show();
    });
    /* Type in search bar */
    $("#courseSearch").keyup(function(){
        let query = cleanQuery($("#courseSearch").val().toLowerCase());
        if (query == '') {
            $("#searchResults").replaceWith('<div id="searchResults"></div>');
        } else {
            let results = searchStrings(query, queries);
            let cards = constructSearchCards(results, 15);
            $("#searchResults").replaceWith(cards);
        }
    });
    $("#resultsContainer, #selectedContainer, #filterContainer").on("click", ".card", function(){
        let stump = $(this).attr("data-id");
        let info = constructCourseData(stump);
        $("#courseInfo").replaceWith(info);
    });
    $("#scheduleBody").on("click", ".box", function(){  /* COME BACK */
        let code = $(this).attr("data-id");
        let info = constructCourseData(code.split('-')[0]);
        $("#courseInfo").replaceWith(info);
    });
    /* Add a course to your cart */
    $("#resultsContainer").on("click", "#addCourseButton", function(e){
        e.stopPropagation();
        let stump = $(this).attr("data-id");
        // let seats = getSeatsFilled(stump);
        // if (!seats[2]) {
        //     pending_course = code;
        //     $("#fullModal").modal('show');
        // } else {
        //     addCourse(code);
        // }
        addCourse(stump);
    });
    /* Remove a course from your cart */
    $("#selectedContainer").on("click", "#removeCourseButton", function(e){
        e.stopPropagation();
        let stump = $(this).attr("data-id");
        removeItemOnce(selected_courses, stump);
        updateCourseList();
        updateScheduleDiv();
        if (selected_courses.length == 0) {
            $("#generateButton").attr('disabled', true);
            $("#generateButton").css('cursor', 'initial');
        }
    });
    $("#refresh").click(function() {
        $('#courseSearch').prop("disabled", true);
        $('#loadingSpinner').show();
        $.getJSON('https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc', function(all_data) {
            collectData(all_data);
            $('#courseSearch').prop("disabled", false);
            $('#loadingSpinner').hide();
        });
        updateCourseList();
        $("#courseInfo").replaceWith('<div id="courseInfo"></div>');
    });
    $("#addAnyway").click(function() {
        addCourse(pending_course);
    });
    $("#filterInfoButton").click(function() {
        $("#filterInfoModal").modal('show');
    });
    $("#help").click(function() {
        $("#helpModal").modal('show');
    });
    $("#scheduleContainer").on("change", "#sectionPicker", function() {
        selected_courses[$(this).attr('data-id')]["filteredSections"] = $(this).val();
    });
    $("#generateButton").click(function() {
        $("#scheduleCard").slideUp("fast", "swing", function() {
            $("#info").remove();
            non_conflicts = getAllSchedules();
            console.log('Permutations:', non_conflicts);
            current = 0;
            updateButtons();
            if (non_conflicts.length == 0) {
                $("#wholeScheduleContainer").hide();
                $("#noPerms").show();
            } else {
                sortByAvailability();
                $("#wholeScheduleContainer").show();
                $("#noPerms").hide();
                generate();
            }
            $("#scheduleCard").slideDown("fast", "swing", function() {
                // Done with calculations
            });
        });
    });
    $("#next").click(function() {
        current++;
        generate();
        updateButtons();
    });
    $("#previous").click(function() {
        current--;
        generate();
        updateButtons();
    });
});

function generate() {
    $(".box").remove();
    let html = getFullSchedule(non_conflicts[current]);
    let availability = getLowestAvailability(non_conflicts[current]);
    $("#countNumber").html(getNumberPermutations());
    $("#classes").html(generateCourseCards(non_conflicts[current]));
    $("#score").html(availability[2]);
    $("#page").html((current + 1) + '/' + non_conflicts.length);
    $("#actualScore").html(availability[0] + '/' + availability[1]);
    $("#availability").css('border-color', availability[3]);
    $("#realDeal").append(html);
}

function getNumberPermutations() {
    let num = non_conflicts.length;
    if (num == 1) {
        return '1 permutation';
    } else {
        return num + ' permutations';
    }
}

function updateButtons() {
    if (current == 0) {
        $("#previous").attr('disabled', true);
        $("#previous").removeClass('btn-outline-primary');
        $("#previous").addClass('btn-outline-secondary');
        $("#previous").css('cursor', 'initial');
    } else {
        $("#previous").attr('disabled', false);
        $("#previous").removeClass('btn-outline-secondary');
        $("#previous").addClass('btn-outline-primary');
        $("#previous").css('cursor', 'pointer');
    }
    if (current >= non_conflicts.length - 1) {
        $("#next").attr('disabled', true);
        $("#next").removeClass('btn-outline-primary');
        $("#next").addClass('btn-outline-secondary');
        $("#next").css('cursor', 'initial');
    } else {
        $("#next").attr('disabled', false);
        $("#next").removeClass('btn-outline-secondary');
        $("#next").addClass('btn-outline-primary');
        $("#next").css('cursor', 'pointer');
    }
}

function addCourse(stump) {
    selected_courses.push(getOpenSections(stump));
    updateCourseList();
    updateScheduleDiv();
    $("#generateButton").attr('disabled', false);
    $("#generateButton").css('cursor', 'pointer');
}

function getOpenSections(stump) {
    let sections = stump_to_data[stump]["sections"];
    let open = [];
    for (let i = 0; i < sections.length; i++) {
        if (section_to_data[sections[i]]["courseEnrollmentStatus"] !== 'closed') {
            open.push(sections[i]);
        }
    }
    let course_name = stump_to_data[stump]["name"];
    return {
        name: course_name,
        stump: stump,
        openSections: open,
        filteredSections: [],
        query: stump + ' ' + course_name
    };
}

function collectData(all_data) {
    section_to_data = all_data['data']['courses'];
    section_to_data_keys = Object.keys(section_to_data);
    console.log('Got course data');
    generateStumps();
    console.log('Instantiated stump data');
    generateQueries();
    console.log('Instantiated queries');
    $('#courseSearch').prop("disabled", false);
}

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

function cleanQuery(query) {
    return query.replace(/[^0-9a-z\s\"\']/g, '');
}

/* Constructs HTML for query cards */
function constructSearchCards(results, cap) {
    let coursesAdded = 0;
    let cardsHtml = '<div id="searchResults">';
    for (let i = 0; i < results.length; i++) {
        let stump = nameToStump(results[i]);
        let color = '';
        let add = '';
        let seats = getSeatsFilled(stump);
        if (dictionaryIncludes(selected_courses, results[i])) {
            continue;
        }
        if (!seats[2]) {
            color = "grayCard";
            add = "";
        } else {
            color = getColor(results[i]);
            add = '<button type="button" class="close float-right" id="addCourseButton" data-id="' + stump + '"><span aria-hidden="true" style="color: white;">+</span></button>';
        }
        let formattedSeats = '(' + seats[0] + '/' + seats[1] + ')';
        cardsHtml +=    '<div class="card '+ color +' mb-1" data-id="' + stump + 
                        '" id="addCard" style="overflow:hidden; border-color: rgba(255, 0, 0, 0); cursor: pointer; height:42px;"><div class="card-body p-2 ml-2">' + 
                        results[i] + ' ' + formattedSeats + add + '</div></div>';
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
    for (let i = 0; i < selected_courses.length; i++) {
        let name = selected_courses[i]["query"];
        let stump = selected_courses[i]["stump"];
        let seats = getSeatsFilled(stump);
        let color = getColorOrGray(name, seats);
        let formattedSeats = '(' + seats[0] + '/' + seats[1] + ')';
        cardsHtml +=    '<div class="card ' + color + ' mb-1" data-id="' + 
                        stump + '" id="removeCard" style="height: 85px; border-color: rgba(255, 0, 0, 0); cursor: pointer; overflow: hidden;"><button style="position: absolute; top: 15px; right: 15px;" type="button" class="close" id="removeCourseButton" data-id="' + 
                        stump + '"><span aria-hidden="true" style="color: white;">&times;</span></button><div class="card-body p-3 pr-5">' + name + ' ' + 
                        formattedSeats + '</div></div>';
    }
    return cardsHtml + '</div>';
}

function constructCourseData(stump) {
    let sections = stump_to_data[stump]["sections"];
    let credits = section_to_data[sections[0]]['courseCredits'];
    let description;
    if (section_to_data[sections[0]]['courseDescription'] == null) {
        description = "No course description";
    } else {
        description = '<b>(' + credits + ' credits) </b>' + section_to_data[sections[0]]['courseDescription'];
    }
    let infoHtml = '<div id="courseInfo">';
    infoHtml += '<h5>' + stump + ' | ' + section_to_data[sections[0]]["courseName"] + '</h5><hr><span style="font-size: 14px;">';
    infoHtml += description;
    infoHtml += '</span><hr><h5>Sections (' + sections.length + ')</h5><p>';
    for (let i = 0; i < sections.length; i++) {
        let seats = getSectionSeatsFilled(sections[i]);
        let courseStatus = section_to_data[sections[i]]["courseEnrollmentStatus"];
        let color = getColorFromSeats(seats, courseStatus);
        infoHtml += '<div class="card mb-2 bg-light" style="border-color: ' + color + '; border-width: 2px;"><div class="card-header p-2">' + sections[i] + ' (' + 
                    seats[0] + '/' + seats[1] + ') <span class="text-muted">' + courseStatus + '</span><div class="specialCircle float-right" style="background-color: ' + color + ';"></div></div><div class="card-body p-2 pb-1">' + 
                    formatProfs(sections[i]) + '<br><ul>' + getTimePlace(sections[i]) + '</ul></div></div>';
    }
    return infoHtml + '</div>';
}

/* Update course list */
function updateCourseList() {
    $("#courseSearch").trigger("keyup");
    let cards = constructSelectedCards();
    $("#courseList").replaceWith(cards);
    $("#creditCount").replaceWith('<span id="creditCount">' + getCreditTotal() + '</span>');
}

function getFilterHtml(i) {
    let name = selected_courses[i]["query"];
    let stump = selected_courses[i]["stump"];
    let seats = getSeatsFilled(stump);
    let color = getColorOrGray(name, seats);
    let html =  '<div class="card ml-2 mr-2 mb-2 ' + color + '" style="height: 55px; border-color: rgba(255, 0, 0, 0); cursor: pointer;" data-id="' + 
                stump + '"><div class="card-body p-2"><div class="ml-2" style="position: absolute; top: 15px; width: 67%;">' + name + 
                '</div><select class="selectpicker float-right mt-0" data-width="28%" multiple id="sectionPicker" title="No filter" data-id="' + i + '">';
    let sections = selected_courses[i]["openSections"];
    sections.forEach(function(section) {
        html += '<option>' + section + '</option>';
    });
    return html + '</select></div></div>';
}

function updateScheduleDiv() {
    let html = '';
    for (let i = 0; i < selected_courses.length; i++) {
        html += getFilterHtml(i);
    }
    $("#filterContainer").html(html);
    for (let i = 0; i < selected_courses.length; i++) {
        $("[id='sectionPicker'][data-id='" + i + "']").selectpicker('refresh');
    }
}

function removeItemOnce(dicts, value) { 
    let index = dictionaryIndexOf(dicts, value);
    if (index > -1) {
        dicts.splice(index, 1);
    }
    return dicts;
}

function dictionaryIndexOf(dicts, key) {
    for (let i = 0; i < dicts.length; i++) {
        if (dicts[i]['stump'] == key) {
            return i;
        }
    }
    return -1;
}

function dictionaryIncludes(dicts, key) {
    for (let i = 0; i < dicts.length; i++) {
        if (dicts[i]["query"] == key) {
            return true;
        }
    }
    return false;
}

function getMatchingDictionary(dicts, key, value) {
    for (let i = 0; i < dicts.length; i++) {
        if (dicts[i][key] == value) {
            return dicts[i];
        }
    }
    return;
}

/* Get total credits of selected courses */
function getCreditTotal() {
    let count = 0.0;
    for (let i = 0; i < selected_courses.length; i++) {
        count += parseFloat(stump_to_data[selected_courses[i]["stump"]]["credits"]);
    }
    return count;
}

function getColor(name) {
    let colors = ["redCard", "greenCard", "yellowCard", "blueCard", "orangeCard", "purpleCard", "mintCard", "pinkCard", "aquaCard", "cobaltCard", "limeCard", "strongPinkCard", "dreamPurpleCard"];
    let location = Math.trunc((name.toLowerCase().charCodeAt(0) + name.toLowerCase().charCodeAt(1)) % 13);
    return colors[location];
}

function getColorOrGray(name, seats) {
    if (!seats[2]) {
        return "grayCard";
    } else {
        return getColor(name);
    }
}

/* Cut a code down to a stump */
function stumpify(code) {
    return code.split('-')[0];
}

function nameToStump(name) {
    words = name.split(' ');
    return words[0] + ' ' + words[1] + ' ' + words[2];
}

/* Generate mapping of stumps to sections */
function generateStumps() {
    stump_to_data = {};
    for (let i = 0; i < section_to_data_keys.length; i++) {
        let stump = stumpify(section_to_data_keys[i]);
        // Already have this stump
        if (stump_to_data.hasOwnProperty(stump)) {
            // Just add this section
            stump_to_data[stump]["sections"].push(section_to_data_keys[i]);
        } else {
            let course = section_to_data[[section_to_data_keys[i]][0]];
            // Instantiate it!
            stump_to_data[stump] = {
                sections: [section_to_data_keys[i]],
                name: course["courseName"],
                credits: course["courseCredits"]
            }
        }
    }
}

/* Generate mapping of stump+name to stump */
function generateQueries() {
    queries = [];
    stump_keys = Object.keys(stump_to_data);
    for (let i = 0; i < stump_keys.length; i++) {
        let course = section_to_data[stump_to_data[stump_keys[i]]["sections"][0]];
        queries.push(stump_keys[i] + ' ' + course['courseName']);
    }
}

function getSeatsFilled(stump) {
    let sections = stump_to_data[stump]["sections"];
    let seatsFilled = 0;
    let seatsTotal = 0;
    let anyAvailable = false;
    for (let i = 0; i < sections.length; i++) {
        seatsFilled += section_to_data[sections[i]]["courseSeatsFilled"];
        seatsTotal += section_to_data[sections[i]]["courseSeatsTotal"];
        if (section_to_data[sections[i]]["courseEnrollmentStatus"] !== 'closed') {
            anyAvailable = true;
        }
    }
    return [seatsFilled, seatsTotal, anyAvailable];
}

function getSectionSeatsFilled(code) {
    let course = section_to_data[code];
    return [course['courseSeatsFilled'], course['courseSeatsTotal']];
}

function getColorFromSeats(seats, enrollmentStatus) {
    if (enrollmentStatus == 'closed') {
        return 'rgb(187, 187, 187)';
    }
    if (seats[1] == 0) {
        return 'rgb(128, 204, 29)';
    }
    let percent = seats[0] / seats[1];
    let colors = ['rgb(173, 52, 12)', 'rgb(207, 138, 19)', 'rgb(255, 246, 82)', 'rgb(128, 204, 29)'];
    let h = (100 - Math.round(percent * 100))/100;
    if (h < 0) { h = 0; }
    if (h == 1) { h = 0.99; }
    return colors[Math.floor(h * 4)];
}

function formatProfs(code) {
    let profs = section_to_data[code]['courseInstructors'];
    if (profs.length == 0) {
        return 'No professor data';
    } else if (profs.length == 1) {
        return 'Taught by ' + profs[0];
    } else if (profs.length == 2) {
        return 'Taught by ' + profs[0] + ' and ' + profs[1];
    } else {
        let string = 'Taught by ';
        for (let i = 0; i < profs.length-1; i++) {
            string += profs[i] + ', '
        }
        return string + 'and ' + profs[profs.length - 1];
    }
}

function permute(courseList) {
    var r = [], max = courseList.length - 1;
    function helper(sections, i) {
        let actualSections;
        if (courseList[i]["filteredSections"].length == 0) {
            actualSections = courseList[i]["openSections"];
        } else {
            actualSections = courseList[i]["filteredSections"];
        }
        for (var j = 0, l = actualSections.length; j < l; j++) {
            var a = sections.slice(0); // clone arr
            a.push(actualSections[j]);
            if (i == max)
                r.push(a);
            else
                helper(a, i + 1);
        }
    }
    helper([], 0);
    return r;
}

function getAllSchedules() {
    let permutations = permute(selected_courses);
    let non_conflicts = [];
    permutations.forEach(function(permutation) {
        if (!proposedScheduleConflict(permutation)) {
            non_conflicts.push(permutation);
        }
    });
    return non_conflicts;
}

function proposedScheduleConflict(sections) {
    for (let i = 0; i < sections.length - 1; i++) {
        for (let j = i + 1; j < sections.length; j++) {
            if (sectionsConflict(sections[i], sections[j])) {
                return true;
            }
        }
    }
    return false;
}

function sectionsConflict(section1, section2) {
    let schedules1 = section_to_data[section1]["courseSchedule"];
    let schedules2 = section_to_data[section2]["courseSchedule"];
    for (let i = 0; i < schedules1.length; i++) {
        for (let j = 0; j < schedules2.length; j++) {
            if (schedulesConflict(schedules1[i], schedules2[j])) {
                return true;
            }
        }
    }
    return false;
}

function schedulesConflict(schedule1, schedule2) {
    if (!daysCoincide(schedule1["scheduleDays"], schedule2["scheduleDays"])) {
        return false;
    } else {
        return timesCoincide(   militaryToMinutes(schedule1["scheduleStartTime"]),
                                militaryToMinutes(schedule1["scheduleEndTime"]),
                                militaryToMinutes(schedule2["scheduleStartTime"]),
                                militaryToMinutes(schedule2["scheduleEndTime"]));
    }
}

function daysCoincide(days1, days2) {
    if (days1.length == 0 || days2.length == 0) {
        return false;
    }
    for (let i = 0; i < days1.length; i++) {
        if (days2.indexOf(days1.charAt(i)) !== -1) {
            return true;
        }
    }
    return false;
}

function timesCoincide(start1, end1, start2, end2) {
    if (start1 == 0 || start2 == 0) {
        return false;
    }
    if (start1 < end2 && start2 < end1) {
        return true;
    } else {
        return false;
    }
}

function militaryToMinutes(military) {
    let split = military.split(':');
    return 60 * parseInt(split[0]) + parseInt(split[1]);
}

function getFullSchedule(sections) {
    let html = '';
    sections.forEach(function(section) {
        html += getCalendarEvent(section);
    });
    return html;
}

function getCalendarEvent(section) {
    let color = getColor(section);
    let schedules = section_to_data[section]["courseSchedule"];
    let name = section_to_data[section]["courseName"];
    let html = '';
    let seats = getSectionSeatsFilled(section);
    for (let i = 0; i < schedules.length; i++) {
        let days = schedules[i]["scheduleDays"];
        if (days == '') {
            continue;
        }
        let start = schedules[i]["scheduleStartTime"];
        if (militaryToMinutes(start) == 0) {
            continue;
        }
        let end = schedules[i]["scheduleEndTime"];
        for (let i = 0; i < days.length; i++) {
            html += '<div class="box ' + color + '" data-id="' + section + '" style="grid-row: ' + timeToRow(start) + ' / ' + timeToRow(end) + 
                    '; cursor: pointer; grid-column: ' + dayToCols(days.charAt(i)) + ';"><b>' + section + '</b> (' + seats[0] + '/' + seats[1] + ')<p>' + name + '</div>';
        }
    }
    return html;
}

function timeToRow(time) {
    let split = time.split(':');
    return (parseInt(split[0])-7)*12 + 1 + Math.floor(parseInt(split[1])/5);
}

function dayToCols(day) {
    let days = ['M', 'T', 'W', 'R', 'F'];
    let index = days.indexOf(day);
    return (index + 2) + ' / ' + (index + 3);
}

function getLowestAvailability(sections) {
    let highest = [0, 0, 0];
    sections.forEach(function(section) {
        let seats = getSectionSeatsFilled(section);
        if (seats[1] != 0) {
            if (seats[0] / seats[1] > highest[2]) {
                highest = [seats[0], seats[1], seats[0] / seats[1]];
            }
        }
    });
    let availability = 1 - highest[2];
    return [highest[0], highest[1], Math.round(availability * 100), getColorFromAvailability(availability)];
}

function getColorFromAvailability(percent) {
    let h = Math.round(15 + percent * 95);
    return 'hsl(' + h + ', 73%, 55%)';
}

function sortByAvailability() {
    non_conflicts.sort(function(x, y) {
        let xa = getLowestAvailability(x)[2];
        let ya = getLowestAvailability(y)[2];
        if (xa == ya) {
            return 0;
        } if (xa > ya) {
            return -1;
        } else {
            return 1;
        }
    });
}

function generateCourseCards(sections) {
    let html = '';
    sections.forEach(function(section) {
        html += '<div class="card ml-1 mr-1 p-2 ' + getColor(section) + '" style="display: inline-block;">' + section + '</div>';
    });
    return html;
}

function getTimePlace(section) {
    let schedules = section_to_data[section]["courseSchedule"];
    let html = '';
    for (let i = 0; i < schedules.length; i++) {
        let days = schedules[i]["scheduleDays"];
        let location = schedules[i]["scheduleLocation"];
        if (days == '') {
            days = 'No days specified';
        } if (location == '' || location == 'N/A') {
            location = 'no location specified';
        }
        html += '<li><span class="text-muted">' + days + ', ' + militaryToRegular(schedules[i]["scheduleStartTime"]) + ' – ' + 
                militaryToRegular(schedules[i]["scheduleEndTime"]) + '; ' + location + '</span></li>';
    }
    return html;
    
}

function militaryToRegular(military) {
    let split = military.split(':');
    let hours, minutes, am_pm;
    if (parseInt(split[0]) > 12) {
        hours = parseInt(split[0]) - 12;
        am_pm = 'PM';
    } else {
        hours = parseInt(split[0]);
        am_pm = 'AM';
    }
    minutes = split[1];
    return hours + ':' + minutes + ' ' + am_pm;
}

function fixQuotationMarks(name) {
    return name.replace(/\"/g, '\'');
}

/*
             ____
              ---|
  \/            /|     \/
               / |\
              /  | \        \/
             /   || \
            /    | | \
           /     | |  \
          /      | |   \
         /       ||     \
        /        /       \
       /________/         \
       ________/__________--/
       \___________________/
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\~~~\
                                |###|
                                |###|
                                |###|
                                                  
You've traveled far, programmer. It appears you've reached the end of this file.

*/