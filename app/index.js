'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

/* jshint -W106 */
var proxy = process.env.http_proxy || process.env.HTTP_PROXY || process.env.https_proxy ||
  process.env.HTTPS_PROXY || null;
/* jshint +W106 */
var githubOptions = {
  version: '3.0.0'
};

if (proxy) {
  var proxyUrl = url.parse(proxy);
  githubOptions.proxy = {
    host: proxyUrl.hostname,
    port: proxyUrl.port
  };
}
var GitHubApi = require('github');
var github = new GitHubApi(githubOptions);

// var githubUserInfo = function (name, cb) {
//   github.user.getFrom({
//     user: name
//   }, function (err, res) {
//     if (err) {
//       throw new Error(err.message +
//         '\n\nCannot fetch your github profile. Make sure you\'ve typed it correctly.');
//     }
//     cb(JSON.parse(JSON.stringify(res)));
//     this.log('Hy ' + name);
//   });
// };

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var exec = require('child_process').exec;
function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

var ChocolateyGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      //if (!this.options['skip-install']) {
      //  this.installDependencies();
      //}
    });
  },

  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the marvelous Chocolatey generator!'));

    this.log('I know I am kinda curios and asking a lot but I need those answers to help you out. Hang on!');

    var prompts = [
    {
      type: 'input',
      name: 'githubUser',
      message: 'Would you mind telling me your username on GitHub?',
      default: 'someuser'
    }
    ,{
      type: 'input',
      name: 'packageTitle',
      message: 'What is the title of your package?',
      default: this.appname
    }
    ,{
      type: 'input',
      name: 'packageName',
      message: 'What is the system name of your package?',
      default: function(answers){
        return answers['packageTitle'].replace(/ /g, '.');
      }
    }
    ,{
      type: 'input',
      name: 'packageAuthor',
      message: 'What is your name?',
      default: function(answers){
          return ''; //this.realname.capitalize();
      }
    }
    ,{
      type: 'input',
      name: 'packageOwner',
      message: 'What is the name of this package´s author?',
      default: function(answers){
        return answers['packageAuthor'].capitalize();
      }
    }
   ,{
      type: 'input',
      name: 'packageVersion',
      message: 'What is the version of the package?',
      default: '0.1.0.0',
      validate: function(input) {
        var done = this.async();
        if (input.search(/\d+\.\d+\.\d+\.\d+(\-.*)?/i)!=0) {
          done("You need to provide a version such as 1.2.3.4 or 1.2.3.4-pre");
          return;
        }
        // Pass the return value in the done callback
        done(true);
      }
    }
   ,{
      type: 'input',
      name: 'packageSummary',
      message: 'How would you summarize this package?',
    }
   ,{
      type: 'input',
      name: 'packageDescription',
      message: 'What is the description of the package?',
    }
   ,{
      type: 'input',
      name: 'packageProjectURL',
      message: 'What is the project URL of the package?',
    },
    {
      type: 'confirm',
      name: 'licenseRequired',
      message: 'Does the user need to accept a license to install this package?',
      default: false
    },
    {
      type: 'input',
      name: 'packageLicenseURL',
      message: 'What is the license URL of the package?',
    },
    {
      when: function (response) {
        return response.licenseRequired;
      },
      name: 'packageLicense',
      message: 'Ok, and what is this license saying?'
    }
   ,{
      type: 'input',
      name: 'packageTags',
      message: 'You may provide a few tags?',
      default: 'chocolatey'
    }
   ,{
      type: 'input',
      name: 'packageCopyright',
      message: 'Copyright blabla?',
      default: function(answers){
        return '(C)2014 - ' + answers['packageAuthors'];
      }
    }
    ];

  
    this.prompt(prompts, function (props) {
      this.packageName = props.packageName;
      this.packageTitle = props.packageTitle;

      this.packageVersion   = props.packageVersion;
      this.packageAuthor    = props.packageAuthor.capitalize();
      this.packageOwner   = props.packageOwner;
      this.packageSummary   = props.packageSummary;
      this.packageDescription   = props.packageDescription;
      this.packageCopyright   = props.packageCopyright;
      this.packageProjectURL    = props.packageProjectURL;
      this.packageTags    = props.packageTags;
      this.packageLicenseURL    = props.packageLicenseURL;

      this.licenseRequired = props.licenseRequired;      
    
    
      done();
    }.bind(this));

  },

  // userInfo: function () {
  //   var done = this.async();

  //   githubUserInfo(this.githubUser, function (res) {
  //     /*jshint camelcase:false */
  //     this.realname = res.name;
  //     this.email = res.email;
  //     this.githubUrl = res.html_url;
  //     done();
  //   }.bind(this));
  // },
  
  app: function () {
    this.mkdir('tools');
  },

  projectfiles: function () {
    //this.copy('editorconfig', '.editorconfig');
    //this.copy('jshintrc', '.jshintrc');
    this.nuspec = this.packageName + '.nuspec';
    this.template('_package.nuspec', this.nuspec);

    execute('echo That´s where we run cpack '  +this.nuspec, function(res){
      console.log('life is cool: ' + res);
    })
  }
});

module.exports = ChocolateyGenerator;
