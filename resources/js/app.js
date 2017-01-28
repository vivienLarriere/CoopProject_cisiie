var app = angular.module("coop", ['ngResource', 'ngRoute']);
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


app.service('UrlService', ['$location', function($location) {
    this.myurl = $location.absURL();
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

app.factory("Channel", ['$resource', 'api', function($resource, api) {
    return $resource(api.url + '/channels/:id', {
        id: '@_id'
    }, {

    });
}]);

app.controller("StartController", ['$scope', 'Member', 'TokenService', '$location', function($scope, Member, TokenService, $location) {
    if (TokenService.getToken() === null) {
        $location.path('/signin');
    } else {
        $location.path('/home');
    }
}]);

app.controller("LoginController", ['$scope', '$http', 'TokenService', 'Member', '$location', '$timeout', function($scope, $http, TokenService, Member, $location, $timeout) {
    if (TokenService.getToken() === null) {
        $scope.login = function() {
            $scope.class += " loading form";
            Member.signin({
                    email: $scope.email, //titi@toto.fr
                    password: $scope.password //titi
                }, function(m) {
                    $scope.member = m;
                    TokenService.setToken($scope.member.token);
                    $location.path('/home');
                },
                function(error) {
                    alert(error.data.error);
                    $scope.class = 'ui large form';
                });
        }
    } else
        $location.path('/home');

}]);


app.controller("LogoutController", ['$scope', 'TokenService', 'Member', '$location', function($scope, TokenService, Member, $location) {
    if (TokenService.getToken() !== null) {
        $scope.logout = function() {
            Member.signout({}, function() {
                TokenService.deleteToken();
                $location.path('/signin');
            });
        }
    }
}]);

app.controller("SignupController", ['$scope', 'TokenService', 'Member', '$location', function($scope, TokenService, Member, $location) {
    if (TokenService.getToken() === null) {
        $scope.signup = function() {
            $scope.class += " loading form";
            $scope.newMember = new Member({
                fullname: $scope.username,
                email: $scope.email,
                password: $scope.password
            });
            $scope.newMember.$save(function(m) {
                $location.path('/signin');
            }, function(e) {
                alert(e.data.error);
                $scope.class = "ui large form"
            });

        }
    } else
        $location.path('/home');

}]);

app.controller("DisplayMembersController", ['$scope', 'TokenService', 'Member', '$location', function($scope, TokenService, Member, $location) {
    if (TokenService.getToken() !== null) {
        var members = Member.query(
            function(m) {
                var tmp_scope = [];
                angular.forEach(m, function(value) {
                    if (value.token !== TokenService.getToken())
                        tmp_scope.push(value);
                    console.log(tmp_scope);
                });
                $scope.members = tmp_scope;
            },
            function(error) {
                console.log(error);
            });

        $scope.deleteMember = function(m) {
            m.$delete(
                function() {},
                function(error) {
                    console.log(error);
                });
            angular.forEach($scope.members, function(value, key) {
                if (value === m)
                    $scope.members.splice(key, 1);
            });
        }
    } else
        $location.path('/signin')
}]);

app.controller("ChanController", ['$scope', 'TokenService', 'Member', '$location', 'Channel', function($scope, TokenService, Member, $location, Channel) {
    if (TokenService.getToken() !== null) {
        $scope.channels = Channel.query(
            function(c) {
                $scope.channels = c;
                console.log(c);
            },
            function(e) {
                console.log(e);
            });
    } else
        $location.path('/signin')
}]);


app.controller("NewChanController", ['$scope', 'TokenService', 'Member', '$location', 'Channel', function($scope, TokenService, Member, $location, Channel) {
    if (TokenService.getToken() !== null) {
        $scope.addChan = function() {
            $scope.class += " loading form";

            $scope.newChannel = new Channel({
                label: $scope.chanName,
                topic: $scope.chanTopic
            });

            $scope.newChannel.$save(function(c) {
                $location.path('/chan');
            }, function(e) {
                $scope.class = "ui large form"
                alert(e.data.error);
            })
        }
    } else {
        $location.path('/');
    }
}]);

app.controller('DisplayChanController', ['api', '$scope', 'TokenService', 'Member', 'Channel', '$routeParams', '$resource', function(api, $scope, TokenService, Member, Channel, $routeParams, $resource) {
    if (TokenService.getToken() !== null) {
        var Channel = $resource(api.url + '/channels/:id', {
            id: '@id'
        });
        Channel.get({
            id: $routeParams.id
        }).$promise.then(function(c) {
            $scope.channel = c;
        });
        
    } else {
        $location.path('/');
    }
}]);



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


	);*/
