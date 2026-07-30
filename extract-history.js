const fs = require('fs');
const readline = require('readline');

async function extractFiles() {
  const filePath = 'C:\\Users\\kaddo\\.gemini\\antigravity\\brain\\f73e778e-2b90-418f-9809-bc787465f5b0\\.system_generated\\logs\\transcript_full.jsonl';
  
  if (!fs.existsSync(filePath)) {
    console.log("Transcript not found at " + filePath);
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  // Track the latest content for each file
  const files = {
    'about-video.tsx': null,
    'hero-split.tsx': null,
    'hero-relooking.tsx': null,
    'video-reel.tsx': null,
    'home-teaser.tsx': null,
    'hero.tsx': null
  };

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      // Stop reading if we reach step 2120 (when frames started)
      if (obj.step_index && obj.step_index >= 2120) {
        break;
      }

      if (obj.tool_calls) {
        for (const call of obj.tool_calls) {
          if (call.name === 'write_to_file' || call.name === 'replace_file_content' || call.name === 'multi_replace_file_content') {
            for (const key of Object.keys(files)) {
              if (call.args && call.args.TargetFile && call.args.TargetFile.includes(key)) {
                // Just log the step index and tool name to see when it was modified
                console.log(`Step ${obj.step_index}: Modified ${key} using ${call.name}`);
                // Save the args to dump later
                files[key] = { step: obj.step_index, tool: call.name, args: call.args };
              }
            }
          }
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  console.log("\n--- LATEST MODIFICATIONS BEFORE STEP 2120 ---");
  for (const [key, data] of Object.entries(files)) {
    if (data) {
      console.log(`${key}: Last modified at step ${data.step} using ${data.tool}`);
      // write the payload out to a file
      fs.writeFileSync(`C:\\Users\\kaddo\\Downloads\\artisanat-aschi-website\\restore-${key}.json`, JSON.stringify(data.args, null, 2));
    } else {
      console.log(`${key}: NOT modified before step 2120!`);
    }
  }
}

extractFiles();
