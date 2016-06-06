angular.module('starter.controllers', [])

  .controller('DashCtrl', function($scope) {})

  .controller('ChatsCtrl', function($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function(chat) {
      Chats.remove(chat);
    };
    var base = 1;
    $scope.doRefresh = function() {
      for(var i = 0; i < 5; i ++,base++){
        $scope.chats.unshift(["chat",base].join(''));
      }
      $scope.$broadcast('scroll.refreshComplete');
    }
  })

  .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('AccountCtrl', function($scope) {
    $scope.settings = {
      enableFriends: true
    }
  })


  .controller('SearchForm', function($scope){});

// angular.module('PullDownRefresh', ["ionic"])
// .controller('Refresh',function($scope) {
//   $scope.
// });
