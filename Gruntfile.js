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
    // vendor styles
    'vendor/bootstrap/dist/css/bootstrap.min.css',

    // balderdash styles
    'styles/main.css'
  ];


  /**
   * Javascript files to inject in order
   */
  var jsFilesToInject = [
    // *->    put dependencies here   <-*
    'vendor/jquery/jquery.min.js',
    'vendor/lodash/dist/lodash.min.js',
    'vendor/backbone/backbone-min.js',

    // All of the rest of your app scripts imported here
    'js/**/*.js'
  ];


  /**
   * Client-side HTML templates are injected using the sources below
   * The ordering of these templates shouldn't matter.
   */
  var templateFilesToInject = [
    'templates/**/*.html'
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

    // File copying
    copy: {
      dev: {
        files: [{
          expand: true,
          cwd: './assets',
          src: ['**/*', '!styles/**/*.less'],
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

    // Emptying .tmp directory
    clean: {
      dev: ['.tmp/public/**'],
      build: ['www']
    },

    // Precompiling underscore templates
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

    // Less compilation
    less: {
      dev: {
        files: {
          '.tmp/public/styles/main.css': 'assets/styles/importer.less'
        }
      }
    },

    // Script and styles concatination
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

    // script uglify
    uglify: {
      dist: {
        src: ['.tmp/public/concat/production.js'],
        dest: '.tmp/public/min/production.js'
      }
    },

    // css minification
    cssmin: {
      dist: {
        src: ['.tmp/public/concat/production.css'],
        dest: '.tmp/public/min/production.css'
      }
    },

    // File injecting
    'sails-linker': {

      // Script injection
      devJs: {
        options: {
          startTag: '<!--SCRIPTS-->',
          endTag: '<!--SCRIPTS END-->',
          fileTmpl: '<script src="%s"></script>',
          appRoot: '.tmp/public'
        },
        files: {
          '.tmp/public/**/*.html': jsFilesToInject
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
          '.tmp/public/**/*.html': ['.tmp/public/min/production.js']
        }
      },

      // Style injection
      devStyles: {
        options: {
          startTag: '<!--STYLES-->',
          endTag: '<!--STYLES END-->',
          fileTmpl: '<link rel="stylesheet" href="%s">',
          appRoot: '.tmp/public'
        },
        files: {
          '.tmp/public/**/*.html': cssFilesToInject
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
          '.tmp/public/index.html': ['.tmp/public/min/production.css']
        }
      },

      // JST file injection
      devTpl: {
        options: {
          startTag: '<!--TEMPLATES-->',
          endTag: '<!--TEMPLATES END-->',
          fileTmpl: '<script type="text/javascript" src="%s"></script>',
          appRoot: '.tmp/public'
        },
        files: {
          '.tmp/public/index.html': ['.tmp/public/jst.js']
        }
      }
    },

    // Watching file changes
    watch: {
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
