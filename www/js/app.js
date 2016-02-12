angular.module('ionic-firebase-seed', ['ionic', 'firebase'])

// TODO: Replace this with your own Firebase URL: https://firebase.com/signup
.constant('FBURL', 'https://brilliant-torch-1255.firebaseio.com')

.factory('Auth', function($firebaseAuth, FBURL, $window) {
  var ref = new $window.Firebase(FBURL);
  return $firebaseAuth(ref);
})

.factory('Messages', function($firebaseArray, FBURL, $window) {
  var ref = new $window.firebasease(FBURL + '/messages');
  return $firebaseArray(ref);
})

.controller('AppCtrl', function($scope, $ionicLoading, $ionicScrollDelegate, $timeout, Auth, Messages) {

  // EMAIL & PASSWORD AUTHENTICATION

  // Check for the user's authentication state
  Auth.$onAuth(function(authData) {
    if (authData) {
      $scope.loggedInUser = authData;
    } else {
      $scope.loggedInUser = null;
    }
  });

  // Create a new user, called when a user submits the signup form
  $scope.createUser = function(user) {
    $ionicLoading.show();
    Auth.$createUser({
      email: user.email,
      password: user.pass
    }).then(function() {
      // User created successfully, log them in
      return Auth.$authWithPassword({
        email: user.email,
        password: user.pass
      });
    }).then(function(authData) {
      console.log('Logged in successfully as: ', authData.uid);
      $scope.loggedInUser = authData;
      $ionicLoading.hide();
    }).catch(function(error) {
      console.log('Error: ', error);
      $ionicLoading.hide();
      alert("Error al tratar de crear el usuario");
    });
  };

  // Login an existing user, called when a user submits the login form
  $scope.login = function(user) {
    $ionicLoading.show();
    Auth.$authWithPassword({
      email: user.email,
      password: user.pass
    }).then(function(authData) {
      console.log('Logged in successfully as: ', authData.uid);
      $ionicLoading.hide();
      $scope.loggedInUser = authData;
    }).catch(function(error) {
      console.log('Error: ', error);
      $ionicLoading.hide();
      alert("Nombre de usuario o contraseña incorrecta");
    });
  };

  // Log a user out
  $scope.logout = function() {
    Auth.$unauth();
  };

  // ADD MESSAGES TO A SYNCHRONIZED ARRAY

  // Bind messages to the scope
  $scope.messages = Messages;
  $scope.messages.$watch(function(event) {
    if (event.event == 'child_added') {
      $ionicScrollDelegate.scrollBottom(true);
    }
  });

  // Add a message to a synchronized array using $add with $firebaseArray
  $scope.addMessage = function(message) {
    if ($scope.loggedInUser) {
      Messages.$add({
        email: $scope.loggedInUser.password.email,
        text: message.text
      });
      message.text = "";
    }
  };
})

.run(function($ionicPlatform, FBURL) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});