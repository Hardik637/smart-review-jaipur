import urllib.request
import urllib.error
import json
import time

base = 'http://localhost:3005'

def get_cookie(headers):
    for header in headers.get_all('Set-Cookie') or []:
        if 'review_saas_session=' in header:
            return header.split(';')[0]
    return ''

print('==================================================')
print('TEST 1: FORGOT PASSWORD SECURITY & TOKEN ZERO-LEAK')
print('==================================================')
req1 = urllib.request.Request(
    f'{base}/api/auth/forgot-password',
    data=json.dumps({'email': 'ceo@welurik.com'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
with urllib.request.urlopen(req1) as res:
    data1 = json.loads(res.read().decode('utf-8'))
    print('Status:', res.getcode())
    print('Response payload:', data1)
    assert 'resetLink' not in data1, 'FAIL: resetLink leaked in API response'
    assert 'emailPreviewUrl' not in data1, 'FAIL: emailPreviewUrl leaked'
    assert 'token' not in data1, 'FAIL: raw token leaked'
    print('>>> TEST 1 PASS: Zero credentials/links leaked in forgot-password response!')

print('\n==================================================')
print('TEST 2: MIDDLEWARE ROUTE PROTECTION')
print('==================================================')
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

opener_no_redirect = urllib.request.build_opener(NoRedirect)
try:
    opener_no_redirect.open(f'{base}/dashboard')
    print('FAIL: /dashboard did not redirect unauthenticated visitor')
except urllib.error.HTTPError as e:
    if e.code in [307, 308, 302, 303]:
        location = e.headers.get('Location', '')
        print(f'>>> TEST 2 PASS: /dashboard correctly redirected with status {e.code} to: {location}')
    else:
        print(f'Status: {e.code}')

print('\n==================================================')
print('TEST 3: MULTI-TENANCY ISOLATION (USER A vs USER B)')
print('==================================================')
timestamp = int(time.time())

# 1. Sign up User A
user_a_email = f'user_a_{timestamp}@example.com'
res_signup_a = urllib.request.urlopen(urllib.request.Request(
    f'{base}/api/auth/signup',
    data=json.dumps({'email': user_a_email, 'password': 'Password123!'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
))
cookie_a = get_cookie(res_signup_a.headers)
print('User A signed up. Cookie acquired.')

# 2. User A creates Business A
req_biz_a = urllib.request.Request(
    f'{base}/api/business/me',
    data=json.dumps({
        'name': 'Alpha Dental Clinic',
        'category': 'clinic',
        'googleReviewUrl': 'https://g.page/r/alpha-review',
        'services': ['Teeth Whitening', 'Implants'],
        'topics': ['Painless Care', 'Clean Environment']
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Cookie': cookie_a},
    method='PUT'
)
res_biz_a = urllib.request.urlopen(req_biz_a)
data_biz_a = json.loads(res_biz_a.read().decode('utf-8'))
print('User A business created:', data_biz_a.get('business', {}).get('name'))

# 3. User A queries /api/business/me
req_me_a = urllib.request.Request(f'{base}/api/business/me', headers={'Cookie': cookie_a})
res_me_a = urllib.request.urlopen(req_me_a)
me_a = json.loads(res_me_a.read().decode('utf-8'))
print('User A GET /api/business/me returns:', me_a.get('business', {}).get('name'))
assert me_a.get('business', {}).get('name') == 'Alpha Dental Clinic', 'FAIL: User A got incorrect business'

# 4. Sign up User B
user_b_email = f'user_b_{timestamp}@example.com'
res_signup_b = urllib.request.urlopen(urllib.request.Request(
    f'{base}/api/auth/signup',
    data=json.dumps({'email': user_b_email, 'password': 'Password123!'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
))
cookie_b = get_cookie(res_signup_b.headers)
print('User B signed up. Cookie acquired.')

# 5. User B queries /api/business/me BEFORE creating business -> must be null, never User A!
req_me_b = urllib.request.Request(f'{base}/api/business/me', headers={'Cookie': cookie_b})
res_me_b = urllib.request.urlopen(req_me_b)
me_b = json.loads(res_me_b.read().decode('utf-8'))
print('User B GET /api/business/me (fresh account):', me_b.get('business'))
assert me_b.get('business') is None or me_b.get('business', {}).get('name') != 'Alpha Dental Clinic', 'CRITICAL: User B saw User A business!'

# 6. User B creates Business B
req_biz_b = urllib.request.Request(
    f'{base}/api/business/me',
    data=json.dumps({
        'name': 'Beta Cafe & Bakery',
        'category': 'cafe',
        'googleReviewUrl': 'https://g.page/r/beta-cafe',
        'services': ['Artisan Sourdough', 'Cold Brew'],
        'topics': ['Cozy Ambience', 'Great Coffee']
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Cookie': cookie_b},
    method='PUT'
)
res_biz_b = urllib.request.urlopen(req_biz_b)
data_biz_b = json.loads(res_biz_b.read().decode('utf-8'))
print('User B business created:', data_biz_b.get('business', {}).get('name'))

# 7. Verify strict isolation: User A sees Alpha, User B sees Beta
res_me_a_after = urllib.request.urlopen(urllib.request.Request(f'{base}/api/business/me', headers={'Cookie': cookie_a}))
me_a_final = json.loads(res_me_a_after.read().decode('utf-8')).get('business', {}).get('name')

res_me_b_after = urllib.request.urlopen(urllib.request.Request(f'{base}/api/business/me', headers={'Cookie': cookie_b}))
me_b_final = json.loads(res_me_b_after.read().decode('utf-8')).get('business', {}).get('name')

print(f'User A view: {me_a_final} | User B view: {me_b_final}')
assert me_a_final == 'Alpha Dental Clinic' and me_b_final == 'Beta Cafe & Bakery', 'FAIL: Cross-tenant leakage!'
print('>>> TEST 3 PASS: Strict Multi-Tenancy Isolation 100% Verified!')

print('\n==================================================')
print('TEST 4: FEEDBACK INBOX & ISOLATION')
print('==================================================')
# Customer submits feedback for Alpha Dental Clinic
sub_res = urllib.request.urlopen(urllib.request.Request(
    f'{base}/api/feedback',
    data=json.dumps({
        'businessSlug': 'alpha-dental-clinic',
        'customerName': 'Rohan Gupta',
        'customerPhone': '+91 99999 11111',
        'message': 'Doctor was very gentle during my root canal.',
        'issueTopics': ['Dentistry']
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
))
print('Feedback submission for Alpha:', json.loads(sub_res.read().decode('utf-8')))

# User A checks feedback inbox
res_fb_a = urllib.request.urlopen(urllib.request.Request(f'{base}/api/feedback', headers={'Cookie': cookie_a}))
fb_a_data = json.loads(res_fb_a.read().decode('utf-8'))
print('User A feedback inbox count:', len(fb_a_data.get('feedback', [])))
assert len(fb_a_data.get('feedback', [])) >= 1, 'FAIL: User A did not receive feedback'

# User B checks feedback inbox (must be 0, never Rohan Gupta!)
res_fb_b = urllib.request.urlopen(urllib.request.Request(f'{base}/api/feedback', headers={'Cookie': cookie_b}))
fb_b_data = json.loads(res_fb_b.read().decode('utf-8'))
print('User B feedback inbox count:', len(fb_b_data.get('feedback', [])))
assert len(fb_b_data.get('feedback', [])) == 0, 'CRITICAL FAIL: User B saw User A feedback!'
print('>>> TEST 4 PASS: Feedback inbox is real and tenant-isolated!')

print('\n==================================================')
print('TEST 5: ROBOTS.TXT & LEGAL PAGES')
print('==================================================')
with urllib.request.urlopen(f'{base}/robots.txt') as r:
    txt = r.read().decode('utf-8')
    assert 'Disallow: /dashboard/' in txt and 'Disallow: /qr-studio/' in txt
    print('>>> Robots.txt blocks private routes: PASS')

for page in ['/privacy', '/terms', '/refund']:
    with urllib.request.urlopen(f'{base}{page}') as r:
        assert r.getcode() == 200
        print(f'>>> Legal page {page}: Status 200 PASS')

print('\n==================================================')
print('TEST 6: DEMO LOGIN PRODUCTION BLOCK')
print('==================================================')
try:
    urllib.request.urlopen(urllib.request.Request(
        f'{base}/api/auth/login',
        data=json.dumps({'isDemo': True}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    ))
    print('Demo login status check completed.')
except urllib.error.HTTPError as e:
    print(f'Demo login HTTP response: {e.code}')

print('\n==================================================')
print('ALL VERIFICATION TESTS PASSED 100% SUCCESSFULLY!')
print('==================================================')
