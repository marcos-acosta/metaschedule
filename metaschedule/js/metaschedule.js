/* Global variables */

// Course data from API, key = section, value = dict of data
var section_to_data;
var section_to_data_keys;

// List of dictionaries containing selected stumps, available sections, etc
var selected_courses = [];

// Links a stump to data
var stump_to_data;

// A list of searchable stumps (stump + name)
var queries;

// Keep track of which schedule you're looking at
var current = 0;

// All generated non-conflicting schedules
var non_conflicts;

// Date of last refresh
var last_refresh_time = Date.now();

// Timer
var timer;

/* JQUERY */
$(document).ready(function(){
    // Set last refreshed timer
    resetTimer();
    /* Get course data */
    $.getJSON('https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc', function(all_data) {
        collectData(all_data);
        stopLoading();
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
            $("#searchResults").html('');
        } else {
            let results = searchStrings(query, queries);
            let cards = constructSearchCards(results, 15);
            $("#searchResults").html(cards);
        }
    });
    /* Get course info by clicking on a card */
    $("#resultsContainer, #selectedContainer, #filterContainer").on("click", ".card", function(){
        let stump = $(this).attr("data-id");
        let info = constructCourseData(stump);
        $("#courseInfo").html(info);
    });
    /* Get section info by clicking on a schedule box */
    $("#scheduleBody").on("click", ".box", function(){
        // Update course info card
        let stump = $(this).attr("data-id");
        let info;
        if (isCustom(stump)) {
            info = constructCourseData(stump);
        } else {
            info = constructCourseData(stump.split('-')[0]);
        }
        $("#courseInfo").html(info);
    });
    /* Add a course to your cart */
    $("#resultsContainer").on("click", "#addCourseButton", function(e) {
        e.stopPropagation();
        let stump = $(this).attr("data-id");
        addCourse(stump);
        activateGenerateButton();
    });
    /* Remove a course from your cart */
    $("#selectedContainer").on("click", "#removeCourseButton", function(e) {
        e.stopPropagation();
        let stump = $(this).attr("data-id");
        if (isCustom(stump)) {
            removeItemOnce(selected_courses, 'name', stump.substring(7), 'custom');
        } else {
            removeItemOnce(selected_courses, 'stump', stump, 'course');
        }
        updateCourseList();
        updateFilters();
        if (selected_courses.length == 0) {
            deactivateGenerateButton();
        } else {
            activateGenerateButton();
        }
    });
    /* Refresh data */
    $("#refresh").click(function() {
        // Loading visuals
        startLoading();
        $.getJSON('https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc', function(all_data) {
            collectData(all_data);
            stopLoading();
            let changes = updateSelectedCourses();
            if (changes) {
                $("#changesMadeModal").modal('show');
            }
            updateCourseList();
            updateFilters();
            $("#courseInfo").html('');
            if (selected_courses.length != 0) {
                $("#generateButton").trigger("click");
            }
            deactivateGenerateButton();
            last_refresh_time = Date.now();
            resetTimer();
        });
    });
    /* Learn about filtering */
    $("#filterInfoButton").click(function() {
        $("#filterInfoModal").modal('show');
    });
    /* Learn about schedules */
    $("#scheduleInfoButton").click(function() {
        $("#scheduleInfoModal").modal('show');
    });
    /* Learn the basics */
    $("#help").click(function() {
        $("#helpModal").modal('show');
    });
    /* Update filters */
    $("#scheduleContainer").on("change", "#sectionPicker", function() {
        selected_courses[$(this).attr('data-id')]["filteredSections"] = $(this).val();
        activateGenerateButton();
    });
    /* Generate schedules */
    $("#generateButton").click(function() {
        $("#scheduleCard").slideUp("fast", "swing", function() {
            $("#info").remove();
            // Generate schedules
            non_conflicts = getAllSchedules();
            current = 0;
            updateButtons();
            // No schedules possible
            if (non_conflicts.length == 0) {
                $("#wholeScheduleContainer").hide();
                $("#noPerms").show();
            } else {
                sortByAvailability();
                $("#wholeScheduleContainer").show();
                $("#noPerms").hide();
                generate();
            }
            deactivateGenerateButton();
            $("#scheduleCard").slideDown("fast", "swing");
        });
    });
    /* Navigate between permutations */
    $(".navig").click(function() {
        if ($(this).attr("id") == 'previous') {
            current--;
        } else {
            current++;
        }
        generate();
        updateButtons();
    });
    $("#addCustom").click(function() {
        $("#formModal").modal('show');
    });
    $("#addCustomFinal").click(function() {
        let c_name = $("#commitmentName").val();
        let c_days = getDaysFromForm();
        let c_start = validateTime($("#startTime").val());
        let c_end = validateTime($("#endTime").val());
        let valid = validate(c_name, c_days, c_start, c_end);
        if (valid) {
            let custom = {
                type: 'custom',
                name: c_name,
                courseSchedule: [
                    {
                        scheduleDays: c_days,
                        scheduleStartTime: c_start,
                        scheduleEndTime: c_end,
                        scheduleTermCount: 1,
                        scheduleTerms: [0]
                    }
                ]
            }
            addCustom(custom);
            clearModal();
            $("#formModal").modal('hide');
            activateGenerateButton();
        }
    });
    $("#cancelCustom, #closeCustom").click(function() {
        clearModal();
        $("#formModal").modal('hide');
    });
});

