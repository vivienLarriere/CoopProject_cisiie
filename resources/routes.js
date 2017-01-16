var app = angular.module("coop", ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/signin', {
        templateUrl: './views/sign_in.html',
        controller: 'SigninController'
    });
}]);
