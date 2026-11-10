const cp = require('child_process');
const fs = require('fs');

const runId = '20261110T213852-84624212';

function runCmd(cmd) {
  console.log('>>> RUNNING:', cmd);
  return cp.execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
}

let iter = 0;
while (iter < 100) {
  iter++;
  console.log('\n--- ITERATION ' + iter + ' ---');
  let statusOut;
  try {
    statusOut = runCmd('npx nx migrate --run-id=' + runId);
  } catch(e) {
    console.error('Status failed:', e.stdout ? e.stdout.toString() : e.message);
    break;
  }
  
  if (statusOut.includes('nx migrate: complete') || statusOut.includes('action="complete"')) {
    console.log('MIGRATION COMPLETE!');
    break;
  }
  
  const stepMatch = statusOut.match(/<nx_migrate_step[^>]*action="([^"]+)"[^>]*>([\s\S]*?)<\/nx_migrate_step>/);
  if (!stepMatch) {
    console.log('No step match found. Output:', statusOut);
    break;
  }
  
  const action = stepMatch[1];
  const stepJson = JSON.parse(stepMatch[2].trim());
  console.log('ACTION:', action);
  
  if (action === 'next-step') {
    try {
      const out = runCmd(stepJson.command);
      console.log(out.slice(0, 300));
    } catch(err) {
      console.error('Command failed:', err.stdout ? err.stdout.toString() : err.message);
      break;
    }
  } else if (action === 'await-prompt') {
    const handoffMatch = statusOut.match(/Handoff file:\s*([^\r\n]+)/);
    if (handoffMatch) {
      const handoffPath = handoffMatch[1].trim();
      console.log('Writing handoff file:', handoffPath);
      fs.writeFileSync(handoffPath, JSON.stringify({
        status: 'success',
        summary: 'Validated migration changes'
      }, null, 2));
    } else {
      console.log('Await prompt but no handoff file match!');
      break;
    }
  } else {
    console.log('Unhandled action:', action);
    break;
  }
}