/* Clears custom commitment modal */
function clearModal() {
    let dayIds = ['mondayCheck', 'tuesdayCheck', 'wednesdayCheck', 'thursdayCheck', 'fridayCheck'];
    $("#commitmentName").val('');
    $("#startTime").val('');
    $("#endTime").val('');
    dayIds.forEach(function(id) {
        $('#' +  id).prop('checked', false);
    });
    $("#error").hide();
}

/* Updates your selected courses (with new data) */
function updateSelectedCourses() {
    let changesMade = false;
    // Go through selected courses
    for (let i = 0; i < selected_courses.length; i++) {
        let course = selected_courses[i];
        // If not custom
        if (course["type"] == 'course') {
            // Update open sections
            course["openSections"] = getOpenSections(course["stump"]);
            // This course isn't available anymore
            if (course["openSections"].length == 0) {
                removeItemOnce(selected_courses, 'stump', course["stump"], 'course');
                changesMade = true;
                i--;
            } else {
                let filtered = course["filteredSections"];
                for (let j = 0; j < filtered.length; j++) {
                    // This filtered section isn't open anymore
                    if (!arrayIncludes(course["openSections"], filtered[j])) {
                        filtered.splice(j, 1);
                        changesMade = true;
                        j--;
                    }
                }
            }
        }
    }
    return changesMade;
}

/* Fully validate days, start time, and end time, returns true if valid, false otherwise */
function validate(name, days, start, end) {
    // Empty name
    if (name == '') {
        $("#error").html('ERR: Please give a name to this commitment.');
        $("#error").show();
    }
    // Name already used
    if (dictionaryIncludes(selected_courses, 'name', name, 'custom')) {
        $("#error").html('ERR: It looks like you already used this name.');
        $("#error").show();
    }
    // No days selected
    else if (days == '') {
        $("#error").html('ERR: You must select at least one weekday.');
        $("#error").show();
    }
    // Time error
    else if (start.charAt(0) == 'E' || end.charAt(0) == 'E') {
        let err;
        if (start.charAt(0) == 'E') {
            err = start;
        } else {
            err = end;
        }
        $("#error").html(err);
        $("#error").show();
    }
    // Times flipped
    else if (militaryToMinutes(start) >= militaryToMinutes(end)) {
        $("#error").html('ERR: It looks like your start time is later than your end time.');
        $("#error").show();
    }
    // All good
    else {
        return true;
    }
    return false;
}

/* Get custom days */
function getDaysFromForm() {
    let dayIds = ['mondayCheck', 'tuesdayCheck', 'wednesdayCheck', 'thursdayCheck', 'fridayCheck'];
    let dayNames = ['M', 'T', 'W', 'R', 'F'];
    let days = '';
    for (let i = 0; i < dayIds.length; i++) {
        if ($('#' + dayIds[i]).prop('checked')) {
            days += dayNames[i];
        }
    }
    return days;
}

