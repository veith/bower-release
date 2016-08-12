var fs = require('fs');

const chalk = require('chalk');
var inquirer = require('inquirer');
var bowerfile = JSON.parse(fs.readFileSync('bower.json', 'utf8'));

const version = bowerfile.version.split('.').map((e) => parseInt(e))
const user = process.env.USER;
const pwd = process.env.PWD;
const git = require('simple-git')(pwd);

console.log('\n\nHi ' + process.env.USER + ' Current version of ' + chalk.yellow.bold(bowerfile.name) + ' is ' + chalk.yellow(bowerfile.version));

const questions = [
  {
    type: 'confirm',
    name: 'tests',
    message: 'Sind alle tests durchgelaufen?',
    default: false
  },
  {
    type: 'list',
    name: 'type',
    message: 'Was für einen Release möchtest du publizieren?',
    choices: ['Patch', 'Feature', 'Breacking'],
    filter: function (val) {
      return val.toLowerCase();
    }
  }
];


inquirer.prompt(questions).then(function (answers) {

  if (answers.tests) {
    var newVersion = calculateNewVersionNumber(answers.type, version);
    bowerfile.version = newVersion;

    fs.writeFile('bower.json', JSON.stringify(bowerfile), function functionName() {
      git.add(['./bower.json'], function (i) {
        git.commit('bower-release: Version ' + newVersion + ' released', function (i) {
          addTag(newVersion)
        });
      });


    });

    console.log(chalk.yellow(newVersion));

  } else {
    console.log(chalk.red('Wenn die Tests nicht durchlaufen macht es keinen Sinn eine neue Version zu releasen.'));
    process.exit(1);
  }


});


function addTag(version, handler) {
  git.addTag('v' + version, (e) => {
    git.pushTags('origin');
  }, handler);
}

function calculateNewVersionNumber(type, currentversion) {
  var types = ['breacking', 'feature', 'patch']
  currentversion[types.indexOf(type)]++;
  return currentversion.fill(0, types.indexOf(type) + 1).join('.');

}
