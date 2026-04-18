const fs = require('fs');
const content = fs.readFileSync('seed_unified.js', 'utf8');
const match = content.match(/hi:\s*\{\s*name:\s*'([^']+)'/);
if (match) {
   const corrupted = match[1];
   console.log("Corrupted length:", corrupted.length);
   // Print character codes
   for(let i = 0; i < corrupted.length; i++) {
       console.log(corrupted.charCodeAt(i).toString(16));
   }
   // Also check the hex of actual Buffer.from
   console.log("Buffer binary:", Buffer.from(corrupted, 'binary').toString('hex'));
   
   const decoded = Buffer.from(corrupted, 'binary').toString('utf8');
   console.log("Decoded length:", decoded.length);
   fs.writeFileSync('decoded_test.txt', decoded, 'utf8');
}
