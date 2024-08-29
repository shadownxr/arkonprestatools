#! /usr/bin/env node

const yargs = require("yargs");
const fs = require("fs");
const prompts = require("prompts");

const commandOptions = ['name', 'display_name', 'description'];

async function createModule(){
  const argv = yargs.command('create-module', 'Create a new module', (yargs) => {
    return yargs.options({
      'name': {
        alias: 'n',
        describe: 'The name of the module (use snake_case or camelCase)',
        type: 'string',
        demandOption: false,
        requiresArg: false,
      },
      'display_name': {
        alias: 'dn',
        describe: 'The display name of the module',
        type: 'string',
        demandOption: false,
        requiresArg: false,
      },
      'description': {
        alias: 'd',
        describe: 'A description of the module',
        type: 'string',
        demandOption: false,
        requiresArg: false,
      }
    })
  }).showHelpOnFail(true).demandCommand().strict().argv;

  const options = parseCommandOption(argv);

  let questions = {
    'name': {
      type: 'text',
      name: 'name',
      message: 'Enter the name of the module (use snake_case or camelCase)',
      initial: 'module_name',
      validate: name => name.match(/^[a-z]+(_[a-z]+)*$/i) ? true : 'Please enter a valid module name (use snake_case or camelCase)',
    },
    'display_name': {
      type: 'text',
      name: 'display_name',
      message: 'Enter a display name for the module',
      initial: 'Arkon Module',
      validate: display_name => display_name.length > 0 ? true : 'Please enter a display name',
    },
    'description': {
      type: 'text',
      name: 'description',
      message: 'Enter a description for the module',
      initial: 'This is an arkon module',
      validate: description => description.length > 0 ? true : 'Please enter a description',
    },
  };

  questions = removeFilledQuestions(questions, options);

  try {
    const promptOptions = await prompts(Object.values(questions), {
      onCancel: () => {
        throw new Error('✖' + ` Cancelled`)
      }
    });
    Object.assign(options, promptOptions);
  } catch (cancelled) {
    console.log(cancelled.message)
    process.exit(1)
  }

  let moduleName = options.name;
  let display_name = options.display_name;
  let description = options.description;

  console.log(`Creating module ${moduleName}\n`);

  moduleName = parseName(moduleName);
  createModuleFolder(moduleName);

  const binPath = __dirname + '/module/';
  const path = './' + moduleName + '/';
  writeFiles(path, binPath, moduleName, {"display_name": display_name, "description": description});
}

function parseCommandOption(argv){
  let options = {};
  commandOptions.forEach((option) => {
    if(argv[option]){
      options[option] = argv[option];
    }
  });

  return options;
}

function removeFilledQuestions(questions, options){
  Object.keys(options).forEach((option) => {
    delete questions[option];
  });

  return questions;
}

function parseName(moduleName){
    let match = moduleName.trim().match(/_[A-Za-z]/);
    if(!match){
      return moduleName;
    }

    moduleName = snakeToCamelCase(moduleName);
    return moduleName;
}

function snakeToCamelCase(snakeCase){
  return snakeCase.replace(/(_\w)/g, function(m){
    return m[1].toUpperCase();
  });
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

function createFolder(path){
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  } catch (err) {
    console.error(err);
  }
}

function writeFiles(path, binPath, moduleName, additionalOptions){
  fs.readdirSync(binPath).forEach((file) => {
    if(fs.lstatSync(binPath + file).isDirectory()){
      createFolder(path + file);
      writeFiles(path + file + '/', binPath + file + '/', moduleName, additionalOptions);
    } else {
      fs.readFile(binPath + file, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        data = data.replace(/{{ moduleName_lowercase }}/g, moduleName.toLowerCase());
        data = data.replace(/{{ moduleName_pascalcase }}/g, moduleName.charAt(0).toUpperCase() + moduleName.slice(1));
        data = data.replace(/{{ currentYear }}/g, new Date().getFullYear());
        data = data.replace(/{{ display_name }}/g, additionalOptions.display_name);
        data = data.replace(/{{ description }}/g, additionalOptions.description);

        fs.writeFile(path + file.replace(/\.p/, '.').replace(/module/, moduleName.toLowerCase()), data, { flag: 'a' }, (err) => {
          if (err) {
            console.error(err);
          }
          // console.log('File ' + file.replace(/\.p/, '.') + ' created');
        });
      });
    }
  });
}

createModule().then(() => {
  console.log(`Module created\n`);
  console.log('Remember to run "Composer install" and "NPM install" in the module folder!');
}).catch((e) => {
  console.error(e);
});