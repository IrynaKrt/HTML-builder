const { stdin, stdout } = process;

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const output = fs.createWriteStream(path.join(__dirname, 'text.txt'));
const interface = readline.createInterface({
    input: stdin,
    output: stdout
    });

const exitItem = 'exit';

stdout.write('What will you tell me today? ≧▽≦ \n');

interface.on('line', data => {
    const message = data.toString();
    if(message.toLowerCase().includes(exitItem)) {
        console.log('Buy ´･ᴗ･`');
        interface.close();
    } else {
        output.write(`${message}\n`);
    }
});

interface.on('SIGINT', () => {
    console.log('Buy ´･ᴗ･`');
    interface.close();
});

stdin.on('error', error => console.log('Error', error.message));