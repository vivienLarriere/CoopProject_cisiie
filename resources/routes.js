var app = angular.module("coop", ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/signin', {
<<<<<<< HEAD

=======
>>>>>>> 2117f0211ec2f3fc144bb135e6e5a5de2ee467b8
        templateUrl: 'views/sign_in.html',
        controller: 'SigninController'
    });
}]);
