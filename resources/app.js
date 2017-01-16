var url_local = 'http://127.0.0.1/CISIIE/Javascript/api_netlor_project/';
var app = angular.module("coop", ['ngResource']);
app.constant('api', {
    'key': '8f9d446fa032445083d15cd71e978aa4',
    'url': 'http://coop.api.netlor.fr/api'
});

app.service('TokenService', [function() {
    this.token = '';
    this.setToken = function(t) {
        if (localStorage.getItem('token') === null) {
            localStorage.setItem('token', t);
        } else {
            this.token = localStorage.getItem('token');
        }
    }
    this.getToken = function() {
        return localStorage.getItem('token');
    }
    this.deleteToken = function() {
        if (localStorage.getItem('token') !== null)
            localStorage.removeItem('token');
    }
}]);

app.config(['$httpProvider', 'api', function($httpProvider, api) {
    $httpProvider.defaults.headers.common.Authorization = 'Token token=' + api.key;

    $httpProvider.interceptors.push(['TokenService', function(TokenService) {
        return {
            request: function(config) {
                var token = TokenService.getToken();
                if (token !== null) {
                    config.url += ((config.url.indexOf('?') >= 0) ? '&' : '?') +
                        'token=' + token;
                }
                return config;
            }
        };
    }]);
}]);

app.factory("Member", ['$resource', 'api', function($resource, api) {
    return $resource(api.url + '/members/:id', {
        id: '@_id'
    }, {
        update: {
            method: 'PUT'
        },
        signin: {
            method: 'POST',
            url: api.url + '/members/signin'
        },
        signout: {
            method: 'DELETE',
            url: api.url + '/members/signout'
        }
    });
}]);

app.controller("StartController", ['$scope', 'Member', 'TokenService', function($scope, Member, TokenService) {
    if (TokenService.getToken() === null) {
        Member.signin({
            email: "titi@toto.fr",
            password: 'titi'
        }, function(m) {
            $scope.member = m;
            TokenService.setToken($scope.member.token);
            $scope.members = Member.query(function(members) {
                console.log($scope.members);
            });
        });
    } else {
        TokenService.setToken(localStorage.getItem('token'));
        $scope.members = Member.query(function(members) {
            console.log($scope.members);
        });
        Member.signout({}, function() {
            TokenService.deleteToken();
        })
    }
}]);

// $scope.newMember = new Member({
// 	fullname: "TOTO",
// 	email: "toto2@coop.fr",
// 	password: "toto"
// });

// $scope.newMember.$save(function(m){
// 	console.log($scope.newMember);
// }, function(e){

// });

/*$scope.member =	Member.save({
		fullname: "TOTO",
		email: "toto4@coop.fr",
		password: "toto"
	}, function(m){
		$scope.member.$delete(function(success){
			console.log(success);
		});
	}, function(e){
		console.log($scope.newMember);
	});

	$scope.members = Member.query(
		function(m){
			console.log(m);
		},
		function(error){
			console.log(error);
		}
	);*/
