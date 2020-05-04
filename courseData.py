import json
import re

class courseData:
    # Constructor
    def __init__(self, local=False):
        if local:
            with open('data.txt') as json_file:
                data = json.load(json_file)
        else:
            url = "https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc"
            data = urllib.request.urlopen(url).read().decode()
            data = json.loads(data)
        self.courses = data['data']['courses']
        self.terms = data['data']['terms']
        self.until = data['until']
        self.error = data['error']
        self.full = data['full']
        searches =  [course['courseCode'] + ' ' + \
                    course['courseName'] for course in self.courses.values()]
        keys = list(self.courses.keys())
        self.searchDict = {searches[i]: keys[i] for i in range(len(keys))}

    # Searches within courses by keyword
    def search(self, keyword):
        keyword = keyword.lower().split(' ')
        reSearch = ''
        for word in keyword:
            reSearch = reSearch + '(?=.*' + word + ')'
        return [self.searchDict[key] for key in self.searchDict.keys() if re.search(reSearch, key.lower())]
        