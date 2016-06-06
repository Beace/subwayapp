angular.module('starter.services', [])

/*.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});*/


.factory('Chats',function(){

  var chats = [{
    id: 0,
    name : 'Stationmaster',
    headPortrait : 'https://beacelee.com/upload/images/subway.png',
    msgText : '地铁新消息0',
    msgTextEn: 'The News 0',
    msgImg : '头像'
  },{
    id: 1,
    name : 'Stationmaster',
    headPortrait : 'https://beacelee.com/upload/images/subway.png',
    msgText : '地铁新消息1',
     msgTextEn: 'The News 1',
    msgImg : '头像'
  },{
    id: 2,
    name : 'Stationmaster',
    headPortrait : 'https://beacelee.com/upload/images/subway.png',
    msgText : '地铁新消息2',
    msgTextEn: 'The News 2',
    msgImg : '头像'
  }];

  return {
    all : function() {
      return chats;
    },
    remove : function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for(var i = 0; i < chats.length; i++) {
        if(chats[i].id === parseInt(chatId)){
          return chats[i];
        }
      }
      return null;
    }
  }
});
