const fs = require('fs/promises');
const path = require('path');

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

const updateDir = async () => {
  await fs.rm(path.resolve(__dirname, 'files-copy'), { recursive: true, force: true });
  await copyDir(path.resolve(__dirname, 'files'), path.resolve(__dirname, 'files-copy'));
}

updateDir();