/**
 * Gruntfile
 */

module.exports = function(grunt) {


  /************************
   *
   * Injecting variables
   *
   ************************/

  /**
   * CSS files to inject in order
   */
  var cssFilesToInject = [
    'assets/styles/**/*.css'
  ];


  /**
   * Javascript files to inject in order
   */
  var jsFilesToInject = [
    // *->    put dependencies here   <-*

    // All of the rest of your app scripts imported here
    'assets/js/**/*.js'
  ];


  /**
   * Client-side HTML templates are injected using the sources below
   * The ordering of these templates shouldn't matter.
   */
  var templateFilesToInject = [
    'assets/templates/**/*.html'
  ];


  // Modify css file injection paths to use
  cssFilesToInject = cssFilesToInject.map(function(path) {
    return '.tmp/public/' + path;
  });

  // Modify js file injection paths to use
  jsFilesToInject = jsFilesToInject.map(function(path) {
    return '.tmp/public/' + path;
  });


  templateFilesToInject = templateFilesToInject.map(function(path) {
    return 'assets/' + path;
  });


  /************************
   *
   * Loading Tasks
   *
   *
   ************************/

  // Get path to core grunt dependencies from Sails
  var depsPath = grunt.option('gdsrc') || 'node_modules/sails/node_modules';
  grunt.loadTasks(depsPath + '/grunt-contrib-clean/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-copy/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-concat/tasks');
  grunt.loadTasks(depsPath + '/grunt-sails-linker/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-jst/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-watch/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-uglify/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-cssmin/tasks');
  grunt.loadTasks(depsPath + '/grunt-contrib-less/tasks');



  /************************
   *
   * Project configuration
   *
   ************************/
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      dev: {
        files: [{
          expand: true,
          cwd: './assets',
          src: ['**/*'],
          dest: '.tmp/public'
        }]
      },
      build: {
        files: [{
          expand: true,
          cwd: '.tmp/public',
          src: ['**/*'],
          dest: 'www'
        }]
      }
    },

    clean: {
      dev: ['.tmp/public/**'],
      build: ['www']
    },

    jst: {
      dev: {
        options: {
          templateSettings: {
            interpolate: /\{\{(.+?)\}\}/g
          }
        },
        files: {
          '.tmp/public/jst.js': templateFilesToInject
        }
      }
    },

    less: {
      dev: {
        files: [{
          expand: true,
          cwd: 'assets/styles/',
          src: ['*.less'],
          dest: '.tmp/public/styles/',
          ext: '.css'
        }, {
          expand: true,
          cwd: 'assets/linker/styles/',
          src: ['*.less'],
          dest: '.tmp/public/linker/styles/',
          ext: '.css'
        }]
      }
    },

    concat: {
      js: {
        src: jsFilesToInject,
        dest: '.tmp/public/concat/production.js'
      },
      css: {
        src: cssFilesToInject,
        dest: '.tmp/public/concat/production.css'
      }
    },

    uglify: {
      dist: {
        src: ['.tmp/public/concat/production.js'],
        dest: '.tmp/public/min/production.js'
      }
    },

    cssmin: {
      dist: {
        src: ['.tmp/public/concat/production.css'],
        dest: '.tmp/public/min/production.css'
      }
    },

    'sails-linker': {

      devJs: {
        options: {
          startTag: '<!--SCRIPTS-->',
          endTag: '<!--SCRIPTS END-->',
          fileTmpl: '<script src="%s"></script>',
          appRoot: '.tmp/public'
        },
        files: {
          '.tmp/public/**/*.html': jsFilesToInject,
          'views/**/*.html': jsFilesToInject,
          'views/**/*.ejs': jsFilesToInject
        }
      },

      prodJs: {
        options: {
          startTag: '<!--SCRIPTS-->',
          endTag: '<!--SCRIPTS END-->',
          fileTmpl: '<script src="%s"></script>',
          appRoot: '.tmp/public'
        },
        files: {
          '.tmp/public/**/*.html': ['.tmp/public/min/production.js'],
          'views/**/*.html': ['.tmp/public/min/production.js'],
          'views/**/*.ejs': ['.tmp/public/min/production.js']
        }
      },

      devStyles: {
        options: {
          startTag: '<!--STYLES-->',
          endTag: '<!--STYLES END-->',
          fileTmpl: '<link rel="stylesheet" href="%s">',
          appRoot: '.tmp/public'
        },

        // cssFilesToInject defined up top
        files: {
          '.tmp/public/**/*.html': cssFilesToInject,
          'views/**/*.html': cssFilesToInject,
          'views/**/*.ejs': cssFilesToInject
        }
      },

      prodStyles: {
        options: {
          startTag: '<!--STYLES-->',
          endTag: '<!--STYLES END-->',
          fileTmpl: '<link rel="stylesheet" href="%s">',
          appRoot: '.tmp/public'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/min/production.css'],
          'views/**/*.html': ['.tmp/public/min/production.css'],
          'views/**/*.ejs': ['.tmp/public/min/production.css']
        }
      },

      // Bring in JST template object
      devTpl: {
        options: {
          startTag: '<!--TEMPLATES-->',
          endTag: '<!--TEMPLATES END-->',
          fileTmpl: '<script type="text/javascript" src="%s"></script>',
          appRoot: '.tmp/public'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/jst.js'],
          'views/**/*.html': ['.tmp/public/jst.js'],
          'views/**/*.ejs': ['.tmp/public/jst.js']
        }
      }
    },

    watch: {
      api: {

        // API files to watch:
        files: ['api/**/*']
      },
      assets: {

        // Assets to watch:
        files: ['assets/**/*'],

        // When assets are changed:
        tasks: ['compileAssets', 'linkAssets']
      }
    }
  });



  /************************
   *
   * Project tasks
   *
   ************************/

  // Default task when Sails is lifted:
  grunt.registerTask('default', [
    'compileAssets',
    'linkAssets',
    'watch'
  ]);

  grunt.registerTask('compileAssets', [
    'clean:dev',
    'jst:dev',
    'less:dev',
    'copy:dev'
  ]);

  grunt.registerTask('linkAssets', [
    'sails-linker:devJs',
    'sails-linker:devStyles',
    'sails-linker:devTpl'
  ]);


  // Build the assets into a web accessible folder.
  // (handy for phone gap apps, chrome extensions, etc.)
  grunt.registerTask('build', [
    'compileAssets',
    'linkAssets',
    'clean:build',
    'copy:build'
  ]);

  // When sails is lifted in production
  grunt.registerTask('prod', [
    'clean:dev',
    'jst:dev',
    'less:dev',
    'copy:dev',
    'concat',
    'uglify',
    'cssmin',
    'sails-linker:prodJs',
    'sails-linker:prodStyles',
    'sails-linker:devTpl'
  ]);
};
