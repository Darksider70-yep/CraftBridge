#!/usr/bin/env python3
import json
import urllib.request

url = "http://localhost:8000/api/v1/auth/login"
data = {
    "email": "test@craftbridge.com",
    "password": "Test123456!"
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"Error Status: {e.code}")
    print(f"Error Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Exception: {type(e).__name__}: {str(e)}")
