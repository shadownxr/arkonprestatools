#! /usr/bin/env node

const yargs = require("yargs");
const fs = require("fs");

const argv = yargs.command('create-module', 'Create a new module', (yargs) => {
    return yargs.option('name', {
        alias: 'n',
        describe: 'The name of the module',
        type: 'string',
        demandOption: true,
        requiresArg: true
    })
}).argv;

createModule();

function createModule(){
  const moduleName = argv.name;

  console.log(`Creating module ${moduleName}`);

  createModuleFolder(moduleName);
  writeModuleFile(moduleName);
  writeIndexFile(moduleName);
  writeComposerFile(moduleName);
}

function createModuleFolder(moduleName){
  try {
    if (!fs.existsSync(moduleName.toLowerCase())) {
      fs.mkdirSync(moduleName.toLowerCase());
    }
  } catch (err) {
    console.error(err);
  }
}

function writeModuleFile(moduleName){
  fs.readFile('./bin/module.pphp', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    data = data.replace(/{{ moduleName_lowercase }}/g, moduleName);
    data = data.replace(/{{ moduleName_pascalcase }}/g, moduleName);
    data = data.replace(/{{ currentYear }}/g, new Date().getFullYear());

    fs.writeFile(__dirname + '/' + moduleName + '/' + moduleName + '.php', data, { flag: 'a' }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Module file created');
    });
  });
}

function writeIndexFile(moduleName){
  fs.readFile('./bin/index.pphp', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    data = data.replace(/{{ currentYear }}/g, new Date().getFullYear());

    fs.writeFile(__dirname + '/' + moduleName + '/' + 'index.php', data, { flag: 'a' }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Index file created');
    });
  });
}

function writeComposerFile(moduleName){
  fs.readFile('./bin/composer.pjson', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    data = data.replace(/{{ moduleName_pascalcase }}/g, moduleName);

    fs.writeFile(__dirname + '/' + moduleName + '/' + 'composer.json', data, { flag: 'a' }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Index file created');
    });
  });
}