module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      temp: {
        files: {
          'temp/css/sidebar.css': 'src/css/sidebar.scss'
        }
      }
    },
    uglify: {
      temp: {
        files: {
          'temp/js/sidebar.min.js': ['src/js/vendor/zepto.min.js', 'src/js/sidebar.js'],
          'temp/js/devtools.min.js': 'src/js/devtools.js'
        }
      }
    },
    copy: {
      temp: {
        files: {
          'temp/devtools.html': 'src/devtools.html',
          'temp/sidebar.html': 'src/sidebar.html',
          'temp/manifest.json': 'src/manifest.json'
        }
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'temp/',
          src: ['**/*'],
          dest: 'dist/'
        }]
      }
    },
    zip: {
      'dist/extension.pkg.zip': ['temp/**/*']
    },
    clean: {
      dist: ['dist/*'],
      temp: ['temp/*']
    },
    jshint: {},
    watch: {
      src: {
        files: ['src/**/*'],
        tasks: ['build']
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['build', 'watch']);
  grunt.registerTask('build', ['clean:temp', 'sass', 'uglify', 'copy:temp', 'manifest', 'clean:dist', 'copy:dist', 'zip']);
  
  grunt.registerTask('manifest', function(){
    grunt.file.write('temp/manifest.json', JSON.stringify(grunt.config('pkg').manifest, false, '  '));
  });
};