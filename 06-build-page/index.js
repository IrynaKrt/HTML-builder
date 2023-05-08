const { stdout, exit } = process;

const fs = require('fs');
const fsPromise = require('fs/promises');
const path = require('path');

// HTML

const getData = async(name) => {
  try {
    const data = await fsPromises.readFile(path.join(__dirname, '/components', name), { encoding: 'utf8' });

    return data;
  } catch (error) {
    stdout.write('Error');
    exit();
  }
}

const replaceData = async(elementsArr) => {
  let read = fs.createReadStream(path.resolve(__dirname, 'template.html'), 'utf-8');

  function streamToString (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }

  let content = await streamToString(read);

  for (const element of elementsArr) {
    if (content.includes(`{{${element}}}`)) {
      let elementItem = await getData(`${element}.html`);

      content = await content.replaceAll(`{{${element}}}`, elementItem);
    }
  }

  read.close();
  return content;
}

const readFiles = async(dir) => {
  try {
    const arrayOfFiles = [];
    const files = await fsPromises.readdir(dir, {withFileTypes: true});
    for (const file of files)
      if (!file.isDirectory() && path.extname(file.name) === '.html') {
        let name = path.parse(file.name).name;
        arrayOfFiles.push(name);
      }
    return arrayOfFiles;
  } catch (error) {
    stdout.write('Error');
    exit();
  }
}

const createHTML = async() => {
  let elements = [];
  elements = await readFiles(path.join(__dirname, 'components'));

  const createdHTML = await replaceData(elements);
  await fsPromise.writeFile(path.join(__dirname, '/project-dist', 'index.html'), createdHTML);
}

// CSS

const readCssContent = async(dir, file) => {
  try {
    const filePath = path.join(dir, file);
    const data = await fsPromises.readFile(filePath, { encoding: 'utf8' });
    return data;
  } catch (err) {
    console.log(err);
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

const createCss = async() => {
  await fsPromise.rm(path.join(__dirname, '/project-dist', 'style.css'), { recursive: true, force: true });
  await readStyles(path.join(__dirname, 'styles'));
}

// Assets

const copyDir = async (src,dest) => {
    const copy = await fs.readdir(src, {withFileTypes: true});

    await fs.mkdir(dest, {recursive: true});

    for(let item of copy) {
      const init = path.join(src, item.name);
      const output = path.join(dest, item.name);

      if(item.isDirectory()) {
        await copyDir(init, output);
      } else {
        await fs.copyFile(init, output);
      }
    }
  }

const makeAssets = async() => {
  await fsPromise.rm(path.join(__dirname,'/project-dist', 'assets'), { recursive: true, force: true });
  await copyDir(path.join(__dirname, 'assets'), path.join(__dirname, '/project-dist', 'assets'));
}

// Full

const makeBundle = async() => {
  await makeAssets();
  await createHTML();
  await createCss();
}

makeBundle();