/* Deal with potential user shenanigans */
function validateTime(time) {
    if (time.indexOf(':') == -1) {
        return 'ERR: Times must contain a colon (:).';
    }
    if (time.split(':').length > 2) {
        return 'ERR: Too many colons.';
    }
    if (time.split(':')[1].length < 3) {
        return 'ERR: Invalid time.';
    }
    // Hours is whatever comes before the colon
    let hours = time.split(':')[0];
    // Minutes is the first two characters after the colon
    let minutes = time.split(':')[1].substring(0, 2);
    // AM or PM is whatever's left
    let am_pm = $.trim(time.split(':')[1].substring(2));
    // If hours or minutes can't be converted
    if (!isInteger(hours) || !isInteger(minutes)) {
        return 'ERR: Invalid time';
    }
    let h = parseInt(hours);
    let m = parseInt(minutes);
    // Normalize am and pm
    let a = am_pm.toLowerCase();
    if (a == 'a') {
        a = 'am';
    } else if (a == 'p') {
        a = 'pm';
    }
    // Totally wrong hour or minute values
    if (h < 1 || h > 12 || m < 0 || m > 59) {
        return 'ERR: Invalid time';
    }
    // Still can't guess am or pm
    if (a != 'am' && a != 'pm') {
        return 'ERR: Couldn\'t parse AM or PM.';
    }
    // If before 8am, is 12am, or 11pm, out of bounds
    if ((a == 'am' && h < 8) || (a == 'pm' && h == 11) || (a == 'am' && h == 12)) {
        return 'ERR: Time should be between 8:00 AM and 10:59 PM.';
    }
    if (a == 'am' || a == 'pm' && h == 12) {
        return h + ':' + minutes;
    } else {
        return (h + 12) + ':' + minutes;
    }
}

/* Determines if a value could be converted to an int */
function isInteger(value) {
    return /^\d+$/.test(value);
}

/* Visually indicate that data is being retrieved */
function startLoading() {
    $('#courseSearch').prop("disabled", true);
    $('#loadingSpinner').show();
    $('#refreshSpinner').show();
}

/* Visually indicate that data has been retrieved */
function stopLoading() {
    $('#courseSearch').prop("disabled", false);
    $('#loadingSpinner').hide();
    $('#refreshSpinner').hide();
}

/* Display non-conflicting schedules */
function generate() {
    $(".box").remove();
    let html = getFullSchedule(non_conflicts[current]);
    let availability = getLowestAvailability(non_conflicts[current]);
    // Set stuff on page
    $("#countNumber").html(getNumberPermutations());
    $("#classes").html(generateCourseCards(non_conflicts[current]));
    $("#score").html(availability[2]);
    $("#page").html((current + 1) + '/' + non_conflicts.length);
    $("#actualScore").html(availability[0] + '/' + availability[1]);
    $("#availability").css('border-color', availability[3]);
    $("#realDeal").append(html);
}

/* Use English to count number of permutations found */
function getNumberPermutations() {
    let num = non_conflicts.length;
    if (num == 1) {
        return '1 permutation';
    } else {
        return num + ' permutations';
    }
}

/* Update next and previous buttons depending on current */
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

/* Adds a course to your cart by stump and updates everything */
function addCourse(stump) {
    selected_courses.push(getCourseDict(stump));
    updateCourseList();
    updateFilters();
    console.log('Selected courses:', selected_courses);
}

/* Adds a custom commitment and updates everything */
function addCustom(custom) {
    selected_courses.push(custom);
    updateCourseList();
    updateFilters();
    console.log('Selected courses:', selected_courses);
}

/* Make generate button visually clickable */
function activateGenerateButton() {
    $("#generateButton").attr('disabled', false);
    $("#generateButton").css('cursor', 'pointer');
}

/* Make generate button visually unclickable */
function deactivateGenerateButton() {
    $("#generateButton").attr('disabled', true);
    $("#generateButton").css('cursor', 'initial');
}

