import { spawn, exec } from 'child_process';

console.log("\n--- [1/2] Starting React Frontend ---\n");

// Pass as single string with shell: true to fix DeprecationWarning, and stop Vite from clearing screen repeatedly
const vite = spawn('npx vite --clearScreen false', { stdio: 'inherit', shell: true });

setTimeout(() => {
  console.log("\n--- [2/2] Starting Python Backend ---\n");
  
  const django = spawn('py manage.py runserver', { 
    cwd: '..', 
    shell: true,
    env: { ...process.env, PYTHONUNBUFFERED: "1" }
  });

  let browserOpened = false;

  const handleDjangoOutput = (data) => {
    const output = data.toString();
    // We print Django's output to the terminal so you can see it
    process.stdout.write(output);
    
    // When Python officially logs that the server has started, open the browser
    if (output.includes('http://127.0.0.1:8000') && !browserOpened) {
        browserOpened = true;
        console.log("\n✅ Django is ready! Opening URL in your Browser...\n");
        exec('start http://127.0.0.1:8000/');
    }
  };

  django.stdout.on('data', handleDjangoOutput);
  django.stderr.on('data', handleDjangoOutput);

  django.on('close', (code) => {
    console.log(`\nDjango server closed with code ${code}`);
    process.exit(code || 0);
  });

}, 2000); 

// Properly close both servers when you press CTRL + C
process.on('SIGINT', () => {
    vite.kill('SIGINT');
    process.exit();
});
