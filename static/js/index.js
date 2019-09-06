angular.element(document).ready(function () {
    if (window.cordova) {
        console.log("Running in Cordova, will bootstrap AngularJS once 'deviceready' event fires.");
        document.addEventListener('deviceready', function () {
            console.log("Deviceready event has fired, bootstrapping AngularJS.");
            angular.bootstrap(document.body, ['applicationcenb']);
        }, false);
    } else {
        console.log("Running in browser, bootstrapping AngularJS now.");
        angular.bootstrap(document.body, ['applicationcenb']);
    }
});

var applicationcenb = angular.module("applicationcenb", ['ngRoute']);

applicationcenb.config(['appServerConfigProvider', function (appServerConfigProvider) {
    appServerConfigProvider
        .setHttpProtool("http")
        /*.setHost('www.philoenglish.com')
        .setHttpPort('80')*/
        .setHost('localhost')
        .setHttpPort('80')
        .setAppName('classmate')
        .setPublickKey("MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCinsmWy+FY1JApwfo/Amkfe06tGIilc4/pMX+JXNTiAZGIHBnUB94GTgyTE4sEWGQiEFGvscCtdPTSJXsYN6FSurnog2yjZCiGPK5CNUYt58LttXGQSaaW3M5xy9oOOgXzpKNRBYGWafTNWYpTCHe5umz2b8IIHynwaFR69vdXNQIDAQAB")
}])

applicationcenb.provider("appServerConfig", function () {

    this.setHttpsProtool = function (protocol) {
        this.httpsProtocol = protocol;
        return this;
    }

    this.setHttpProtool = function (protocol) {
        this.httpProtocol = protocol;
        return this;
    }

    this.setHttpsPort = function (port) {
        this.httpsPort = port;
        return this;
    }

    this.setHttpPort = function (port) {
        this.httpPort = port;
        return this;
    }

    this.setHost = function (host) {
        this.httpServerHost = host;
        return this;
    }

    this.setAppName = function (appName) {
        this.remoteAppName = appName;
        return this;
    }

    this.setPublickKey = function (publicKey) {
        this.publicKey = publicKey;
        return this;
    }

    this.getPublicKey = function () {
        return this.publicKey;
    }

    this.getRemoteServerUri = function () {
        return this.httpProtocol+"://" + this.httpServerHost + ":" + this.httpPort +'/' +this.remoteAppName+'/';
    }

    this.$get = function () {
        return this;
    }
})

applicationcenb.service('Httpservice', function($http, $q) {
    this.httpget = function(url){
        var defered = $q.defer();
        $http.get(url)
            .then(function (response) {
                defered.resolve(response);
            },function (err) {
                defered.reject(err);
            });
        return defered.promise;
    }

    this.httppost = function(url) {
        var defered = $q.defer();
        $http.post(url)
            .then(function (response) {
                defered.resolve(response);
            },function (err) {
                defered.reject(err);
            });
        return defered.promise;
    }
});

applicationcenb.service("ExceptionHandler", function () {
    this.handleError = function (exception) {
        console.log("an error happened {}", exception);
    }

})

applicationcenb.controller('MainCtrl', function ($scope, $window, $rootScope, $location ) {

    $scope.template = {
        "header": "/templates/header.html",
        "sidebar": "/templates/sidebar.html",
        "content": "/templates/content.html",
        "footer": "/templates/footer.html"
    }

    $scope.changeView = function (pageId, description) {
        $location.path(pageId);
        $scope.description = description;
    }

})

applicationcenb.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'MainCtrl',
            templateUrl: '/templates/main.html'
        })
        .when('/login', {
            controller: function ($scope) {
                $scope.template.content = "templates/login.html";
            },
            templateUrl: '/templates/main.html'
        })
        .when('/forgotPwd', {
            templateUrl: '/templates/main.html'
        })

        .when('/signup', {
            controller: function ($scope) {
                $scope.template.content = "templates/signup.html";
            },
            templateUrl: '/templates/main.html'
        })
}]);

applicationcenb.controller('UserCtrl', function($scope, $http, appServerConfig, $location, UserService, $interval) {
    $scope.login = function(user) {
        UserService.login(user, UserService.getClientId(), function(success, msg){
            if(success){
                $location.path("/myInfor");
            } else {
                $scope.res = msg;
            }
        })
    }

    $scope.logout = function() {
        UserService.logout()
        $location.path("/");
    }

    $scope.forgotPwd = function() {
        $location.path("/forgotPwd");
    }

    $scope.signup = function() {
        $location.path("/signup");
    }

    $scope.seconds = 60;
    $scope.validcodepromptmsg="点击获取验证码";
    $scope.sendValidCode = function() {
        if($scope.seconds>=60){
            $http.post(appServerConfig.getRemoteServerUri()+'api/sms/validcode', { "username":$scope.user.username})
            var timerHandler = $interval(function() {
                if($scope.seconds<=0){
                    $interval.cancel(timerHandler);
                    $scope.seconds =60;
                    $scope.validcodepromptmsg ="点击获取验证码";
                } else {
                    $scope.validcodepromptmsg = $scope.seconds+"秒后可重发";
                    $scope.seconds--;
                }
            },1000,1000);
        }
    }

    $scope.register = function(user) {
        UserService.register(user, function(success, msg){
            if(success){
                $location.path("/login");
            } else {
                $scope.res = msg;
            }
        })
    }
})


applicationcenb.service("UserService", function ($http, $rootScope,appServerConfig, $window) {

    var uuid = "xxx";

    this.getUserInfo = function() {
        return $rootScope.currentUser;
    }

    this.getUserId = function () {
        return $rootScope.currentUser.userId;
    }

    this.getClientId = function () {
        if(uuid == "xxx"){
            uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }
        return uuid;
    }

    this.login = function(user, clientId,  callback) {
        var encryptedPassword = user.pass
        $http.post(appServerConfig.getRemoteServerUri()+'api/authenticate', { "username":user.username,"password": encryptedPassword, "verificationcode": user.verificationcode, "clientId": clientId })
            .then(function(res){
                if(res.data.token){
                    $rootScope.currentUser = { username: user.username, userId: res.data.userId, token: res.data.token };
                    $window.localStorage.currentUser = JSON.stringify($rootScope.currentUser ) ;
                    $http.defaults.headers.common.Authorization = 'Bearer ' + res.data.token;
                    callback(true, res.data.msg)
                } else {
                    callback(false, res.data.msg)
                }
            });
    }

    this.logout = function() {
        // remove user from local storage and clear http auth header
        delete $window.localStorage.currentUser;
        delete $rootScope.currentUser;
        $http.defaults.headers.common.Authorization = '';
    }

    this.register = function(user, callback) {
        var encryptedPassword = user.pass
        $http.post(appServerConfig.getRemoteServerUri()+'api/register', { "username":user.username,"password":encryptedPassword })
            .then(function(res){
                if(res.data.code==200){
                    delete $window.localStorage.currentUser
                    delete $rootScope.currentUser;
                    $http.defaults.headers.common.Authorization = '';
                    callback(true, res.data.msg)
                } else {
                    callback(false, res.data.msg)
                }
            });
    }

})