/* Put relevant information from a stump into a dictionary */
function getCourseDict(stump) {
    let open = getOpenSections(stump);
    let course_name = stump_to_data[stump]["data"]["courseName"];
    // Consolidate data
    return {
        type: 'course',
        name: course_name,
        stump: stump,
        openSections: open,
        filteredSections: [],
        query: stump + ' ' + course_name
    };
}

/* Gets open sections from stump */
function getOpenSections(stump) {
    let sections = stump_to_data[stump]["sections"];
    let open = [];
    // Add open sections
    for (let i = 0; i < sections.length; i++) {
        if (section_to_data[sections[i]]["courseEnrollmentStatus"] !== 'closed') {
            open.push(sections[i]);
        }
    }
    return open;
}

/* Fetch data and construct necessary objects */
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

/* Takes out characters that aren't a-z, A-Z, 0-9, space, ", or ' */
function cleanQuery(query) {
    return query.replace(/[^0-9a-z\s\"\']/g, '');
}

/* Constructs HTML for query cards */
function constructSearchCards(results, cap) {
    let coursesAdded = 0;
    let cardsHtml = '';
    // Loop through results
    for (let i = 0; i < results.length; i++) {
        let stump = queryToStump(results[i]);
        let add;
        let seats = getSeatsFilled(stump);
        let color = getColorOrGray(results[i], seats);
        // Already added this course, so skip
        if (dictionaryIncludes(selected_courses, "query", results[i], 'course')) {
            continue;
        }
        // Add button or no?
        if (!seats[2]) {
            add = '';
        } else {
            add =   '<button type="button" class="close float-right" id="addCourseButton" data-id="' + stump + '">' + 
                    '<span aria-hidden="true" style="color: white;">+</span></button>';
        }
        let formattedSeats = '(' + seats[0] + '/' + seats[1] + ')';
        cardsHtml +=    '<div class="card '+ color +' mb-1" data-id="' + stump + '" id="addCard" style="overflow:hidden;' + 
                        'cursor: pointer; height:42px;"><div class="card-body p-2 ml-2">' + 
                        results[i] + ' ' + formattedSeats + add + '</div></div>';
        coursesAdded++;
        if (coursesAdded == cap) {
            break;
        }
    }
    return cardsHtml;
}

/* Constructs HTML for selected course cards */
function constructSelectedCards() {
    let cardsHtml = '';
    for (let i = 0; i < selected_courses.length; i++) {
        if (selected_courses[i]["type"] == 'custom') {
            let name = selected_courses[i]["name"];
            cardsHtml +=    '<div class="card customCard mb-1" data-id="custom-' + name + '" id="removeCard" style="height: 85px' + 
                            'border-color: rgba(255, 0, 0, 0); cursor: pointer; overflow: hidden;"><button style="position:' + 
                            'absolute; top: 15px; right: 15px;" type="button" class="close" id="removeCourseButton" data-id="custom-' + 
                            name + '"><span aria-hidden="true" style="color: white;">&times;</span></button><div ' + 
                            'class="card-body p-3 pr-5">' + name + '</div></div>';
        } else {
            let name = selected_courses[i]["query"];
            let stump = selected_courses[i]["stump"];
            let seats = getSeatsFilled(stump);
            let color = getColor(name);
            let formattedSeats = '(' + seats[0] + '/' + seats[1] + ')';
            cardsHtml +=    '<div class="card ' + color + ' mb-1" data-id="' + stump + '" id="removeCard" style="height: 85px' + 
                            'border-color: rgba(255, 0, 0, 0); cursor: pointer; overflow: hidden;"><button style="position:' + 
                            'absolute; top: 15px; right: 15px;" type="button" class="close" id="removeCourseButton" data-id="' + 
                            stump + '"><span aria-hidden="true" style="color: white;">&times;</span></button><div ' + 
                            'class="card-body p-3 pr-5">' + name + ' ' + formattedSeats + '</div></div>';
        }
    }
    return cardsHtml;
}

/* Get course info in an easy-to-read way */
function constructCourseData(stump) {
    let infoHtml = '';
    if (isCustom(stump)) {
        let custom = dictionaryGet(selected_courses, 'name', stump.substring(7), 'custom');
        infoHtml += '<h5>Custom commitment | ' + custom["name"] + '</h5><hr><span style="font-size: 14px;">';
        infoHtml += getCustomTime(custom);
    } else {
        let sections = stump_to_data[stump]["sections"];
        let credits = section_to_data[sections[0]]['courseCredits'];
        let description;
        if (section_to_data[sections[0]]['courseDescription'] == null) {
            description = "No course description";
        } else {
            description = '<b>(' + credits + ' credits) </b>' + section_to_data[sections[0]]['courseDescription'];
        }
        infoHtml += '<h5>' + stump + ' | ' + section_to_data[sections[0]]["courseName"] + '</h5><hr><span style="font-size: 14px;">';
        infoHtml += description;
        infoHtml += '</span><hr><h5>Sections (' + sections.length + ')</h5><p>';
        for (let i = 0; i < sections.length; i++) {
            infoHtml += getSectionInfo(sections[i]);
        }
    }
    return infoHtml;
}

/* Gets info about a specific section and formats it */
function getSectionInfo(section) {
    let seats = getSectionSeatsFilled(section);
    let courseStatus = section_to_data[section]["courseEnrollmentStatus"];
    let color = getColorFromSeats(seats, courseStatus);
    return  '<div class="card mb-2 bg-light" style="border-color: ' + color + '; border-width: 2px;">' + 
            '<div class="card-header p-2">' + section + ' (' + seats[0] + '/' + seats[1] + ') <span' + 
            'class="text-muted">' + courseStatus + '</span><div class="specialCircle float-right" ' + 
            'style="background-color: ' + color + ';"></div></div><div class="card-body p-2 pb-1">' + 
            formatProfs(section) + '<br><ul>' + getTimePlace(section) + '</ul></div></div>';
}

/* Update course list */
function updateCourseList() {
    $("#courseSearch").trigger("keyup");
    let cards = constructSelectedCards();
    $("#courseList").html(cards);
    $("#creditCount").html(getCreditTotal());
}

/* Construct html for filters */
function getFilterHtml(i) {
    if (selected_courses[i]["type"] == 'course') {
        let name = selected_courses[i]["query"];
        let stump = selected_courses[i]["stump"];
        let selected;
        let color = getColor(name);
        let html =  '<div class="card ml-2 mr-2 mb-2 ' + color + '" style="height: 55px; border-color: rgba(255, 0, 0, 0);' + 
                    'cursor: pointer;" data-id="' + stump + '"><div class="card-body p-2"><div class="ml-2" style="position:' + 
                    'absolute; top: 15px; width: 67%;">' + name + '</div><select class="selectpicker float-right mt-0"' + 
                    'data-width="28%" multiple id="sectionPicker" title="No filter" data-id="' + i + '">';
        let sections = selected_courses[i]["openSections"];
        sections.forEach(function(section) {
            // Add filters back in, if they existed
            if (arrayIncludes(selected_courses[i]["filteredSections"], section)) {
                selected = 'selected';
            } else {
                selected = '';
            }
            html += '<option ' + selected + '>' + section + '</option>';
        });
        return html + '</select></div></div>';
    } else {
        let name = selected_courses[i]["name"];
        return  '<div class="card ml-2 mr-2 mb-2 customCard" style="height: 55px; border-color: rgba(255, 0, 0, 0);' + 
                'cursor: pointer;" data-id="custom-' + name + '"><div class="card-body p-2"><div class="ml-2" style="position:' + 
                'absolute; top: 15px; width: 67%;">' + name + '</div></div></div>';
    }
}

/* Update filters */
function updateFilters() {
    let html = '';
    for (let i = 0; i < selected_courses.length; i++) {
        html += getFilterHtml(i);
    }
    $("#filterContainer").html(html);
    // Refresh all filters (necessary for select-picker to look right)
    for (let i = 0; i < selected_courses.length; i++) {
        $("[id='sectionPicker'][data-id='" + i + "']").selectpicker('refresh');
    }
}

/* Removes an item once */
function removeItemOnce(dicts, key, value, type) {
    let index = dictionaryIndexOf(dicts, key, value, type);
    if (index > -1) {
        dicts.splice(index, 1);
    }
    return dicts;
}

/* Finds the index of a dictionary in a list given a key and value */
function dictionaryIndexOf(dicts, key, value, type) {
    for (let i = 0; i < dicts.length; i++) {
        if (dicts[i]["type"] == type && dicts[i][key] == value) {
            return i;
        }
    }
    return -1;
}

/* Determines if a list of dictionaries includes one given a key and value */
function dictionaryIncludes(dicts, key, value, type) {
    for (let i = 0; i < dicts.length; i++) {
        if (dicts[i]["type"] == type && dicts[i][key] == value) {
            return true;
        }
    }
    return false;
}

/* Retrieves a dictionary from a list of dicts by value */
function dictionaryGet(dicts, key, value, type) {
    for (let i = 0; i < dicts.length; i++) {
        if (dicts[i]["type"] == type && dicts[i][key] == value) {
            return dicts[i];
        }
    }
    return -1;
}

/* Determine if an array has a value */
function arrayIncludes(arr, value) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == value) {
            return true;
        }
    }
    return false;
}

