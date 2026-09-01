import urllib.request
try:
    with urllib.request.urlopen('http://localhost:8081/api/public/categories') as resp:
        print("Backend is RUNNING!", resp.read().decode('utf-8')[:200])
except Exception as e:
    print("Backend check:", e)
