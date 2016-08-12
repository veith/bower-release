var fs = require('fs');

const chalk = require('chalk');
var inquirer = require('inquirer');
if (!fs.existsSync('bower.json')) {
  console.log(chalk.red('bower.json existiert nicht. \n Bist du wirklich in einem Bower Projekt?'));
  process.exit(2);
}
var version;
var bowerfile = JSON.parse(fs.readFileSync('bower.json', 'utf8'));
const exec = require('child_process').exec;
if(bowerfile.version){
    version = bowerfile.version.split('.').map((e) => parseInt(e));
}else{
  console.log(chalk.red('bower.json does not have version information'));
    version = [0,0,0];
}


const user = process.env.USER;
const pwd = process.env.PWD;
const git = require('simple-git')(pwd);
const remote = 'origin';
const branch = 'master';

var runLint = true;
var runTest = true;
var skipQuestions = false;
var typeOfChange = 'patch';

const questions = [

  {
    type: 'list',
    name: 'type',
    message: 'What kind of release do you want to publish?',
    choices: ['Patch', 'Feature', 'Breaking'],
    filter: function (val) {
      return val.toLowerCase();
    }
  },
  {
    type: 'confirm',
    name: 'confirm',
    message: 'Confirm your decision. Are you sure?',
    default: false
  }
];

process.argv.forEach(function (val, index, array) {

  if (val == '--skip-test') {
    runTest = false;
  }
  if (val == '--skip-lint') {
    runLint = false;
  }

  if (val == 'breaking') {
    skipQuestions = true;
    typeOfChange = 'breaking';
  }
  if (val == 'feature') {
    skipQuestions = true;
    typeOfChange = 'feature';
  }
  if (val == 'patch') {
    skipQuestions = true;
    typeOfChange = 'patch';
  }

  if (val == '--help' || val == '-h') {
    console.log(chalk.red.bold('bower-release HELP'));
    console.log('\nIf your bower.json contains a scripts section, bower-release will execute the lint and test script');
    console.log('"scripts": {' +
        '\n        "lint": "polymer lint --input *.html demo/*.html",' +
        '\n        "test": "polymer test"' +
        '\n},...');
    console.log(chalk.red.bold('Usage and Options:'));

    console.log(chalk.bold('patch|feature|breaking') + '     release without questions');
    console.log(chalk.bold('--skip-test') + '    Skip unit tests');
    console.log(chalk.bold('--skip-lint') + '    Skip linting');
    console.log(chalk.bold('--help -h') + '      Helpful informations');
    process.exit(0);
  }
});


console.log('\n\nHi ' + process.env.USER + ' Current version of ' + chalk.yellow.bold(bowerfile.name) + ' is ' + chalk.yellow(bowerfile.version));

doLint();

function doLint() {
  if (runLint && bowerfile.scripts && bowerfile.scripts.lint) {
    console.log('Start linting process... ');

    exec(bowerfile.scripts.lint, (error, stdout, stderr) => {
      if (error) {
        console.log(`stdout: ${stdout}`);
        process.exit(3);
        return;
      }
      console.log(chalk.green('✓') + ' Linting successful');
      doTests();
    });
  } else {
    if (!runLint) {
      console.log(chalk.red('You decided to skip linting  :-('));
    } else {
      console.log('no lint script defined');
    }


    doTests();
  }
}

function doTests() {
  if (runTest && bowerfile.scripts && bowerfile.scripts.lint) {
    console.log('run tests... ');
    exec(bowerfile.scripts.lint, (error, stdout, stderr) => {
      if (error) {
        console.log(`stdout: ${stdout}`);
        process.exit(3);
        return;
      }
      console.log(chalk.green('✓') + ' Tests successful');
      askQuestions();
    });
  } else {
    if (!runTest) {
      console.log(chalk.red('You decided to skip the tests  :-('));
    } else {
      console.log('no test script defined');
    }
    askQuestions();
  }
}


function askQuestions() {

  if(!skipQuestions){
    inquirer.prompt(questions).then(function (answers) {
      if (answers.confirm) {
        writeData(answers.type);
      } else {
        console.log(chalk.red('release aborted by user, nothing changed'));
        process.exit(1);
      }
    });
  }else{
    writeData(typeOfChange);
  }

}


function writeData(typeOfChange) {
  var newVersion = calculateNewVersionNumber(typeOfChange, version);
  bowerfile.version = newVersion;

  fs.writeFile('bower.json', JSON.stringify(bowerfile), function functionName() {
    git.add(['./bower.json'], function (i) {
      git.commit('bower-release: Version ' + newVersion + ' released', function (i) {
        addTag(newVersion);
      });
    });
  });

  console.log('processing..., please wait a second.');
}



function addTag(version, handler) {
  git.addTag('v' + version, (e) => {
    git.push(remote, branch, function () {
      git.pushTags(remote, function () {
        console.log(chalk.yellow(version) + ' successfull released to origin');
      });
    });
  }, handler);
}

function calculateNewVersionNumber(type, currentversion) {
  const types = ['breaking', 'feature', 'patch'];
  currentversion[types.indexOf(type)]++;
  return currentversion.fill(0, types.indexOf(type) + 1).join('.');

}