/* Get total credits of selected courses */
function getCreditTotal() {
    let count = 0.0;
    for (let i = 0; i < selected_courses.length; i++) {
        if (selected_courses[i]["type"] == 'course') {
            count += parseFloat(stump_to_data[selected_courses[i]["stump"]]["data"]["courseCredits"]);
        }
    }
    return count;
}

/* Get color by name */
function getColor(name) {
    let colors = ["redCard", "greenCard", "yellowCard", "blueCard", "orangeCard", "purpleCard", "mintCard", "pinkCard", "aquaCard", "cobaltCard", "limeCard", "strongPinkCard", "dreamPurpleCard"];
    let location = Math.trunc((name.toLowerCase().charCodeAt(0) + name.toLowerCase().charCodeAt(1)) % 13);
    return colors[location];
}

/* Return a color, or gray if the course is closed */
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

/* Cut a query to a stump */
function queryToStump(name) {
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
                data: course
            }
        }
    }
}

/* Generate mapping of stump + name to stump */
function generateQueries() {
    queries = [];
    stump_keys = Object.keys(stump_to_data);
    for (let i = 0; i < stump_keys.length; i++) {
        let course = section_to_data[stump_to_data[stump_keys[i]]["sections"][0]];
        queries.push(stump_keys[i] + ' ' + course['courseName']);
    }
}

