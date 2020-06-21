/* Global variables */
var course_data;
var stump_data;
var selectedCourses = [];
var course_keys;
var search_data;
var search_data_keys;
var pending_course;
var meta = [];

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
        $("#scheduleContainer").hide();
        $("#scheduleGeneratorContainer").hide();
    });
    $("#schedulesButton").change(function() {
        $("#searchContainer").hide();
        $("#mainSelectedCoursesCard").hide();
        $("#scheduleContainer").show();
        $("#scheduleGeneratorContainer").show();
    });
    /* Type in search bar */
    $("#courseSearch").keyup(function(){
        let query = cleanQuery($("#courseSearch").val().toLowerCase());
        if (query == '') {
            $("#searchResults").replaceWith('<div id="searchResults"></div>');
        } else {
            let results = searchStrings(query, search_data_keys);
            let cards = constructSearchCards(results, 15);
            $("#searchResults").replaceWith(cards);
        }
    });
    $("#resultsContainer, #selectedContainer, #filterContainer").on("click", ".card", function(){
        let name = $(this).attr("data-id");
        let info = constructCourseData(name);
        $("#courseInfo").replaceWith(info);
    });
    /* Add a course to your cart */
    $("#resultsContainer").on("click", "#addCourseButton", function(e){
        e.stopPropagation();
        let code = $(this).attr("data-id");
        let seats = getSeatsFilled(nameToStump(code));
        if (!seats[2]) {
            pending_course = code;
            $("#fullModal").modal('show');
        } else {
            addCourse(code);
        }
    });
    /* Remove a course from your cart */
    $("#selectedContainer").on("click", "#removeCourseButton", function(e){
        e.stopPropagation();
        let code = $(this).attr("data-id");
        removeItemOnce(selectedCourses, code);
        updateCourseList();
        updateScheduleDiv();
        if (selectedCourses.length == 0) {
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
    $("#scheduleContainer").on("change", "#sectionPicker", function() {
        selectedCourses[$(this).attr('data-id')]["filteredSections"] = $(this).val();
    });
    $("#generateButton").click(function() {
        $("#scheduleCard").slideUp("fast", "swing", function() {
            // Calculations here
            let nonConflicts = getAllSchedules();
            let html = '<ul>';
            nonConflicts.forEach(function(sched){
                html += '<li>' + sched + '</li>';
            });
            $("#scheduleBody").html(html + '</ul>');
            $("#scheduleCard").slideDown("fast", "swing", function() {
                // Done with calculations
            });
        });
    });
});

function addCourse(name) {
    selectedCourses.push(getOpenSections(name));
    updateCourseList();
    updateScheduleDiv();
    $("#generateButton").attr('disabled', false);
    $("#generateButton").css('cursor', 'pointer');
}

function getOpenSections(name) {
    let sections = stump_data[nameToStump(name)]["sections"];
    let open = [];
    for (let i = 0; i < sections.length; i++) {
        if (course_data[sections[i]]["courseEnrollmentStatus"] !== 'closed') {
            open.push(sections[i]);
        }
    }
    return {
        name: name,
        openSections: open,
        filteredSections: []
    };
}

function collectData(all_data) {
    course_data = all_data['data']['courses'];
    course_keys = Object.keys(course_data);
    console.log('Got course data');
    generateStumps();
    console.log('Instantiated stump data');
    generateSearches();
    console.log('Instantiated searches');
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
        let color = '';
        let add = '';
        // if (selectedCourses.includes(results[i])) {
        if (dictionaryIncludes(selectedCourses, results[i])) {
            continue;
        }
        let seats = getSeatsFilled(nameToStump(results[i]));
        if (!seats[2]) {
            color = "grayCard";
            add = "";
        } else {
            color = getColor(results[i]);
            add = '<button type="button" class="close float-right" id="addCourseButton" data-id="' + results[i] + '"><span aria-hidden="true" style="color: white;">+</span></button>';
        }
        let formattedSeats = '(' + seats[0] + '/' + seats[1] + ')';
        cardsHtml +=    '<div class="card '+ color +' mb-1" data-id="' + results[i] + 
                        '" id="addCard" style="border-color: rgba(255, 0, 0, 0); cursor: pointer; height:42px;"><div class="card-body p-2 ml-2">' + 
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
    for (let i = 0; i < selectedCourses.length; i++) {
        let name = selectedCourses[i]["name"];
        let seats = getSeatsFilled(nameToStump(name));
        let color = getColorOrGray(name, seats);
        let formattedSeats = '(' + seats[0] + '/' + seats[1] + ')';
        cardsHtml +=    '<div class="card ' + color + ' mb-1" data-id="' + 
                        name + '" id="removeCard" style="border-color: rgba(255, 0, 0, 0); cursor: pointer;"><div class="card-body">' + name + ' ' + 
                        formattedSeats + '<button type="button" class="close float-right" id="removeCourseButton" data-id="' + 
                        name + '"> <span aria-hidden="true" style="color: white;">&times;</span></button></div></div>';
    }
    return cardsHtml + '</div>';
}

function constructCourseData(name) {
    let stump = nameToStump(name);
    let sections = stump_data[stump]["sections"];
    let credits = course_data[sections[0]]['courseCredits'];
    let description;
    if (course_data[sections[0]]['courseDescription'] == null) {
        description = "No course description";
    } else {
        description = '<b>(' + credits + ' credits) </b>' + course_data[sections[0]]['courseDescription'];
    }
    let infoHtml = '<div id="courseInfo">';
    infoHtml += '<h5>' + name + '</h5><hr><span style="font-size: 14px;">';
    infoHtml += description;
    infoHtml += '</span><hr><h5>Sections (' + sections.length + ')</h5><p>';
    for (let i = 0; i < sections.length; i++) {
        let seats = getSectionSeatsFilled(sections[i]);
        let courseStatus = course_data[sections[i]]["courseEnrollmentStatus"];
        let color = getColorFromSeats(seats, courseStatus);
        infoHtml += '<div class="card mb-2 bg-light" style="border-color: ' + color + '; border-width: 2px;"><div class="card-header p-2">' + sections[i] + ' (' + 
                    seats[0] + '/' + seats[1] + ') <span class="text-muted">' + courseStatus + '</span><div class="specialCircle float-right" style="background-color: ' + color + ';"></div></div><div class="card-body p-2">' + 
                    formatProfs(sections[i]) + '</div></div>'
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
    let name = selectedCourses[i]["name"];
    let seats = getSeatsFilled(nameToStump(name));
    let color = getColorOrGray(name, seats);
    let html =  '<div class="card ml-2 mr-2 mb-2 ' + color + '" style="height: 55px; border-color: rgba(255, 0, 0, 0); cursor: pointer;" data-id="' + 
                name + '"><div class="card-body p-2"><span class="ml-2" style="position: absolute; top: 15px;">' + name + 
                '</span><select class="selectpicker float-right mt-0" multiple id="sectionPicker" title="No filter" data-id="' + i + '">';
    let sections = selectedCourses[i]["openSections"];
    sections.forEach(function(section) {
        html += '<option>' + section + '</option>';
    });
    return html + '</select></div></div>';
}

function updateScheduleDiv() {
    let html = '';
    for (let i = 0; i < selectedCourses.length; i++) {
        html += getFilterHtml(i);
    }
    $("#filterContainer").html(html);
    for (let i = 0; i < selectedCourses.length; i++) {
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
        if (dicts[i]['name'] == key) {
            return i;
        }
    }
    return -1;
}

function dictionaryIncludes(dicts, key) {
    for (let i = 0; i < dicts.length; i++) {
        if (dicts[i]['name'] == key) {
            return true;
        }
    }
    return false;
}

/* Get total credits of selected courses */
function getCreditTotal() {
    let count = 0.0;
    for (let i = 0; i < selectedCourses.length; i++) {
        count += parseFloat(search_data[selectedCourses[i]["name"]]["credits"]);
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

function getSeatsFilled(stump) {
    let sections = stump_data[stump]["sections"];
    let seatsFilled = 0;
    let seatsTotal = 0;
    let anyAvailable = false;
    for (let i = 0; i < sections.length; i++) {
        seatsFilled += course_data[sections[i]]["courseSeatsFilled"];
        seatsTotal += course_data[sections[i]]["courseSeatsTotal"];
        if (course_data[sections[i]]["courseEnrollmentStatus"] !== 'closed') {
            anyAvailable = true;
        }
    }
    return [seatsFilled, seatsTotal, anyAvailable];
}

function getSectionSeatsFilled(code) {
    let course = course_data[code];
    return [course['courseSeatsFilled'], course['courseSeatsTotal']];
}

function getColorFromSeats(seats, enrollmentStatus) {
    if (enrollmentStatus == 'closed') {
        return 'rgb(187, 187, 187)';
    }
    let percent = seats[0] / seats[1];
    let colors = ['rgb(173, 52, 12)', 'rgb(207, 138, 19)', 'rgb(255, 246, 82)', 'rgb(128, 204, 29)'];
    let h = (100 - Math.round(percent * 100))/100;
    if (h < 0) { h = 0; }
    if (h == 1) { h = 0.99; }
    return colors[Math.floor(h * 4)];
}

function formatProfs(code) {
    let profs = course_data[code]['courseInstructors'];
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
    let permutations = permute(selectedCourses);
    let nonConflicts = [];
    permutations.forEach(function(permutation) {
        if (!proposedScheduleConflict(permutation)) {
            nonConflicts.push(permutation);
        }
    });
    return nonConflicts;
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
    let schedules1 = course_data[section1]["courseSchedule"];
    let schedules2 = course_data[section2]["courseSchedule"];
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