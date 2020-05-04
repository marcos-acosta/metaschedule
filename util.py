import math

# Regular time to military time
def military_time(time):
    time = time.split(':')
    return int(time[0])*60 + int(time[1])


# Military time to regular time
def regular_time(military):
    return str(math.floor(military/60)) + ':' + str(int(military % 60))


# Determines if two courses conflict
def course_conflict(course_1, course_2):
    schedules1 = course_1.schedule
    schedules2 = course_2.schedule
    for schedule1 in schedules1:
        for schedule2 in schedules2:
            if time_conflict(schedule1, schedule2):
                return True
    return False


# Determine if two time gaps conflict
def time_conflict(schedule1, schedule2):
    start1 = military_time(schedule1.startTime)
    end1 = military_time(schedule1.endTime)
    start2 = military_time(schedule2.startTime)
    end2 = military_time(schedule2.endTime)
    # Class 1 starts but ends after class 2 starts OR class 2 starts but ends after class 1 starts
    if (start1 < start2 and end1 > start2) or (start1 > start2 and end2 > start1) or start1 == start2:
            return True
    return False
    
