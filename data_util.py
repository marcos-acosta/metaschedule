import json
import urllib.request

# Save json data to file
def save_json(data, fname='data.txt'):
    with open(fname, 'w') as outfile:
        json.dump(data, outfile)


# Retrieve json data from file
def retrieve_local_data(fname='data.txt'):
    with open(fname) as json_file:
        data = json.load(json_file)
    return data


# Retrieve json data from url
def retrieve_remote_data(url='https://hyperschedule.herokuapp.com/api/v3/courses?school=hmc'):
    with urllib.request.urlopen(url) as json_file:
        data = json.loads(json_file.read().decode())
    return data