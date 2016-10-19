const execFile = require('child_process').execFile;

const child = execFile('node',['./node_modules/electron/cli.js', "."], (error, stdout, stderr)=> {
        if(error){
            throw error;
        }
        console.log(stdout);
});
