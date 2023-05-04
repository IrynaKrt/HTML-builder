const fs = require('fs');

const stream = fs.createReadStream('./01-read-file/text.txt', 'utf-8');
stream.on('data', (item) => console.log(item));
stream.on('end', () => console.log('End!'));
stream.on('error', (error) => console.log('Error', error.message));