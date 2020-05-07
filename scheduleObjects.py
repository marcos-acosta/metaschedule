from data import COURSES
from util import *

# Schedule class (helpful way of organizing the time slots of a section)
class Schedule:
    # Constructor
    def __init__(self, obj):
        self.days = obj['scheduleDays']
        self.endDate = obj['scheduleEndDate']
        self.endTime = obj['scheduleEndTime']
        self.location = obj['scheduleLocation']
        self.startDate = obj['scheduleStartDate']
        self.startTime = obj['scheduleStartTime']
        self.termCount = obj['scheduleTermCount']
        self.terms = obj['scheduleTerms']
    
    def __repr__(self):
        return 'Meets ' + self.days + ', from ' + self.startTime + ' to ' + self.endTime + '.'


# A list of codes with helpful methods, for permutations
class Collection:
    def __init__(self, codes):
        self.codes = codes
        self.credits = self.calculate_credits()
        self.availability = self.calculate_availability()

    def __repr__(self):
        return str(self.codes)

    def calculate_credits(self):
        credits = 0.0
        for code in self.codes:
            credits = credits + float(codeToCredits(code))
        return credits

    def calculate_availability(self):
        cumulative = 0.0
        for code in self.codes:
            cumulative = cumulative + float(codeToSeatsTotal(code)) - float(codeToSeatsFilled(code))
        return int(cumulative)


''' Course data accessor methods '''

def codeToSchedule(code):
    return [Schedule(schedule_object) for schedule_object in COURSES[code]['courseSchedule']]

def codeToCredits(code):
    return COURSES[code]['courseCredits']

def codeToSeatsTotal(code):
    return COURSES[code]['courseSeatsTotal']

def codeToSeatsFilled(code):
    return COURSES[code]['courseSeatsFilled']


# Check to see if theres a conflict with the code list given
def schedule_conflict(codeList):
    schedules = [codeToSchedule(code) for code in codeList]
    length = len(schedules)
    for i in range(0, length - 1):
        for j in range(i + 1, length):
            if course_conflict(schedules[i], schedules[j]):
                return True
    return False


# An ugly recursive function to construct a list of permutations from course codes
def recurse_courses(courses, meta, building, top_level=True):
        if len(courses) == 0:
            meta.append(building)
            return
        for section in courses[0]:
            if top_level:
                # Get the ball rolling
                recurse_courses(courses[1:], meta, [section], False)
            else:
                # Use it or use it
                building.append(section)
                recurse_courses(courses[1:], meta, building.copy(), False)
                building.remove(section)
        if top_level:
            return meta


# Top-level method for recurse-courses
def get_all_permutations(codes):
    codes = sorted(codes, key=len)
    all_courses = recurse_courses(codes, [], [])
    all_courses = [codeList for codeList in all_courses if not schedule_conflict(codeList)]
    return all_courses