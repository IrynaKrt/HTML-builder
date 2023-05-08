const { stdout, exit } = process;

const fs = require('fs');
const path = require('path');

fs.readdir(path.join(__dirname, 'secret-folder'), {withFileTypes: true}, (err, files) => {
    if (err) {
        stdout.write('Error');
        exit();
    }

    files.forEach(file => {
        if (file.isFile()) {
        fs.stat(path.join(__dirname, 'secret-folder', file.name), (err, stat) => {
            if (err) {
                stdout.write('Error');
                exit();
            }
            stdout.write(`${file.name.split('.')[0]} - ${path.extname(file.name).slice(1)} - ${(stat.size / 1024).toFixed(3)}kb `);
        })
        }
    })
})
