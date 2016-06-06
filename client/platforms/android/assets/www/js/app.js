// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $rootScope, $ionicHistory,$state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
      ionic.Platform.isFullScreen = true;

    }
    if(navigator && navigator.splashscreen) {
        navigator.splashscreen.hide();
      }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    var needLoginView = ["tab.addLine","tab.deleteLine","tab.addStation","tab.deleteStation"];//需要登录的页面state
    $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams, options){ 
        if(needLoginView.indexOf(toState.name)>=0&&!$rootScope.isLogin){//判断当前是否登录
            $state.go("tab.login");//跳转到登录页
            event.preventDefault(); //阻止默认事件，即原本页面的加载
        }
    })
    $rootScope.logout = function() {
      $rootScope.username = "";
      $rootScope.password = "";
      $rootScope.isLogin = false;
    }
  });
})

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  // setup an abstract state for the tabs directive

  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('tab.login',{
    url:'/login',
    views:{
      'tab-dash':{
        templateUrl:'templates/login.html',
        controller:'LoginCtrl'
      }
    }
  })
 .state('tab.register',{
   url:'/register',
   views:{
     'tab-dash':{
       templateUrl:'templates/register.html',
       controller:'RegisterCtrl'
     }
   }
 })
.state('tab.addLine',{
   url:'/addLine',
   views:{
     'tab-dash':{
       templateUrl:'templates/addLine.html',
       controller:'AddLineCtrl'
     }
   }
 })
 .state('tab.addStation',{
     url:'/addStation',
     views:{
         'tab-dash':{
             templateUrl:'templates/addStation.html',
             controller:'AddStationCtrl'
         }
     }
 })
 .state('tab.single', {
    url: '/addStation/:addStationId',
    views: {
      'tab-dash': {
        templateUrl: 'templates/stationList.html',
        controller: 'StationListCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');
  $ionicConfigProvider.platform.ios.tabs.style('standard'); 
  $ionicConfigProvider.platform.ios.tabs.position('bottom');
  $ionicConfigProvider.platform.android.tabs.style('standard');
  $ionicConfigProvider.platform.android.tabs.position('standard');

  $ionicConfigProvider.platform.ios.navBar.alignTitle('center'); 
  $ionicConfigProvider.platform.android.navBar.alignTitle('left');

  $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
  $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');  

  $ionicConfigProvider.platform.ios.views.transition('ios'); 
  $ionicConfigProvider.platform.android.views.transition('android');
});
