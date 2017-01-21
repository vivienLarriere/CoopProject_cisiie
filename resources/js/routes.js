var app = angular.module("coop");

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
            template: '',
            controller: 'StartController'
        })

        .when('/signup', {
          templateUrl: './views/sign_up.html',
          controller: 'SignupController'
        })

        .when('/signin', {
            templateUrl: './views/sign_in.html',
            controller: 'LoginController'
        })

        .when('/signout', {
            controller: 'LogoutController'
        })

        .when('/home', {
            templateUrl: './views/home.html',
            controller: 'StartController'
        })

        .otherwise({
            redirectTo: '/'
        });
}]);
