'use strict';
var util = require('util'),
path     = require('path'),
yeoman   = require('yeoman-generator'),
yosay    = require('yosay'),
os       = require('os'),
chalk    = require('chalk');

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
var github    = new GitHubApi(githubOptions);

var githubUserInfo = function (name, cb) {
  github.user.getFrom({
    user: name
  }, function (err, res) {
    if (err) {
      //throw new Error(err.message +
      //  '\n\nCannot fetch your github profile. Make sure you\'ve typed it correctly.');
      cb(null);
    } else
      cb(JSON.parse(JSON.stringify(res)));
  });
};

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

  bePoliteAndExplain: function() {
    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the marvelous Chocolatey generator!'));

    this.log('I know I am kinda curious and asking a lot but I need those answers to help you out.');
    this.log('Hang on tight, it won´t be that hard :) The more you tell me, the more I can go ahead and prepare all for you.\n');
  },

  askForGithubAccount: function () {
    var done = this.async();

    var prompts = [
    {
      type: 'input',
      name: 'githubUser',
      message: 'Would you mind telling me your username on GitHub?',
      default: 'someuser'
    }];
    this.prompt(prompts, function (props) {
      this.githubUser         = props.githubUser;
      
      done();
    }.bind(this));
  },

  userInfo: function () {
    var done = this.async();

    githubUserInfo(this.githubUser, function (res) {
      /*jshint camelcase:false */
      //console.log(res);
      if(res){
        //console.log('Hey hi ' + res.name);
        this.realname = res.name;
        this.email = res.email;
        this.githubUrl = res.html_url;
      } else {
        this.realname = 'n/a';
        this.email = 'n/a';
        this.githubUrl = 'n/a';
      }
      done();
    }.bind(this));
  },
  
  askFor: function () {
    var done = this.async();
    var prompts = [{
      type: 'input',
      name: 'packageTitle',
      message: 'What is the title of your package?',
      default: this.appname
    },
    {
      type: 'list',
      choices: ['EXE','MSI','MSU', 'Custom'],
      name: 'packageType',
      message: 'What kind of package are you making?',
      default: 'Custom'
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
      name: 'packageAuthors',
      message: 'What is your name?',
      default: this.realname
    }
    ,{
      type: 'input',
      name: 'packageOwners',
      message: 'What is the name of this package´s author?',
      default: this.realname
    }
   ,{
      type: 'input',
      name: 'packageVersion',
      message: 'What is the version of the package?',
      default: '0.1.0.0',
      validate: function(input) {
        var done = this.async();
        if (input.search(/\d+\.\d+\.\d+(\.\d+)?(\-.*)?/i)!=0) {
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
      type: 'list',
      choices: ['Asciidoc','Markdown'],
      name: 'readmeFormat',
      message: 'What format do you prefer for the readme?',
      default: 'Asciidoc'
    },
    {
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
    }];

    this.prompt(prompts, function (props) {
      this.githubUser         = props.githubUser;
      this.packageName        = props.packageName;
      this.packageTitle       = props.packageTitle;
      this.packageVersion     = props.packageVersion;
      this.packageType        = props.packageType;
      
      this.packageAuthors     = props.packageAuthors;
      this.packageOwners      = props.packageOwners;
      
      this.packageSummary     = props.packageSummary;
      this.packageDescription = props.packageDescription;
      this.readmeFormat       = props.readmeFormat;
      this.packageProjectURL  = props.packageProjectURL;
      this.packageTags        = props.packageTags;
      
      this.licenseRequired    = props.licenseRequired;    
      this.packageLicenseURL  = props.packageLicenseURL;  
      this.packageCopyright   = props.packageCopyright;
      
      done();
    }.bind(this));

  },

  app: function () {
    this.mkdir('tools');
  },

  projectfiles: function () {
    this.nuspec = this.packageName + '.nuspec';
    this.template('_package.nuspec', this.nuspec);
    
    if (this.readmeFormat === 'Asciidoc')
      this.template('_README.adoc', 'README.adoc');
    
    if (this.readmeFormat === 'Markdown')
      this.template('_README.md', 'README.md');
    
    if (this.packageType === 'Custom')
      this.template('tools/_chocolateyInstallCustom.ps1', 'tools/chocolateyInstall.ps1');
    else
      this.template('tools/_chocolateyInstall.ps1', 'tools/chocolateyInstall.ps1');
    
    this.template('tools/_chocolateyUninstall.ps1', 'tools/chocolateyUninstall.ps1');
  },

  pack: function(){
    if(os.platform()==='win32'){
      execute('cpak', function(res){
        console.log('Running cpack: ' + res);
      })
    } else
      this.log('It looks like your platform is ' + os.platform()+ ' and cpack is only supported on win32.');
      this.log('Your files are ready but I cannot build your chocolatey package.');
    }
});

module.exports = ChocolateyGenerator;
