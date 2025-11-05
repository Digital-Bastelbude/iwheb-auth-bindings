# iWheb Auth Client - JavaScript

Standalone JavaScript client for iWheb Authentication Service.

## Usage

```html
<script src="iwheb-auth.js"></script>
<script>
const client = new IWebAuthClient({
    baseUrl: 'https://api.example.com',
    apiKey: 'your-api-key'
});

// Complete login flow
const login = await client.login('user@example.com');
const validate = await client.validate(login.data.session_id, '123456');
const userInfo = await client.getUserInfo(validate.data.session_id);
</script>
```

## API Methods

- `login(email)` - Start login process
- `validate(sessionId, code)` - Validate 6-digit code  
- `checkSession(sessionId)` - Check if session is active
- `touchSession(sessionId)` - Refresh session (extend expiry)
- `createDelegatedSession(sessionId, targetApiKey)` - Create delegated session
- `getUserInfo(sessionId)` - Get user information from Webling
- `getUserToken(sessionId)` - Get encrypted user token
- `getUserId(sessionId)` - Get decrypted Webling user ID
- `logout(sessionId)` - End session
- `isSessionActive(sessionId)` - Helper to check if session is active (returns boolean)

## Files

- `iwheb-auth.js` - Production version (5.8 KB)
- `demo.html` - Interactive demo

## Build

```bash
./build.sh
```
