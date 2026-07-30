const fs = require('fs');
const readline = require('readline');

async function extractViewFile() {
  const filePath = 'C:\\Users\\kaddo\\.gemini\\antigravity\\brain\\f73e778e-2b90-418f-9809-bc787465f5b0\\.system_generated\\logs\\transcript_full.jsonl';
  
  if (!fs.existsSync(filePath)) {
    console.log("Transcript not found");
    return;
  }

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const filesToFind = ['hero-split.tsx', 'hero-relooking.tsx', 'video-reel.tsx'];
  
  // Track all view_file outputs per file
  const fileOutputs = {
    'hero-split.tsx': [],
    'hero-relooking.tsx': [],
    'video-reel.tsx': []
  };

  let pendingToolCallId = null;
  let currentFileBeingViewed = null;

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      
      if (obj.step_index && obj.step_index >= 2120) {
        break;
      }

      if (obj.tool_calls) {
        for (const call of obj.tool_calls) {
          if (call.name === 'view_file' && call.args && call.args.AbsolutePath) {
            for (const file of filesToFind) {
              if (call.args.AbsolutePath.includes(file)) {
                // Not perfectly matching tool call id in this log format, but we assume the very next PLANNER_RESPONSE or SYSTEM response has it
                // Actually in this log format, responses are often separate steps with source='SYSTEM' or 'TOOL'
                currentFileBeingViewed = file;
              }
            }
          }
        }
      }

      if (obj.type === 'TOOL_RESPONSE' && currentFileBeingViewed) {
         if (obj.content && obj.content.includes('File Path:')) {
           fileOutputs[currentFileBeingViewed].push({ step: obj.step_index, content: obj.content });
           currentFileBeingViewed = null; // reset
         }
      }

      // Sometimes tool responses are just in the text directly.
      if (obj.content && obj.content.includes('File Path: `file:///c:/Users/kaddo/Downloads/artisanat-aschi-website/components/site/hero-split.tsx`')) {
         fileOutputs['hero-split.tsx'].push({ step: obj.step_index, content: obj.content });
      }
      if (obj.content && obj.content.includes('File Path: `file:///c:/Users/kaddo/Downloads/artisanat-aschi-website/components/site/hero-relooking.tsx`')) {
         fileOutputs['hero-relooking.tsx'].push({ step: obj.step_index, content: obj.content });
      }
      if (obj.content && obj.content.includes('File Path: `file:///c:/Users/kaddo/Downloads/artisanat-aschi-website/components/site/video-reel.tsx`')) {
         fileOutputs['video-reel.tsx'].push({ step: obj.step_index, content: obj.content });
      }

    } catch (e) {
      // Ignore
    }
  }

  for (const file of filesToFind) {
    const outputs = fileOutputs[file];
    if (outputs.length > 0) {
      // Dump the last one
      const lastOutput = outputs[outputs.length - 1];
      fs.writeFileSync(`C:\\Users\\kaddo\\Downloads\\artisanat-aschi-website\\view-${file}.txt`, lastOutput.content);
      console.log(`Extracted view_file output for ${file} from step ${lastOutput.step}`);
    } else {
      console.log(`No view_file output found for ${file}`);
    }
  }
}

extractViewFile();
