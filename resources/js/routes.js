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

        .when('/members', {
            templateUrl: './views/members.html',
            controller: 'DisplayMembersController'
        })

        .when('/chan', {
            templateUrl: './views/chan.html',
            controller: 'ChanController'
        })

        .when('/chan/new', {
            templateUrl: './views/new_chan.html',
            controller: 'NewChanController'
        })

        .when('/chan/:id', {
            templateUrl: './views/chan_detail.html',
            controller: 'DisplayChanController'
        })


        .when('/home', {
            templateUrl: './views/home.html',
        })

        .otherwise({
            redirectTo: '/'
        });
}]);
