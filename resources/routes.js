var app = angular.module("coop");

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
            template: '',
            controller: 'StartController'
        })

        .when('/signin', {
            templateUrl: './views/sign_in.html'
        })

        .otherwise({
            redirectTo: '/'
        });
}]);
