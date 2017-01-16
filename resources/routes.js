var app = angular.module("coop", ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {

    $routeProvider.when('/signin', {
        templateUrl: 'views/products.html',
        controller: 'Ctrl1'
    });
}]);
