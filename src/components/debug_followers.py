import requests

BASE_URL = 'http://localhost:5000/api'

USERNAME = input('Enter username to debug: ').strip()

def print_json(label, resp):
    print(f'--- {label} ---')
    try:
        print(resp.json())
    except Exception as e:
        print('Error parsing response:', e)
        print(resp.text)

# Followers count
resp = requests.get(f'{BASE_URL}/followers/count/{USERNAME}')
print_json('Followers Count', resp)

# Following count
resp = requests.get(f'{BASE_URL}/following/count/{USERNAME}')
print_json('Following Count', resp)

# Followers list
resp = requests.get(f'{BASE_URL}/followers/{USERNAME}')
print_json('Followers List', resp)

# Following list
resp = requests.get(f'{BASE_URL}/following/{USERNAME}')
print_json('Following List', resp) 