/* Get the total number of seats filled and total across all sections, as well as whether any sections are available */
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

/* Get seats filled in a section */
function getSectionSeatsFilled(section) {
    let course = section_to_data[section];
    return [course['courseSeatsFilled'], course['courseSeatsTotal']];
}

/* Assign a color to a section based on how full it is */
function getColorFromSeats(seats, enrollmentStatus) {
    if (enrollmentStatus == 'closed') {
        return 'rgb(187, 187, 187)';
    }
    // To avoid division by 0
    if (seats[1] == 0) {
        return 'rgb(128, 204, 29)';
    }
    let percent = seats[0] / seats[1];
    let colors = ['rgb(173, 52, 12)', 'rgb(207, 138, 19)', 'rgb(255, 246, 82)', 'rgb(128, 204, 29)'];
    let h = (100 - Math.round(percent * 100))/100;
    if (h < 0) { h = 0; }
    if (h == 1) { h = 0.99; }   // To avoid out of bounds error
    return colors[Math.floor(h * 4)];
}

/* Format names of profs in English */
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

/* Determine if a string is a section or a custom id */
function isCustom(section) {
    if (section.length > 6 && section.substring(0, 7) == 'custom-') {
        return true;
    }
    return false;
}

/* Find all permutations from selected courses and filters (conflicts included) */
function permute(courseList) {
    var r = [], max = courseList.length - 1;
    function helper(sections, i) {
        let actualSections;
        if (courseList[i]["type"] == 'custom') {
            actualSections = ['custom-'+courseList[i]["name"]];
        } else {
            // If no filters, assume all sections ok
            if (courseList[i]["filteredSections"].length == 0) {
                actualSections = courseList[i]["openSections"];
            } else {
                actualSections = courseList[i]["filteredSections"];
            }
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
    // Recursive call
    helper([], 0);
    return r;
}

/* Weed out conflicted schedules */
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

/* Determine if a list of sections conflict */
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

/* Determine if two sections conflict */
function sectionsConflict(section1, section2) {
    let schedules1, schedules2;
    if (isCustom(section1)) {
        schedules1 = dictionaryGet(selected_courses, 'name', section1.substring(7), 'custom')["courseSchedule"];
    } else {
        schedules1 = section_to_data[section1]["courseSchedule"];
    }
    if (isCustom(section2)) {
        schedules2 = dictionaryGet(selected_courses, 'name', section2.substring(7), 'custom')["courseSchedule"];
    } else {
        schedules2 = section_to_data[section2]["courseSchedule"];
    }
    for (let i = 0; i < schedules1.length; i++) {
        for (let j = 0; j < schedules2.length; j++) {
            if (schedulesConflict(schedules1[i], schedules2[j])) {
                return true;
            }
        }
    }
    return false;
}

/* Determine if two schedules conflict */
function schedulesConflict(schedule1, schedule2) {
    if (!daysCoincide(schedule1["scheduleDays"], schedule2["scheduleDays"]) || !sameTerms(schedule1, schedule2)) {
        return false;
    } else {
        return timesCoincide(   militaryToMinutes(schedule1["scheduleStartTime"]),
                                militaryToMinutes(schedule1["scheduleEndTime"]),
                                militaryToMinutes(schedule2["scheduleStartTime"]),
                                militaryToMinutes(schedule2["scheduleEndTime"]));
    }
}

/* Determine if two scheduleDays overlap */
function daysCoincide(days1, days2) {
    // '' means days TBA, assume can't possibly conflict
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

/* Determine if two schedules occur in different terms */
function sameTerms(schedule1, schedule2) {
    let count1 = schedule1["scheduleTermCount"];
    let count2 = schedule2["scheduleTermCount"];
    if (count1 == 1 || count2 == 1) {
        return true;
    }
    let terms1 = schedule1["scheduleTerms"];
    let terms2 = schedule2["scheduleTerms"];
    if (terms1[0] == terms2[0]) {
        return true;
    } else {
        return false;
    }
}

/* Determine if two pairs of start and end times conflict */
function timesCoincide(start1, end1, start2, end2) {
    // 00:00 means time TBA, assume can't possibly conflict
    if (start1 == 0 || start2 == 0) {
        return false;
    }
    if (start1 < end2 && start2 < end1) {
        return true;
    } else {
        return false;
    }
}

/* Convert HH:MM into minutes */
function militaryToMinutes(military) {
    let split = military.split(':');
    return 60 * parseInt(split[0]) + parseInt(split[1]);
}

/* Get all boxes */
function getFullSchedule(sections) {
    let html = '';
    sections.forEach(function(section) {
        html += getCalendarEvent(section);
    });
    return html;
}

/* Construct a box to match the section's start and end times */
function getCalendarEvent(section) {
    let color, schedules, name, seats, profs, custom, title;
    if (isCustom(section)) {
        custom = dictionaryGet(selected_courses, 'name', section.substring(7), 'custom');
        color = 'customCard';
        schedules = custom["courseSchedule"];
        console.log(schedules);
        title = 'Custom commitment';
        name = section.substring(7);
        seats = '';
        profs = 'Custom commitment';
    } else {
        color = getColor(section);
        schedules = section_to_data[section]["courseSchedule"];
        title = section;
        name = section_to_data[section]["courseName"];
        seats = getSectionSeatsFilled(section);
        profs = formatProfs(section);
    }
    let html = '';
    for (let i = 0; i < schedules.length; i++) {
        let days, start, end, formattedSeats;
        days = schedules[i]["scheduleDays"];
        // No days specified
        if (days == '') {
            continue;
        }
        start = schedules[i]["scheduleStartTime"];
        // No time specified
        if (militaryToMinutes(start) == 0) {
            continue;
        }
        end = schedules[i]["scheduleEndTime"];
        if (!isCustom(section)) {
            formattedSeats = '(' + seats[0] + '/' + seats[1] + ')';
        } else {
            formattedSeats = '';
        }
        for (let i = 0; i < days.length; i++) {
            html += '<div class="box ' + color + '" data-id="' + section + '" style="grid-row: ' + timeToRow(start) + ' / ' + 
                    timeToRow(end) + '; cursor: pointer; grid-column: ' + dayToCols(days.charAt(i)) + ';"><b>' + title + 
                    '</b> ' + formattedSeats + '<p>' + name + '<span class="tooltiptext">' + profs + '</span></div>';
        }
    }
    return html;
}

/* Convert a time to a row in the grid */
function timeToRow(time) {
    let split = time.split(':');
    return (parseInt(split[0])-7)*12 + 1 + Math.floor(parseInt(split[1])/5);
}

/* Convert a day to a column in the grid */
function dayToCols(day) {
    let days = ['M', 'T', 'W', 'R', 'F'];
    let index = days.indexOf(day);
    return (index + 2) + ' / ' + (index + 3);
}

/* Get the section with the lowest availability */
function getLowestAvailability(sections) {
    let highest = [0, 0, 0];
    // Find lowest
    sections.forEach(function(section) {
        let seats;
        if (isCustom(section)) {
            seats = [0, 0];
        } else {
            seats = getSectionSeatsFilled(section);
        }
        if (seats[1] != 0) {
            if (seats[0] / seats[1] > highest[2]) {
                highest = [seats[0], seats[1], seats[0] / seats[1]];
            }
        }
    });
    let availability = 1 - highest[2];
    // Return filled, total, percent, color
    return [highest[0], highest[1], Math.round(availability * 100), getColorFromAvailability(availability)];
}

/* Get hsl value corresponding to availability */
function getColorFromAvailability(percent) {
    let h = Math.round(15 + percent * 95);
    return 'hsl(' + h + ', 73%, 55%)';
}

/* Sort nonConflicts by availibility */
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

/* Show sections chosen to display above scheduler */
function generateCourseCards(sections) {
    let html = '';
    sections.forEach(function(section) {
        if (isCustom(section)) {
            html += '<div class="card ml-1 mr-1 p-2 customCard" style="display: inline-block;">' + section.substring(7) + '</div>';
        } else {
            html += '<div class="card ml-1 mr-1 p-2 ' + getColor(section) + '" style="display: inline-block;">' + section + '</div>';
        }
    });
    return html;
}

/* Get formatted time of a custom commitment */
function getCustomTime(custom) {
    let sched = custom["courseSchedule"][0];
    return 'Meets ' + sched["scheduleDays"] + ', ' + militaryToRegular(sched["scheduleStartTime"]) + ' - ' + militaryToRegular(sched["scheduleEndTime"]);
}

/* Get formatted time and place of a given section */
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

/* Convert HH:MM-24 to HH:MM-12 */
function militaryToRegular(military) {
    let split = military.split(':');
    let hours, minutes, am_pm;
    if (parseInt(split[0]) > 12) {
        hours = parseInt(split[0]) - 12;
        am_pm = 'PM';
    } else if (parseInt(split[0]) == 12) {
        hours = parseInt(split[0]);
        am_pm = 'PM';
    } else {
        hours = parseInt(split[0]);
        am_pm = 'AM';
    }
    minutes = split[1];
    return hours + ':' + minutes + ' ' + am_pm;
}

/* Borrowed from Stack Overflow, I'll give it back later */
function timeSince(date) {
    let seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

function resetTimer() {
    clearInterval(timer);
    $("#lastRefresh").html('Refreshed just now');
    timer = setInterval(function() {
        $("#lastRefresh").html(timeSince(last_refresh_time) + ' since last refresh');
    }, 10 * 1000); // 10 * 1000 milsec
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