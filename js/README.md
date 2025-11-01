# iWheb Auth Client - JavaScript

Standalone JavaScript client for iWheb Authentication Service.

## Usage

```html
<script src="iwheb-auth.min.js"></script>
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
- `getUserInfo(sessionId)` - Get user information
- `logout(sessionId)` - End session

## Files

- `iwheb-auth.min.js` - Production version (5.8 KB)
- `demo.html` - Interactive demo

## Build

```bash
./build.sh
```
