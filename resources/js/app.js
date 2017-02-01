var app = angular.module("coop", ['ngResource', 'ngRoute']);
app.constant('api', {
    'key': '8f9d446fa032445083d15cd71e978aa4',
    'url': 'http://coop.api.netlor.fr/api'
});
app.run(['TokenService', '$timeout', function(TokenService, $timeout) {
    var date = new Date().getTime();

    if (date - localStorage.getItem('date_token') >= 1800000)
        TokenService.deleteToken();
    else
        TokenService.tokenTimeout();

}]);

app.service('TokenService', ['$timeout', function($timeout) {
    this.token = '';
    this.token_timeout = '';
    this.setToken = function(t) {
        if (localStorage.getItem('token') === null) {
            localStorage.setItem('token', t);
            localStorage.setItem('date_token', new Date().getTime())
        } else {
            this.token = localStorage.getItem('token');
            localStorage.setItem('date_token', new Date().getTime())
        }
    }

    this.refreshTokenDate = function() {
        localStorage.setItem('date_token', new Date().getTime());
    }

    this.getToken = function() {
        return localStorage.getItem('token');
    }

    this.deleteToken = function() {
        if (localStorage.getItem('token') !== null) {
            localStorage.removeItem('token');
            localStorage.removeItem('date_token');
        }
    }

    this.tokenTimeout = function() {
        $timeout.cancel(this.token_timeout);
        this.token_timeout = $timeout(function() {
            if (localStorage.getItem('token') !== null) {
                localStorage.removeItem('token');
                localStorage.removeItem('date_token');
                console.log('TOKEN DELETED !!!!!!!!');
            }
        }, 1800000); //30 minutes
    }
}]);

app.directive('toTheBottom', function() {
    return {
        scope: {
            toTheBottom: "="
        },
        link: function(scope, element) {
            scope.$watchCollection('toTheBottom', function(newPost) {
                if (newPost) {
                    $(element).scrollTop($(element)[0].scrollHeight);
                }
            });
        }
    }
})

app.config(['$httpProvider', 'api', '$timeoutProvider', '$locationProvider', function($httpProvider, api, $timeoutProvider, $locationProvider) {
    $httpProvider.defaults.headers.common.Authorization = 'Token token=' + api.key;
    $httpProvider.interceptors.push(['TokenService', function(TokenService) {
        return {
            request: function(config) {
                var token = TokenService.getToken();
                if (token !== null) {
                    TokenService.tokenTimeout();
                    TokenService.refreshTokenDate();
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
    }, {});
}]);

app.factory("Post", ['$resource', 'api', function($resource, api) {
    return $resource(api.url + '/channels/:channel_id/posts/:id', {
        channel_id: '@channel_id',
        id: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
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

        $scope.deleteChan = function(c) {
            c.$delete(
                function() {},
                function(error) {
                    console.log(error);
                });
            angular.forEach($scope.channels, function(value, key) {
                if (value === c) {
                    console.log(c);
                    $scope.channels.splice(key, 1);
                }
            });
        }
    } else
        $location.path('/')
}]);


app.controller("NewChanController", ['$scope', 'TokenService', 'Member', '$location', 'Channel', function($scope, TokenService, Member, $location, Channel) {
    if (TokenService.getToken() !== null) {
        console.log('toto');
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

app.controller('DisplayChanController', ['$scope', 'TokenService', 'Channel', '$routeParams', '$location', function($scope, TokenService, Channel, $routeParams, $location) {
    if (TokenService.getToken() !== null) {
        Channel.get({
            id: $routeParams.id
        }).$promise.then(function(c) {
            $scope.channel = c;
            // console.log(c);
        });

    } else {
        $location.path('/');
    }
}]);

app.controller('DisplayPostController', ['$scope', '$interval', 'TokenService', '$routeParams', '$location', 'Post', 'Member', '$rootScope', function($scope, $interval, TokenService, $routeParams, $location, Post, Member, $rootScope) {
    if (TokenService.getToken() !== null) {

        var members = [];
        Member.query().$promise.then(function(results_member) {
            angular.forEach(results_member, function(value) {
                members.push(value);

            });
        });

        $scope.deletePost = function(p) {
            p.$delete({
                channel_id: $routeParams.id
            }, function() {
                console.log('toto');
            }, function(e) {
                console.log(e);
            })
        }

        $scope.updatePost = function(p) {
            if (p.editPost === true) {
                p.$update({
                    channel_id: $routeParams.id
                }, function() {
                    console.log('toto');

                })
            } else {
                p.editPost = true;
            }
        }

        $scope.addPost = function() {
            $scope.class += " disabled field"

            $scope.newPost = new Post({
                message: $scope.postMessage
            });

            $scope.newPost.$save({
                channel_id: $routeParams.id
            }, function(p) {
                $scope.posts.push(p);
                $scope.postMessage = "";
                $scope.class = "ui inverted input"
            }, function(e) {
                console.log(e.data.error);
                $scope.class = "ui inverted input"
            });

        }

        $scope.posts = Post.query({
                channel_id: $routeParams.id
            },
            function(p) {
                $scope.posts = p;
            },
            function(e) {
                console.log(e);
            }).$promise.then(function(results_post) {
            angular.forEach(results_post, function(value) {
                members.forEach(function(element) {
                    if (element._id === value.member_id) {
                        value.member_fullname = element.fullname;
                    }
                });
            });
        });

        var interval_posts = $interval(function() {
            var toto = [];
            toto = Post.query({
                    channel_id: $routeParams.id
                },
                function(p) {
                    toto = p;
                },
                function(e) {
                    console.log(e);
                }).$promise.then(function(results_post) {
                angular.forEach(results_post, function(value) {
                    if (value.editPost !== true) {
                        members.forEach(function(element) {
                            if (element._id === value.member_id) {
                                value.member_fullname = element.fullname;
                            }
                        });
                    }
                });
                if (toto !== $scope.posts) {
                    $scope.posts = toto;
                }

            });
        }, 3000);

        $rootScope.$on("$routeChangeStart", function() {
            $interval.cancel(interval_posts);
        });

    } else
        $location.path('/');
}]);
