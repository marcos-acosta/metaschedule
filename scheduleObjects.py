from data import COURSES
from util import *

# Course class (all data for a single course and section)
class Course:
    def __init__(self, obj):
        self.code = obj['courseCode']
        self.name = obj['courseName']
        self.sortKey = obj['courseSortKey']
        self.mutualExclusionKey = obj['courseMutualExclusionKey']
        self.description = obj['courseDescription']
        self.instructors = obj['courseInstructors']
        self.term = obj['courseTerm']
        self.schedule = [Schedule(schedule_object) for schedule_object in obj['courseSchedule']]
        self.credits = obj['courseCredits']
        self.seatsTotal = obj['courseSeatsTotal']
        self.seatsFilled = obj['courseSeatsFilled']
        self.waitlistLength = obj['courseWaitlistLength']
        self.enrollmentStatus = obj['courseEnrollmentStatus']
        self.root = self.code.split('-')[0]

    def __repr__(self):
        return  '[' + self.code + '] ' + \
                self.name + ', ' + \
                self.credits + ' credits | ' + \
                self.abridge(self.description)

    def full(self):
        return  '[' + str(self.code) + '] ' + str(self.name) + '\n' + \
                'Sort key: ' + str(self.sortKey) + '\n' + \
                'Mutual exlusion key: ' + str(self.mutualExclusionKey) + '\n' + \
                'Description: ' + str(self.description) + '\n' + \
                'Instructors: ' + str(self.instructors) + '\n' + \
                'Term: ' + str(self.term) + '\n' + \
                'Schedule: ' + str(self.schedule) + '\n' + \
                'Credits: ' + str(self.credits) + '\n' + \
                'Seats total: ' + str(self.seatsTotal) + '\n' + \
                'Seats filled: ' + str(self.seatsFilled) + '\n' + \
                'Waitlist length: ' + str(self.waitlistLength) + '\n' + \
                'Enrollment status: ' + str(self.enrollmentStatus)

    @staticmethod
    def abridge(string):
        if len(string) < 100:
            return string
        else:
            return string[:100] + '...'

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


class Collection:
    def __init__(self, codes):
        self.codes = codes
        self.courses = [codeToCourse(code) for code in codes]
        self.credits = self.calculate_credits()
        self.availability = self.calculate_availability()

    def __repr__(self):
        return str(self.codes)

    def calculate_credits(self):
        credits = 0.0
        for course in self.courses:
            credits = credits + float(course.credits)
        return credits

    def calculate_availability(self):
        cumulative = 0.0
        for course in self.courses:
            cumulative = cumulative + float(course.seatsTotal) - float(course.seatsFilled)
        return int(cumulative)


# Converts a course code into a course object
def codeToCourse(code):
    return Course(COURSES[code])


# Check to see if theres a conflict with the code list given
def schedule_conflict(codeList):
    courses = [codeToCourse(code) for code in codeList]
    length = len(courses)
    for i in range(0, length - 1):
        for j in range(i + 1, length):
            if course_conflict(courses[i], courses[j]):
                return True
    return False

def recurse_courses(courses, meta, building, top_level=True):
        if len(courses) == 0:
            meta.append(building)
            return
        for section in courses[0]:
            if top_level:
                # Get the ball rolling
                recurse_courses(courses[1:], meta, [section], False)
            else:
                building.append(section)
                recurse_courses(courses[1:], meta, building.copy(), False)
                building.remove(section)
        if top_level:
            return meta

def get_all_permutations(codes):
    codes = sorted(codes, key=len)
    all_courses = recurse_courses(codes, [], [])
    all_courses = [codeList for codeList in all_courses if not schedule_conflict(codeList)]
    return all_courses