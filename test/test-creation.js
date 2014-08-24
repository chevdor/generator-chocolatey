/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;

var testData = {
  githubUser         : 'chevdor',
  packageName        : 'my.test package#name',
  packageTitle       : 'Super Duper Package',
  packageVersion     : '0.1.0.0',
  packageType        : 'Custom',
      
  packageAuthors     : 'Chevdor',
  packageOwners      : 'Chevdor',
      
  packageSummary     : 'Some blabla',
  packageDescription : 'Some other blabla',
  readmeFormat       : '',
  packageProjectURL  : 'http://www.someurl.com',
  packageTags        : 'tag1, tag2',
      
  licenseRequired    : 'N',    
  packageLicenseURL  : 'http://license.org',  
  packageCopyright   : 'Some more blabla'
}

describe('chocolatey generator', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }

      this.app = helpers.createGenerator('chocolatey:app', [
        '../../app'
      ]);
      done();
    }.bind(this));
  });

  it('creates expected files', function (done) {
    var expected = [
      // add files you expect to exist here.
      testData.packageName+'.nuspec',
      'tools/chocolateyInstall.ps1',
      'tools/chocolateyUninstall.ps1'
    ];

    helpers.mockPrompt(this.app, {
      'githubUser'         : testData.githubUser,
      'packageName'        : testData.packageName,
      'packageTitle'       : testData.packageTitle,
      'packageVersion'     : testData.packageVersion,
      'packageType'        : testData.packageType,
      
      'packageAuthors'     : testData.packageAuthors,
      'packageOwners'      : testData.packageOwners,
      
      'packageSummary'     : testData.packageSummary,
      'packageDescription' : testData.packageDescription,
      'readmeFormat'       : testData.readmeFormat,
      'packageProjectURL'  : testData.packageProjectURL,
      'packageTags'        : testData.packageTags,
        
      'licenseRequired'    : testData.licenseRequired,  
      'packageLicenseURL'  : testData.packageLicenseURL,
      'packageCopyright'   : testData.packageCopyright
    });
    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
      helpers.assertFile(expected);
      done();
    });
  });
});
