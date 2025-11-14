#!/bin/bash

echo "🚀 Building iWheb Auth Client..."

rm -f iwheb-auth.js

echo "📦 Building standalone version..."

cat > iwheb-auth.js << 'HEADER'
/**
 * iWheb Auth Client - Standalone Version
 * All-in-one JavaScript client for iWheb Authentication Service
 * 
 * Usage:
 *   const client = new IWebAuthClient({
 *     baseUrl: 'https://api.example.com',
 *     apiKey: 'your-api-key',
 *     useSSL: true  // optional, default: true
 *   });
 */

HEADER

echo "// === HTTP Client and Utilities ===" >> iwheb-auth.js
cat src/http-client.js >> iwheb-auth.js
echo "" >> iwheb-auth.js
echo "// === Main Auth Client ===" >> iwheb-auth.js
cat src/client.js >> iwheb-auth.js

NORMAL_SIZE=$(wc -c < iwheb-auth.js)

echo "✅ Build completed successfully!"
echo ""
echo "📊 Build Results:"
echo "   📄 iwheb-auth.js:     ${NORMAL_SIZE} bytes"
echo ""
echo "🎯 Files ready for deployment:"
echo "   • Copy iwheb-auth.js to your webspace"
echo "   • Use demo.html to test the implementation"
