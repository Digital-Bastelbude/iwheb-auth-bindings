#!/bin/bash

echo "🚀 Building iWheb Auth Client..."

# Clean up old builds
rm -f iwheb-auth.js iwheb-auth.min.js

echo "📦 Building standalone version..."

# Build the standalone version by concatenating source files
cat > iwheb-auth.js << 'EOF'
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

EOF

# Add the actual source files content
echo "// === HTTP Client and Utilities ===" >> iwheb-auth.js
cat src/http-client.js >> iwheb-auth.js
echo "" >> iwheb-auth.js
echo "// === Main Auth Client ===" >> iwheb-auth.js
cat src/client.js >> iwheb-auth.js

echo "🗜️  Building minified version..."

# Create a proper minified version
python3 << 'EOF'
import re

def minify_js(content):
    # Remove multi-line comments /* ... */
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Remove single-line comments // but preserve URLs
    lines = content.split('\n')
    result_lines = []
    
    for line in lines:
        # Skip lines that are only comments
        if re.match(r'^\s*//.*$', line):
            continue
            
        # Remove end-of-line comments but preserve URLs
        if '//' in line:
            # Check if // is part of a URL
            if 'http://' in line or 'https://' in line:
                result_lines.append(line)
            else:
                # Find // that's not inside a string
                in_string = False
                quote_char = None
                comment_pos = len(line)
                
                i = 0
                while i < len(line):
                    char = line[i]
                    if char in ['"', "'", '`']:
                        if not in_string:
                            in_string = True
                            quote_char = char
                        elif char == quote_char:
                            # Check if it's escaped
                            if i == 0 or line[i-1] != '\\':
                                in_string = False
                                quote_char = None
                    elif char == '/' and i < len(line) - 1 and line[i+1] == '/' and not in_string:
                        comment_pos = i
                        break
                    i += 1
                
                result_lines.append(line[:comment_pos].rstrip())
        else:
            result_lines.append(line)
    
    content = '\n'.join(result_lines)
    
    # Remove empty lines
    content = re.sub(r'^\s*\n', '', content, flags=re.MULTILINE)
    
    # Remove leading and trailing spaces from each line
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    
    # Join everything into one line with minimal spaces
    content = ' '.join(lines)
    
    # Clean up spaces around operators and brackets
    content = re.sub(r'\s*{\s*', '{', content)
    content = re.sub(r'\s*}\s*', '}', content)
    content = re.sub(r'\s*\(\s*', '(', content)
    content = re.sub(r'\s*\)\s*', ')', content)
    content = re.sub(r'\s*;\s*', ';', content)
    content = re.sub(r'\s*,\s*', ',', content)
    content = re.sub(r'\s*=\s*', '=', content)
    content = re.sub(r'\s*\[\s*', '[', content)
    content = re.sub(r'\s*\]\s*', ']', content)
    content = re.sub(r'\s*:\s*', ':', content)
    content = re.sub(r'\s*\.\s*', '.', content)
    
    # Fix specific patterns that might break
    content = re.sub(r'}\s*else\s*{', '}else{', content)
    content = re.sub(r'}\s*catch\s*\(', '}catch(', content)
    content = re.sub(r'}\s*finally\s*{', '}finally{', content)
    
    # Ensure spaces around keywords where needed
    content = re.sub(r'([a-zA-Z0-9_$])class([A-Z])', r'\1 class \2', content)
    content = re.sub(r'([a-zA-Z0-9_$])function([a-zA-Z0-9_$])', r'\1 function \2', content)
    content = re.sub(r'([a-zA-Z0-9_$])return([a-zA-Z0-9_$])', r'\1 return \2', content)
    content = re.sub(r'([a-zA-Z0-9_$])async([a-zA-Z0-9_$])', r'\1 async \2', content)
    content = re.sub(r'([a-zA-Z0-9_$])await([a-zA-Z0-9_$])', r'\1 await \2', content)
    content = re.sub(r'([a-zA-Z0-9_$])if\(', r'\1 if(', content)
    content = re.sub(r'([a-zA-Z0-9_$])else([a-zA-Z0-9_$])', r'\1 else \2', content)
    content = re.sub(r'([a-zA-Z0-9_$])try\{', r'\1 try{', content)
    content = re.sub(r'([a-zA-Z0-9_$])catch\(', r'\1 catch(', content)
    content = re.sub(r'([a-zA-Z0-9_$])throw([a-zA-Z0-9_$])', r'\1 throw \2', content)
    content = re.sub(r'([a-zA-Z0-9_$])new([A-Z])', r'\1 new \2', content)
    content = re.sub(r'([a-zA-Z0-9_$])const([a-zA-Z0-9_$])', r'\1 const \2', content)
    content = re.sub(r'([a-zA-Z0-9_$])let([a-zA-Z0-9_$])', r'\1 let \2', content)
    content = re.sub(r'([a-zA-Z0-9_$])var([a-zA-Z0-9_$])', r'\1 var \2', content)
    
    return content.strip()

# Read the standalone version
with open('iwheb-auth.js', 'r') as f:
    content = f.read()

# Minify
minified = minify_js(content)

# Write minified version
with open('iwheb-auth.min.js', 'w') as f:
    f.write(minified)

print("Minification completed successfully")
EOF

# Get file sizes
NORMAL_SIZE=$(wc -c < iwheb-auth.js)
MINIFIED_SIZE=$(wc -c < iwheb-auth.min.js)

# Calculate compression ratio
COMPRESSION=$(echo "scale=1; (1 - $MINIFIED_SIZE / $NORMAL_SIZE) * 100" | bc -l 2>/dev/null || echo "N/A")

echo "✅ Build completed successfully!"
echo ""
echo "📊 Build Results:"
echo "   📄 iwheb-auth.js:     ${NORMAL_SIZE} bytes"
echo "   🗜️  iwheb-auth.min.js: ${MINIFIED_SIZE} bytes"
if [ "$COMPRESSION" != "N/A" ]; then
    echo "   📉 Compression:       ${COMPRESSION}%"
fi
echo ""
echo "🎯 Files ready for deployment:"
echo "   • Copy iwheb-auth.min.js to your webspace"
echo "   • Use demo.html to test the implementation"