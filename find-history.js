const fs = require('fs');
const readline = require('readline');

async function searchTranscript() {
  const fileStream = fs.createReadStream('C:\\Users\\kaddo\\.gemini\\antigravity\\brain\\f73e778e-2b90-418f-9809-bc787465f5b0\\.system_generated\\logs\\transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let output = '';
  for await (const line of rl) {
    if (line.includes('hero-split.tsx') && line.includes('replace_file_content')) {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        output += JSON.stringify(obj.tool_calls, null, 2) + '\n\n';
      }
    }
  }

  fs.writeFileSync('C:\\Users\\kaddo\\Downloads\\artisanat-aschi-website\\hero-split-history.txt', output);
}

searchTranscript();
