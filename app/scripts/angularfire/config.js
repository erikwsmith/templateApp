angular.module('firebase.config', [])
  .constant('FBURL', 'https://fieldbook-f4928.firebaseio.com')
  .constant('FBAUTHDOMAIN', 'fieldbook-f4928.firebaseapp.com')
  .constant('FBKEY', 'AIzaSyAYqY3-JLbo9ny7kiUGYgGlDJDzx9p23yY')
  .constant('FBSTORAGEBUCKET', 'fieldbook-f4928.appspot.com')

  .constant('WORKSPACE', 'workspace_1')
  .constant('ROW', 'fieldbook-f4928')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password'])

  .constant('loginRedirectPath', '/login');
