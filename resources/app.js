var url_local = 'http://127.0.0.1/CISIIE/Javascript/api_netlor_project/';
var app = angular.module("coop", ['ngResource']);
app.constant('api', {
    'key': '8f9d446fa032445083d15cd71e978aa4',
    'url': 'http://coop.api.netlor.fr/api'
});

app.config(['$httpProvider', 'api', function($httpProvider, api) {
    $httpProvider.defaults.headers.common.Authorization = 'Token token=' + api.key;

    $httpProvider.interceptors.push(['TokenService', function(TokenService) {
        return {
            request: function(config) {
                var token = TokenService.getToken();
                if (token != "") {
                    config.url += ((config.url.indexOf('?') >= 0) ? '&' : '?') + 'token=' + token;
                }
                return config;
            }
        }
    }]);
}]);

app.factory("Member", ['$resource', 'api', function($resource, api) {
    return $resource(api.url + '/members/:id', {
        id: '@_id'
    }, {
        update: {
            method: 'PUT',
        },
        signin: {
            method: 'POST',
            url: api.url + '/members/signin'
        }
    });
}]);

app.service('TokenService', [function() {
    this.token = null;
    this.setToken = function(t) {
        if (localStorage.getItem('token') === undefined)
            localStorage.setItem('token', t);
        else
            this.token = localStorage.getItem('token');

    };
    this.getToken = function() {
        if (localStorage.getItem('token') === undefined)
            return localStorage.getItem('token');
        else
            return null;
    };
}]);

app.controller("StartController", ['$scope', 'Member', 'TokenService', function($scope, Member, TokenService) {
    $scope.member = Member.signin({
            email: 'titi@toto.fr',
            password: 'titi',
        },
        function(m) {
            $scope.member = m;
            console.log($scope.member);
            TokenService.setToken($scope.member.token);
            $scope.member = Member.query(function(member) {
                console.log(member);
            })
        },
        function(e) {
            console.log(e);
        });

    $scope.members = Member.query(function(m) {
            console.log(m);
        },
        function(error) {
            console.log(error);
        }
    );

    // $scope.member = Member.save({
    //     fullname: "TOTO",
    //     email: "toto3@coop.fr",
    //     password: 'toto'
    // }, function(m) {
    //     console.log($scope.member);
    // }, function(e) {
    //     console.log($scope.newMember);
    // });
    // $scope.newMember.$save(function(successs) {
    //         console.log(successs);
    //     },
    //     function(error) {
    //         console.log(error);
    //     }
    // }

}]);
