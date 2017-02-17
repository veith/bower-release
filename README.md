# bower-release
simple bower semver release with automatic update for the version flag in bower.json, tag, commit,  push

##bower-release HELP

If your bower.json contains a scripts section, bower-release will execute the lint and test script
"scripts": {
        "lint": "polymer lint --input *.html demo/*.html",
        "test": "polymer test test/*_test.html"
},...
Usage and Options:
patch|feature|breaking     release without questions
--skip-test    Skip unit tests
--skip-lint    Skip linting
--help -h      Helpful informations
