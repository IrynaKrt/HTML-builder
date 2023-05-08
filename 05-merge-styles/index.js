const { stdout, exit } = process;

const fs = require('fs/promises');
const path = require('path');

const readFolder = async(dir, file) => {
  try {
    const filePath = path.join(dir, file);
    const data = await fs.readFile(filePath, 'utf8');

    return data;
  } catch (error) {
    stdout.write('Error');
    exit();
  }
}

const readStyles = async(dir) => {
  try {
    await fs.writeFile(path.join(__dirname, '/project-dist', 'bundle.css'), '');

    const files = await fs.readdir(dir, {withFileTypes: true});

    for (const file of files)
      if (!file.isDirectory() && path.extname(file.name) === '.css') {
        const content = await readFolder(dir, file.name);
        await fs.appendFile(path.join(__dirname, '/project-dist', 'bundle.css'), content);
      }
  } catch (error) {
    stdout.write('there was an error:', error.message);
  }
}

const updateBundle = async() => {
  await fs.rm(path.join(__dirname, '/project-dist', 'bundle.css'));
  await readStyles(path.join(__dirname, 'styles'));
}

updateBundle();