const { stdout, exit } = process;

const fs = require('fs');
const promise = require('fs/promises');
const path = require('path');

const getData = async(name) => {
  try {
    const data = await promise.readFile(path.join(__dirname, '/components', name), { encoding: 'utf8' });
    return data;
  } catch (error) {
    stdout.write('Error');
    exit();
  }
}

const replaceItems = async(elem) => {
  let read = fs.createReadStream(path.resolve(__dirname, 'template.html'), 'utf-8');

  function streamToString (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (error) => reject(error));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }

  let content = await streamToString(read);

  for (const element of elem) {
    if (content.includes(`{{${element}}}`)) {
      let elementData = await getData(`${element}.html`);
      content = await content.replaceAll(`{{${element}}}`, elementData);
    }
  }

  read.close();
  return content;
}

const readAllFiles = async(dir) => {
  try {
    const arr = [];
    const files = await promise.readdir(dir, {withFileTypes: true});
    for (const file of files)
      if (!file.isDirectory() && path.extname(file.name) === '.html') {
        let name = path.parse(file.name).name;
        arr.push(name);
      }
    return arr;
  } catch (error) {
    stdout.write('Error');
    exit();
  }
}

const createHTML = async() => {
  let arr = [];
  arr = await readAllFiles(path.join(__dirname, 'components'));

  const html = await replaceItems(arr);
  await promise.writeFile(path.join(__dirname, '/project-dist', 'index.html'), html);
}


const readCSSFolder = async(dir, file) => {
  try {
    const pathOfItem = path.join(dir, file);
    const data = await promise.readFile(pathOfItem, { encoding: 'utf8' });

    return data;
  } catch (error) {
    stdout.write('Error');
    exit();
  }
}

const readStyles = async(dir) => {
  try {
    await promise.writeFile(path.join(__dirname, '/project-dist', 'style.css'), '');

    const styles = await promise.readdir(dir, {withFileTypes: true});

    for (const file of styles)
      if (!file.isDirectory() && path.extname(file.name) === '.css') {
        const content = await readCSSFolder(dir, file.name);

        await promise.appendFile(path.join(__dirname, '/project-dist', 'style.css'), content);
      }
  } catch (error) {
    stdout.write('Error');
    exit();
  }
}

const createCSS = async() => {
  await promise.rm(path.join(__dirname, '/project-dist', 'style.css'), { recursive: true, force: true });
  await readStyles(path.join(__dirname, 'styles'));
}

// Assets

const copyDir = async(src, dist) => {
  const entries = await promise.readdir(src, {withFileTypes: true});
  await promise.mkdir(dist, {recursive: true});

  for(let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const distPath = path.join(dist, entry.name);
    if(entry.isDirectory()) {
      await copyDir(srcPath, distPath);
    } else {
      await promise.copyFile(srcPath, distPath);
    }
  }
}

const createAssets = async() => {
  await promise.rm(path.join(__dirname,'/project-dist', 'assets'), { recursive: true, force: true });
  await copyDir(path.join(__dirname, 'assets'), path.join(__dirname, '/project-dist', 'assets'));
}

// Full

const bundle = async() => {
  try {
    await createAssets();
    await createHTML();
    await createCSS();
    stdout.write('Done!');
  } catch (error) {
    stdout.write('Error');
    exit();
  }
}

bundle();