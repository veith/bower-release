var fs = require('fs');

const chalk = require('chalk');
var inquirer = require('inquirer');
var bowerfile = JSON.parse(fs.readFileSync('bower.json', 'utf8'));
var git = require("nodegit");

var version = bowerfile.version.split('.');
var user = process.env.USER;
var pwd = process.env.PWD;
var git = require('simple-git')( pwd );

console.log('\n\nHi ' + process.env.USER + ' Current version of ' + chalk.yellow(bowerfile.name) + ' is ' + chalk.yellow(bowerfile.version) );
git.tag(function(err, log) {
        console.log(log);
      });
var questions = [{
    type: 'list',
    name: 'change',
    message: 'Was für einen Release möchtest du publizieren?',
    choices: ['Patch', 'Feature', 'Breacking'],
    filter: function (val) {
      return val.toLowerCase();
    }
  }
]


inquirer.prompt(questions).then(function (answers) {
  console.log('\nOrder receipt:');
  console.log(JSON.stringify(answers, null, '  '));
});
