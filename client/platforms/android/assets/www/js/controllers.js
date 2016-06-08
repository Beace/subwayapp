angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $ionicModal,$ionicPopup,$timeout,$compile) {
      // Form data for the login modal
    $ionicModal.fromTemplateUrl('my-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.showAlert = function() {
        var alertPopup = $ionicPopup.alert({
            title: '请正确填写站名',
            template: '请检查站名是否填写，如果填写请确认是否填写正确'
        });
        alertPopup.then(function(res) {
            console.log('Thank you for not eating my delicious ice cream cone');
        });
    };

    $scope.openModal = function(dataset) {
        
           
        var start = document.getElementById('start').value, //获取用户输入的初始站值
            end = document.getElementById('end').value; //获取用户输入的终点站值
        var path = document.getElementById('path');
        // 获取用户在下拉框中选择的线路
        var startLine = document.getElementById('startLines'),
            startLineIndex = startLine.selectedIndex,
            startLineText = startLine.options[startLineIndex].text,
            startLineValue = startLine.options[startLineIndex].value,
            
            startStations = document.getElementById('start_stations'),
            startStationsIndex = startStations.selectedIndex,
            startStationsText = startStations.options[startStationsIndex].text,
            startStationsValue = parseInt(startStations.options[startStationsIndex].value),


            endLine = document.getElementById('endLines'),
            endLineIndex = endLine.selectedIndex,
            endLineText = endLine.options[endLineIndex].text,
            endLineValue = endLine.options[endLineIndex].value,

            endStations = document.getElementById('end_stations'),
            endStationsIndex = endStations.selectedIndex,
            endStationsText = endStations.options[endStationsIndex].text;
            endStationsValue = parseInt(endStations.options[endStationsIndex].value);
        
        if(!start && !end && !startLineValue && !endStationsValue) {
            $scope.showAlert();
        }

         //查找开始/结束线路存储起来
        var startLineObj = {}; //A线路对象
        var endLineObj = {}; //B线路对象
        var transferSta = []; //换乘站对象数组
        var halfSingleLinePath = []; //一半路线
        var anotherHalfSingleLinePath = []; //另一半路线
        var findSingleLinePath = []; //最终的路线
        if (!start || !end) {

            if(startLineValue == endLineValue) {
                for(var i = 0; i < dataset.length; i ++) {
                    if(dataset[i].id == startLineValue) {
                        startLineObj= dataset[i];
                        console.log(dataset[i]);
                    }
                }
                console.log(startStationsValue + ' ' + endStationsValue );
                if(startStationsValue > endStationsValue) {
                    findSingleLinePath = startLineObj.subStation.slice(endStationsValue - 1,endStationsValue).reverse();
                    $scope.modal.show();
                    consoleShortPath(findSingleLinePath,startLineIndex);
                }else{
                    findSingleLinePath = startLineObj.subStation.slice(startStationsValue - 1,endStationsValue);
                    $scope.modal.show();
                    consoleShortPath(findSingleLinePath,startLineIndex);
                }
                
            }else{
                for(var i = 0; i < dataset.length; i ++) {
                    if(dataset[i].id == startLineValue) {
                        startLineObj = dataset[i];
                    }else if(dataset[i].id == endLineValue) {
                        endLineObj = dataset[i];
                    }
                }
                for(var j = 0; j < startLineObj.subStation.length; j ++) {
                    if(startLineObj.subStation[j].transfer){
                        for(var k = 0; k < startLineObj.subStation[j].transfer.length; k ++) {
                            if(startLineObj.subStation[j].transfer[k] == endLineValue) {
                                transferSta.push({
                                    staId:startLineObj.subStation[j].staId,
                                    staName:startLineObj.subStation[j].staName,
                                    transfer:startLineObj.subStation[j].transfer[k]
                                })
                            }
                        }
                    }   
                }
                for(var i = 0; i < transferSta.length; i ++) {                  
                    if(startStationsValue > transferSta[i].staId) {
                        halfSingleLinePath.push(startLineObj.subStation.slice(transferSta[i].staId - 1 ,startStationsValue).reverse());
                        $scope.stationsNum = Math.abs(startStationsValue - transferSta[i].staId);                       
                    }else{
                        halfSingleLinePath.push(startLineObj.subStation.slice(startStationsValue - 1,transferSta[i].staId));
                        $scope.stationsNum = Math.abs(startStationsValue - transferSta[i].staId);
                    }
                }

                var anotherIndex = [];
                for(var i = 0; i < transferSta.length; i ++) {
                    for(var j = 0;j < endLineObj.subStation.length;j++) {
                        if(endLineObj.subStation[j].staName == transferSta[i].staName) {
                            anotherIndex.push(endLineObj.subStation[j]);
                        }
                    }
                }
 

                for(var i = 0; i < anotherIndex.length; i ++) {
                    if(anotherIndex[i].staId > endStationsValue) {
                        anotherHalfSingleLinePath.push(endLineObj.subStation.slice(endStationsValue - 1,anotherIndex[i].staId).reverse());                      
                       
                                
                    }else{
                        anotherHalfSingleLinePath.push(endLineObj.subStation.slice(anotherIndex[i].staId - 1,endStationsValue));
                       
                       
                    }
                }
                for(var i = 0; i < halfSingleLinePath.length; i ++) {
                    for(var j = 0; j < anotherHalfSingleLinePath.length; j ++) {
                        if(i == j) {
                            findSingleLinePath.push(halfSingleLinePath[i].concat(anotherHalfSingleLinePath[j]));
                        }
                    }
                }
                $scope.modal.show();
                $scope.findSingleLinePath = findSingleLinePath;
                $scope.endLineValue = endLineValue;
                $scope.startLineValue = startLineValue;
                $scope.interpretation = {};
            }
        }
        
        // $scope.showList();
        var dataStart = [], //查找到所有包含初始站线路的存放数组
            dataEnd = []; //查找到所有包含终点站线路的存放数组

        var subStationStartIndex = 0, //初始站的索引
            subStationEndIndex = 0, //终点站的索引
            subStationStartIndex2 = [], // 多条换乘站中初始站的索引信息
            subStationEndIndex2 = [], // 多条换乘站中终点站的索引信息
            subStaionTransferId = [], //可换成地铁索引信息
            isSubStaionTransfer = []; //该数组内的数据为 具体可换乘站名称

        var shortPath = []; //最短路径 存放数组

        var pathInLine;

        var start = document.getElementById('start').value, //获取用户输入的初始站值
            end = document.getElementById('end').value; //获取用户输入的终点站值


        // 循环找出初始站线路的所有数组保存在 dataStart[][]
        // 通过相交节点 查找线路
        findStartLineArray(dataset, start);

        // 循环找出终点站线路的所有数组保存在 dataStart[][]
        // 通过相交节点 查找线路
        findEndLineArray(dataset, end);

        // console.log(subStationStartIndex + ' ' + subStationEndIndex);

        // 判断是否在同一条线路
        isSingleLine(dataStart, dataEnd, subStationStartIndex, subStationEndIndex, shortPath);
        // console.log('----------最终生成的最短路线-----------');
        // console.log(shortPath);


        // console.log(dataEnd[i].subStation[j].staName);
        // console.log(dataEnd[i].subStation[j].staName);
        // 需要换乘才能到达
        // 找出初始站的所在线路的所有索引
        var finalPaths = [];
        function findFinalPath(finalPaths) {
            for (var i = 0; i < dataStart.length; i++) {
                for (var o = 0; o < dataStart[i].subStation.length; o++) {
                    if (start == dataStart[i].subStation[o].staName) {
                        subStationStartIndex2.push({
                            id: dataStart[i].id,
                            subStation: dataStart[i].subStation[o]
                        });
                    }
                }
            }
            // console.log('----------初始站在该线路中的信息-----------');
            // console.log(subStationStartIndex2);

            // // 找出终点站所在线路的所有索引
            for (var j = 0; j < dataEnd.length; j++) {
                for (var n = 0; n < dataEnd[j].subStation.length; n++) {
                    if (end == dataEnd[j].subStation[n].staName) {
                        subStationEndIndex2.push({
                            id: dataEnd[j].id,
                            subStation: dataEnd[j].subStation[n]
                        });
                    }
                }
            }

            // console.log('----------终点站站在所有换乘站线路中的信息-----------');
            // console.log(subStationEndIndex2);

            // for (var i = 0; i < dataStart.length; i++) {
            //     for (var j = 0; j < dataEnd.length; j++) {
            //         for (var k = 0; k < dataStart[i].subStation.length; k++) {
            //             if (dataStart[i].subStation[k].transfer) {
            //                 for (var h = 0; h < dataStart[i].subStation[k].transfer.length; h++) {
            //                     if (dataStart[i].subStation[k].transfer[h] && dataStart[i].subStation[k].transfer[h] == dataEnd[j].id) {
            //                         isSubStaionTransfer.push({
            //                             id: dataStart[i].id,
            //                             subStation: {
            //                                 staId: dataStart[i].subStation[k].staId,
            //                                 staName: dataStart[i].subStation[k].staName,
            //                                 staWay: dataStart[i].subStation[k].staWay,
            //                                 transfer: dataStart[i].subStation[k].transfer[h]
            //                             }
            //                         });
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }

            var dataStartTransferStation = [];
            var isTransfer = [];
            for (var i = 0; i < subStationEndIndex2.length; i++) {
                for (var j = 0; j < dataStart.length; j++) {
                    for (var k = 0; k < dataStart[j].subStation.length; k++) {
                        if (dataStart[j].subStation[k].transfer) {
                            for (var m = 0; m < dataStart[j].subStation[k].transfer.length; m++) {
                                if (subStationEndIndex2[i].id == dataStart[j].subStation[k].transfer[m]) {
                                    dataStartTransferStation.push({
                                        transferId: dataStart[j].subStation[k].transfer[m],
                                        staId: dataStart[j].subStation[k].staId,
                                        staName: dataStart[j].subStation[k].staName
                                    });
                                    isTransfer.push(dataStart[j].subStation[k].staName);
                                }
                            }
                        }
                    }
                }
            }
            // console.log(isTransfer);
            // console.log('---------------');
            // console.log(dataStartTransferStation);
            var halfPath = [];
            //开始找路线 包括换乘
            for (var n = 0; n < dataStartTransferStation.length; n++) {
                halfPath[n] = [];
                // console.log('线路'+(n+1));
                for (var m = 0; m < subStationStartIndex2.length; m++) {
                    for (var i = 0; i < dataStart.length; i++) {
                        for (var j = subStationStartIndex2[m].subStation.staId - 1; j < dataStartTransferStation[n].staId; j++) {
                            console.log(dataStart[i].subStation[j].staName);
                            halfPath[n].push({
                                id: dataStart[i].id,
                                staName: dataStart[i].subStation[j].staName,
                                transferId: dataStartTransferStation[n].transferId
                            });
                        }
                    }
                }
                // console.log('换乘' + dataStartTransferStation[n].transferId + '号线');
            }

            console.log(halfPath);
            // 找出第一部分线路的最后一站保存在数组transferItem中
            var tranfserItem = [];
            for (var i = 0; i < halfPath.length; i++) {
                tranfserItem.push(halfPath[i][halfPath[i].length - 1]);
            }
            console.log(tranfserItem);
            // 通过transferItem，找出可以中终点站所在线路上的换乘的索引id
            var staIdPath = [];
            for (var k = 0; k < tranfserItem.length; k++) {
                for (var i = 0; i < dataEnd.length; i++) {
                    for (var j = 0; j < dataEnd[i].subStation.length; j++) {
                        if (tranfserItem[k].staName == dataEnd[i].subStation[j].staName && tranfserItem[k].transferId == dataEnd[i].id) {
                            staIdPath.push({
                                staId: dataEnd[i].subStation[j].staId,
                                transferId: dataEnd[i].id
                            });
                        }
                    }
                }
            }
            // var staIdPath = uniqueArray(staIdPath);
            console.log(staIdPath);
            // 找出另一半路径
            var anotherHalfPath = [];
            for (var k = 0; k < staIdPath.length; k++) {
                console.log('第' + (k + 1));
                anotherHalfPath[k] = [];
                for (var i = 0; i < dataEnd.length; i++) {
                    if (staIdPath[k].transferId == dataEnd[i].id) {
                        for (var m = 0; m < subStationEndIndex2.length; m++) {
                            if (subStationEndIndex2[m].id == staIdPath[k].transferId) {
                                var finalId = subStationEndIndex2[m].subStation.staId;
                            }
                        }
                        if (staIdPath[k].staId > finalId) {
                            for (var j = staIdPath[k].staId - 1; j >= finalId - 1; j--) {
                                console.log(dataEnd[i].subStation[j].staName);
                                anotherHalfPath[k].push({
                                    id: dataEnd[i].id,
                                    staName: dataEnd[i].subStation[j].staName,
                                    id: dataEnd[i].id
                                });
                            }
                        } else {
                            for (var j = staIdPath[k].staId - 1; j < finalId; j++) {
                                console.log(dataEnd[i].subStation[j].staName);
                                anotherHalfPath[k].push({
                                    id: dataEnd[i].id,
                                    staName: dataEnd[i].subStation[j].staName,
                                    id: dataEnd[i].id
                                });
                            }
                        }
                    }
                }
            }
            console.log(anotherHalfPath);
            // 连接两个数组 即连接两条路径
            for (var i = 0; i < halfPath.length; i++) {
                finalPaths[i] = [];
                for (var j = 0; j < anotherHalfPath.length; j++) {
                    if (i == j) {
                        finalPaths[i] = halfPath[i].concat(anotherHalfPath[j]);
                    }
                }
            }
            // console.log('最终的所有路线');
            console.log(finalPaths);
        }

        if(!startLineValue || !endLineValue) {
            if (shortPath.length) {
                $scope.modal.show();
                consoleShortPath(shortPath, pathInLine);
            } else {
                findFinalPath(finalPaths);
                $scope.modal.show();
                consoleFinalPaths(finalPaths);
            }
        }

        function consoleFinalPaths(finalPaths) {
            var path = document.getElementById('path');
            var html = "";
            for (var i = 0; i < finalPaths.length; i++) {
                html += "<div class='list card'>";
                html += "<div class='item item-avatar'>";
                html += "<img src='../img/subway.png'>";
                html += "<h2 style='font-family:'Microsoft YaHei Light UI'>乘坐" + finalPaths[i][0].id + "号线</h2>";
                html += "<p>共" + (finalPaths[i].length - 1) + "站，从左边车门下车，下车请注意安全。</p>";
                html += "</div>";
                html += "<div class='item item-body'>";
                html += "<ul class='list'>";
                var li = "";
                for (var j = 0; j < finalPaths[i].length; j++) {
                    if (j == finalPaths[i].length - 1) {
                        li += "<li class='item item-icon-left'><i class='icon ion-android-subway'></i>" + finalPaths[i][j].staName + "</li>";
                    } else {
                        if (finalPaths[i][j + 1].staName == finalPaths[i][j].staName) {
                            li += "<li class='item item-icon-left'><i class='icon ion-ios-loop-strong'></i>在" + finalPaths[i][j].staName + "换乘" + finalPaths[i][j + 1].id + "号线</li>";
                            j = j + 1;
                        } else {
                            li += "<li class='item item-icon-left'><i class='icon ion-android-subway'></i>" + finalPaths[i][j].staName + "-></li>";
                        }
                    }
                }
                html += li + "</ul><p><a class='subdued'>车站信息：ATM" + (i + 1) + "个，共" + i + "个出入口，附近有如家、7天多家连锁酒店</a></p></div></div>";

            }
            path.innerHTML = html;
        }
        // 判断是否为同一条线路，如果为同一条线路，直接在该线路上搜索
        function isSingleLine(dataStart, dataEnd, subStationStartIndex, subStationEndIndex, shortPath) {
            for (var i = 0; i < dataStart.length; i++) {
                for (var j = 0; j < dataEnd.length; j++) {
                    if (dataStart[i].id == dataEnd[j].id) {
                        pathInLine = dataEnd[j].id;
                        for (var m = 0; m < dataStart[i].subStation.length; m++) {
                            if (start == dataStart[i].subStation[m].staName) {
                                subStationStartIndex = dataStart[i].subStation[m].staId - 1;
                            } else if (end == dataStart[i].subStation[m].staName) {
                                subStationEndIndex = dataStart[i].subStation[m].staId - 1;
                            }
                        }

                        console.log('起始站的索引值：' + subStationStartIndex + '，终点站的索引值：' + subStationEndIndex);

                        if (subStationStartIndex < subStationEndIndex) {
                            for (var k = subStationStartIndex; k <= subStationEndIndex; k++) {
                                shortPath.push(dataStart[i].subStation[k]);
                            }
                        } else {
                            for (var l = subStationStartIndex; l >= subStationEndIndex; l--) {
                                shortPath.push(dataStart[i].subStation[l]);
                            }
                        }
                    }
                }
            }
        }
        console.log(shortPath);

        // 找出出发站所在线路数组
        function findStartLineArray(dataset, start) {
            for (var i = 0; i < dataset.length; i++) {
                for (var j = 0; j < dataset[i].subStation.length; j++) {
                    if (start == dataset[i].subStation[j].staName) {
                        console.log(dataset[i]);
                        // 存放到数组 dataStart
                        dataStart.push(dataset[i]);
                        console.log('----------每一个dataStart-----------');
                        console.log(dataStart);
                    }
                }
            }
            console.log('----------dataStart-----------');
            console.log(dataStart);
        }
        // 找出终点站所在线路数组
        function findEndLineArray(dataset, end) {
            for (var i = 0; i < dataset.length; i++) {
                for (var j = 0; j < dataset[i].subStation.length; j++) {
                    if (end == dataset[i].subStation[j].staName) {
                        console.log(dataset[i]);
                        dataEnd.push(dataset[i]);
                        console.log('----------每一个dataEnd-----------');
                        console.log(dataEnd);
                    }
                }
            }
            console.log('----------dataEnd-----------');
            console.log(dataEnd);
        }
        // 打印输出线路
        function consoleShortPath(shortPath, pathInLine) {
            console.log('乘坐' + pathInLine + '号线，共' + shortPath.length + '站');
            var path = document.getElementById('path');
            var html = "<div class='list card'>";
            html += "<div class='item item-avatar'>";
            html += "<img src='../img/subway.png'>";
            html += "<h2 style='font-family:'Microsoft YaHei Light UI'>乘坐" + pathInLine + "号线</h2>";
            html += "<p>共" + (shortPath.length - 1) + "站，从左边车门下车，下车请注意安全。</p>";
            html += "</div>";
            html += "<div class='item item-body'>";
            html += "<ul class='list'>";
            var li = "";
            for (var x = 0; x < shortPath.length; x++) {
                if (x == shortPath.length - 1) {
                    console.log(shortPath[x].staName);
                    li += "<li class='item item-icon-left'><i class='icon ion-android-subway'></i>" + shortPath[x].staName + "</li>";
                } else {
                    console.log(shortPath[x].staName + '->');
                    li += "<li class='item item-icon-left'><i class='icon ion-android-subway'></i>" + shortPath[x].staName + "-></li>";
                }
            }
            html += li + "</ul><p><a class='subdued'>车站信息：ATM，共三个出入口，附近有如家、7天多家连锁酒店</a></p></div></div>";
            path.innerHTML = html;
        }
    };
    $scope.showList = function() {
        // var list = document.getElementsByClassName('the-way');
        alert(1111);
    }
    //自动选择路线多条路线输出
    $scope.consoleSingleShortPath = function(scope,findSingleLinePath,stationsNum,endLineValue,startLineValue){         
        var path = document.getElementById('path');
        var html = "";
        for(var i = 0; i < findSingleLinePath.length; i++){
            html += "<div class='list card'>";
            html += "<div class='item item-avatar the-way'>";
            html += "<img src='../img/subway.png'>";
            html += "<h2 style='font-family:'Microsoft YaHei Light UI'>乘坐" + startLineValue + "号线</h2>";
            html += "<p>共" + (findSingleLinePath[i].length - 1) + "站</p>";
            html += "</div>";
            html += "<div class='item item-body'>";
            html += "<ul class='list'>";
            var li = "";
            for (var x = 0; x < findSingleLinePath[i].length; x++) {
                if (x == findSingleLinePath.length - 1) {
                    console.log(findSingleLinePath[i][x].staName);
                    li += "<li class='item item-icon-left'><i class='icon ion-android-subway'></i>" + findSingleLinePath[i][x].staName + "</li>";
                } else {
                    // if (findSingleLinePath[i][x].staName == findSingleLinePath[i][x+1].staName) {
                    //     li += "<li class='item item-icon-left'><i class='icon ion-ios-loop-strong'></i>在" + findSingleLinePath[i][x].staName + "换乘" + endLineValue + "号线</li>";
                    // } else {
                        li += "<li class='item item-icon-left'><i class='icon ion-android-subway'></i>" + findSingleLinePath[i][x].staName + "-></li>";
                    // }

                }
            }
            html += li + "</ul><p><a class='subdued'>车站信息：ATM，共三个出入口，附近有如家、7天多家连锁酒店</a></p></div><div ng-click='showList()'><button class='button button-block icon-right ion-chevron-down button-stable show-list'>展开具体路线</button></div></div>";
        }
        var el = $compile(html)(scope);
        console.log(el);
        path.innerHTML = el[0].innerHTML;
    }
    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });
    $scope.isShow = false;
    $scope.wf = function(){
        $scope.isShow = !$scope.isShow;
    }
    $scope.dataset = [{
        id: 1,
        subName: '一号线',
        subStation: [{
            staId: 1,
            staName: '莘庄',
            staWay: 0,
            transfer: [5]
        }, {
            staId: 2,
            staName: '外环路',
            staWay: 1.320
        }, {
            staId: 3,
            staName: '莲花路',
            staWay: 2.7
        }, {
            staId: 4,
            staName: '锦江乐园',
            staWay: 4.63
        }, {
            staId: 5,
            staName: '上海南站',
            staWay: 7.04,
            transfer: [3]
        }, {
            staId: 6,
            staName: '漕宝路',
            staWay: 8.51,
            transfer: [12]
        }, {
            staId: 7,
            staName: '上海体育馆',
            staWay: 10.09,
            transfer: [4]
        }, {
            staId: 8,
            staName: '徐家汇',
            staWay: 11.44,
            transfer: [9, 11]
        }, {
            staId: 9,
            staName: '衡山路',
            staWay: 12.86
        }, {
            staId: 10,
            staName: '常熟路',
            staWay: 14,
            transfer: [7]
        }, {
            staId: 11,
            staName: '陕西南路',
            staWay: 15.17,
            transfer: [10, 12]
        }, {
            staId: 12,
            staName: '黄陂南路',
            staWay: 16.86
        }, {
            staId: 13,
            staName: '人民广场',
            staWay: 18.44,
            transfer: [2, 8]
        }, {
            staId: 14,
            staName: '新闸路',
            staWay: 19.49,
            transfer: [12, 13]
        }, {
            staId: 15,
            staName: '汉中路',
            staWay: 20.55
        }, {
            staId: 16,
            staName: '上海火车站',
            staWay: 21.37,
            transfer: [3, 4]
        }, {
            staId: 17,
            staName: '中山北路',
            staWay: 22.74
        }, {
            staId: 18,
            staName: '延长路',
            staWay: 24.19
        }, {
            staId: 19,
            staName: '上海马戏城',
            staWay: 25.15
        }, {
            staId: 20,
            staName: '汶水路',
            staWay: 26.66
        }, {
            staId: 21,
            staName: '彭浦新村',
            staWay: 28.17
        }, {
            staId: 22,
            staName: '共康路',
            staWay: 29.79
        }, {
            staId: 23,
            staName: '通河新村',
            staWay: 31.12
        }, {
            staId: 24,
            staName: '呼兰路',
            staWay: 32.17
        }, {
            staId: 25,
            staName: '共富新村',
            staWay: 33.95
        }, {
            staId: 26,
            staName: '宝安公路',
            staWay: 35.59
        }, {
            staId: 27,
            staName: '友谊西路',
            staWay: 36.91
        }, {
            staId: 28,
            staName: '富锦路',
            staWay: 38.18
        }]
    }, {
        id: 2,
        subName: '二号线',
        subStation: [{
            staId: 1,
            staName: '徐泾东',
            staWay: 0
        }, {
            staId: 2,
            staName: '虹桥火车站',
            staWay: 2.284,
            transfer: [10]
        }, {
            staId: 3,
            staName: '虹桥2号航站楼',
            staWay: 3.292,
            transfer: [10]
        }, {
            staId: 4,
            staName: '淞虹路',
            staWay: 9.097
        }, {
            staId: 5,
            staName: '北新泾',
            staWay: 10.454
        }, {
            staId: 6,
            staName: '威宁路',
            staWay: 11.698
        }, {
            staId: 7,
            staName: '娄山关路',
            staWay: 13.421
        }, {
            staId: 8,
            staName: '中山公园',
            staWay: 14.819,
            transfer: [3, 4]
        }, {
            staId: 9,
            staName: '江苏路',
            staWay: 16.307,
            transfer: [11]
        }, {
            staId: 10,
            staName: '静安寺',
            staWay: 17.8,
            transfer: [7]
        }, {
            staId: 11,
            staName: '南京西路',
            staWay: 19.267,
            transfer: [12, 13]
        }, {
            staId: 12,
            staName: '人民广场',
            staWay: 20.765,
            transfer: [1, 8]
        }, {
            staId: 13,
            staName: '南京东路',
            staWay: 21.721,
            transfer: [10]
        }, {
            staId: 14,
            staName: '陆家嘴',
            staWay: 23.398
        }, {
            staId: 15,
            staName: '东昌路',
            staWay: 24.82
        }, {
            staId: 16,
            staName: '世纪大道',
            staWay: 25.987,
            transfer: [4, 6, 9]
        }, {
            staId: 17,
            staName: '上海科技馆',
            staWay: 27.886
        }, {
            staId: 18,
            staName: '世纪公园',
            staWay: 29.204
        }, {
            staId: 19,
            staName: '龙阳路',
            staWay: 30.187,
            transfer: [7, 16]
        }, {
            staId: 20,
            staName: '张江高科',
            staWay: 32.786
        }, {
            staId: 21,
            staName: '金科路',
            staWay: 34.40
        }, {
            staId: 22,
            staName: '广兰路',
            staWay: 36.04
        }]
    }, {
        id: 3,
        subName: '三号线',
        subStation: [{
            staId: 1,
            staName: '上海南站',
            staWay: 0,
            transfer: [1]
        }, {
            staId: 2,
            staName: '石龙路',
            staWay: 0
        }, {
            staId: 3,
            staName: '龙漕路',
            staWay: 0,
            transfer: [12]
        }, {
            staId: 4,
            staName: '漕溪路',
            staWay: 0
        }, {
            staId: 5,
            staName: '宜山路',
            staWay: 0,
            transfer: [4, 9]
        }, {
            staId: 6,
            staName: '虹桥路',
            staWay: 0,
            transfer: [4, 10]
        }, {
            staId: 7,
            staName: '延安西路',
            staWay: 0,
            transfer: [4]
        }, {
            staId: 8,
            staName: '中山公园',
            staWay: 0,
            transfer: [2, 4]
        }, {
            staId: 9,
            staName: '金沙江路',
            staWay: 0,
            transfer: [4, 13]
        }, {
            staId: 10,
            staName: '曹杨路',
            staWay: 0,
            transfer: [4, 11]
        }, {
            staId: 11,
            staName: '镇坪路',
            staWay: 0,
            transfer: [4, 7]
        }, {
            staId: 12,
            staName: '中潭路',
            staWay: 0,
            transfer: [4]
        }, {
            staId: 13,
            staName: '上海火车站',
            staWay: 0,
            transfer: [1, 4]
        }, {
            staId: 14,
            staName: '宝山路',
            staWay: 0,
            transfer: [4]
        }, {
            staId: 15,
            staName: '东宝兴路',
            staWay: 0
        }, {
            staId: 16,
            staName: '虹口足球场',
            staWay: 0,
            transfer: [8]
        }, {
            staId: 17,
            staName: '赤峰路',
            staWay: 0
        }, {
            staId: 18,
            staName: '大柏树',
            staWay: 0
        }, {
            staId: 19,
            staName: '江湾镇',
            staWay: 0
        }, {
            staId: 20,
            staName: '殷高西路',
            staWay: 0
        }, {
            staId: 21,
            staName: '长江南路',
            staWay: 0
        }, {
            staId: 22,
            staName: '淞发路',
            staWay: 0
        }, {
            staId: 23,
            staName: '张华浜',
            staWay: 0
        }, {
            staId: 24,
            staName: '淞滨路',
            staWay: 0
        }, {
            staId: 25,
            staName: '水产路',
            staWay: 0
        }, {
            staId: 26,
            staName: '宝杨路',
            staWay: 0
        }, {
            staId: 27,
            staName: '友谊路',
            staWay: 0
        }, {
            staId: 28,
            staName: '铁力路',
            staWay: 0
        }, {
            staId: 29,
            staName: '江杨北路',
            staWay: 0
        }]
    }, {
        id: 4,
        subName: '四号线',
        subStation: [{
            staId: 1,
            staName: '宜山路',
            staWay: 0,
            transfer: [3, 9]
        }, {
            staId: 2,
            staName: '虹桥路',
            staWay: 0,
            transfer: [3, 10]
        }, {
            staId: 3,
            staName: '延安西路',
            staWay: 0,
            transfer: [3]
        }, {
            staId: 4,
            staName: '中山公园',
            staWay: 0,
            transfer: [2, 3]
        }, {
            staId: 5,
            staName: '金沙江路',
            staWay: 0,
            transfer: [3, 13]
        }, {
            staId: 6,
            staName: '曹杨路',
            staWay: 0,
            transfer: [3, 11]
        }, {
            staId: 7,
            staName: '镇坪路',
            staWay: 0,
            transfer: [3, 7]
        }, {
            staId: 8,
            staName: '中潭路',
            staWay: 0,
            transfer: [3]
        }, {
            staId: 9,
            staName: '上海火车站',
            staWay: 0,
            transfer: [1, 3]
        }, {
            staId: 10,
            staName: '宝山路',
            staWay: 0,
            transfer: [3]
        }, {
            staId: 11,
            staName: '海伦路',
            staWay: 0,
            transfer: [10]
        }, {
            staId: 12,
            staName: '临平路',
            staWay: 0
        }, {
            staId: 13,
            staName: '大连路',
            staWay: 0,
            transfer: [12]
        }, {
            staId: 14,
            staName: '杨浦区',
            staWay: 0
        }, {
            staId: 15,
            staName: '杨树浦路',
            staWay: 0
        }, {
            staId: 16,
            staName: '浦东大道',
            staWay: 0
        }, {
            staId: 17,
            staName: '世纪大道',
            staWay: 0,
            transfer: [2, 6, 9]
        }, {
            staId: 18,
            staName: '浦电路',
            staWay: 0
        }, {
            staId: 19,
            staName: '蓝村路',
            staWay: 0,
            transfer: [6]
        }, {
            staId: 20,
            staName: '塘桥',
            staWay: 0
        }, {
            staId: 21,
            staName: '南浦大桥',
            staWay: 0
        }, {
            staId: 22,
            staName: '西藏南路',
            staWay: 0,
            transfer: [8]
        }, {
            staId: 23,
            staName: '鲁班路',
            staWay: 0
        }, {
            staId: 24,
            staName: '大木桥路',
            staWay: 0,
            transfer: [12]
        }, {
            staId: 25,
            staName: '东安路',
            staWay: 0,
            transfer: [7]
        }, {
            staId: 26,
            staName: '上海体育场',
            staWay: 0
        }, {
            staId: 27,
            staName: '上海体育馆',
            staWay: 0,
            transfer: [1]
        }, ]
    }, {
        id: 5,
        subName: '五号线',
        subStation: [{
            staId: 1,
            staName: '莘庄',
            staWay: 0,
            transfer: [1]
        }, {
            staId: 2,
            staName: '春申路',
            staWay: 1.588
        }, {
            staId: 3,
            staName: '银都路',
            staWay: 2.663
        }, {
            staId: 4,
            staName: '颛桥',
            staWay: 5.42
        }, {
            staId: 5,
            staName: '北桥',
            staWay: 7.971
        }, {
            staId: 6,
            staName: '剑川路',
            staWay: 10.147
        }, {
            staId: 7,
            staName: '东川路',
            staWay: 11.116
        }, {
            staId: 8,
            staName: '金平路',
            staWay: 12.575
        }, {
            staId: 9,
            staName: '华宁路',
            staWay: 14.062
        }, {
            staId: 10,
            staName: '文井路',
            staWay: 15.508
        }, {
            staId: 11,
            staName: '闵行开发区',
            staWay: 16.613
        }]
    }, {
        id: 6,
        subName: '六号线',
        subStation: [{
            staId: 1,
            staName: '港城路',
            staWay: 0
        }, {
            staId: 2,
            staName: '外高桥保税区北',
            staWay: 1.618
        }, {
            staId: 3,
            staName: '航津路',
            staWay: 3.154
        }, {
            staId: 4,
            staName: '外高桥保税区南',
            staWay: 4.86
        }, {
            staId: 5,
            staName: '洲海路',
            staWay: 6.897
        }, {
            staId: 6,
            staName: '五洲大道',
            staWay: 7.973
        }, {
            staId: 7,
            staName: '东靖路',
            staWay: 9.291
        }, {
            staId: 8,
            staName: '巨峰路',
            staWay: 10.401,
            transfer: [12]
        }, {
            staId: 9,
            staName: '五莲路',
            staWay: 11.362
        }, {
            staId: 10,
            staName: '博兴路',
            staWay: 12.307
        }, {
            staId: 12,
            staName: '金桥路',
            staWay: 13.162
        }, {
            staId: 12,
            staName: '云山路',
            staWay: 14.319
        }, {
            staId: 13,
            staName: '德平路',
            staWay: 15.3
        }, {
            staId: 14,
            staName: '北洋泾路',
            staWay: 16.631
        }, {
            staId: 15,
            staName: '民生路',
            staWay: 17.548
        }, {
            staId: 16,
            staName: '源深体育中心',
            staWay: 18.455
        }, {
            staId: 17,
            staName: '世纪大道',
            staWay: 19.338,
            transfer: [2, 4, 9]
        }, {
            staId: 18,
            staName: '浦电路',
            staWay: 20.379
        }, {
            staId: 19,
            staName: '蓝村路',
            staWay: 21.339,
            transfer: [4]
        }, {
            staId: 20,
            staName: '上海儿童医学中心',
            staWay: 22.391
        }, {
            staId: 21,
            staName: '临沂新村',
            staWay: 23.675
        }, {
            staId: 22,
            staName: '高科西路',
            staWay: 24.853,
            transfer: [7]
        }, {
            staId: 23,
            staName: '东明路',
            staWay: 26.308
        }, {
            staId: 24,
            staName: '高青路',
            staWay: 27.819
        }, {
            staId: 25,
            staName: '华夏西路',
            staWay: 29.233
        }, {
            staId: 26,
            staName: '上南路',
            staWay: 30.026
        }, {
            staId: 27,
            staName: '灵岩南路',
            staWay: 31.118
        }, {
            staId: 28,
            staName: '东方体育中心',
            staWay: 32.643,
            transfer: [8, 11]
        }]
    }, {
        id: 7,
        subName: '七号线',
        subStation: [{
            staId: 1,
            staName: "美兰湖",
            staWay: 0
        }, {
            staId: 2,
            staName: "罗南新村",
            staWay: 1.347
        }, {
            staId: 3,
            staName: "潘广路",
            staWay: 4.177
        }, {
            staId: 4,
            staName: "刘行",
            staWay: 5.157
        }, {
            staId: 5,
            staName: "顾村公园",
            staWay: 6.857
        }, {
            staId: 6,
            staName: "祁华路",
            staWay: 9.566
        }, {
            staId: 7,
            staName: "上海大学",
            staWay: 11.257
        }, {
            staId: 8,
            staName: "南陈路",
            staWay: 12.194
        }, {
            staId: 9,
            staName: "上大路",
            staWay: 13.537
        }, {
            staId: 10,
            staName: "场中路",
            staWay: 14.883
        }, {
            staId: 11,
            staName: "大场镇",
            staWay: 16.115
        }, {
            staId: 12,
            staName: "行知路",
            staWay: 17.152
        }, {
            staId: 13,
            staName: "大华三路",
            staWay: 18.443
        }, {
            staId: 14,
            staName: "新村路",
            staWay: 19.558
        }, {
            staId: 15,
            staName: "岚皋路",
            staWay: 20.402
        }, {
            staId: 16,
            staName: "镇坪路",
            staWay: 21.989,
            transfer: [3, 4]
        }, {
            staId: 17,
            staName: "长寿路",
            staWay: 23.004,
            transfer: [13]
        }, {
            staId: 18,
            staName: "昌平路",
            staWay: 23.835
        }, {
            staId: 19,
            staName: "静安寺",
            staWay: 25.156,
            transfer: [2]
        }, {
            staId: 20,
            staName: "常熟路",
            staWay: 26.247,
            transfer: [1]
        }, {
            staId: 21,
            staName: "肇嘉浜路",
            staWay: 27.932,
            transfer: [9]
        }, {
            staId: 22,
            staName: "东安路",
            staWay: 28.911,
            transfer: [4]
        }, {
            staId: 23,
            staName: "龙华中路",
            staWay: 29.639,
            transfer: [12]
        }, {
            staId: 24,
            staName: "后滩",
            staWay: 31.886
        }, {
            staId: 25,
            staName: "长清路",
            staWay: 33.149
        }, {
            staId: 26,
            staName: "耀华路",
            staWay: 34.075,
            transfer: [8]
        }, {
            staId: 27,
            staName: "云台路",
            staWay: 34.778
        }, {
            staId: 28,
            staName: "高科西路",
            staWay: 35.851,
            transfer: [6]
        }, {
            staId: 29,
            staName: "杨高南路",
            staWay: 37.354
        }, {
            staId: 30,
            staName: "锦绣路",
            staWay: 38.767
        }, {
            staId: 31,
            staName: "芳华路",
            staWay: 40.21
        }, {
            staId: 32,
            staName: "龙阳路",
            staWay: 42.05,
            transfer: [2, 16]
        }, {
            staId: 333,
            staName: "花木路",
            staWay: 43.425
        }]
    }, {
        id: 8,
        subName: '八号线',
        subStation: [{
            staId: 1,
            staName: '市光路',
            staWay: 0
        }, {
            staId: 2,
            staName: '嫩江路',
            staWay: 0.882
        }, {
            staId: 3,
            staName: '翔殷路',
            staWay: 1.962
        }, {
            staId: 4,
            staName: '黄兴公园',
            staWay: 3.01
        }, {
            staId: 5,
            staName: '延吉中路',
            staWay: 39.36
        }, {
            staId: 6,
            staName: '黄兴路',
            staWay: 5.209
        }, {
            staId: 7,
            staName: '江浦路',
            staWay: 6.258
        }, {
            staId: 8,
            staName: '鞍山新村',
            staWay: 7.136
        }, {
            staId: 9,
            staName: '四平路',
            staWay: 7.964,
            transfer: [10]
        }, {
            staId: 10,
            staName: '曲阳路',
            staWay: 9.021
        }, {
            staId: 11,
            staName: '虹口足球场',
            staWay: 10.501,
            transfer: [3]
        }, {
            staId: 12,
            staName: '西藏北路',
            staWay: 11.778
        }, {
            staId: 13,
            staName: '中兴路',
            staWay: 13.004
        }, {
            staId: 14,
            staName: '曲阜路',
            staWay: 14.239,
            transfer: [12]
        }, {
            staId: 15,
            staName: '人民广场',
            staWay: 15.32,
            transfer: [1, 2]
        }, {
            staId: 16,
            staName: '大世界',
            staWay: 16.081
        }, {
            staId: 17,
            staName: '老西门',
            staWay: 17.085,
            transfer: [10]
        }, {
            staId: 18,
            staName: '陆家浜路',
            staWay: 17.910,
            transfer: [9]
        }, {
            staId: 19,
            staName: '西藏南路',
            staWay: 19.073,
            transfer: [4]
        }, {
            staId: 20,
            staName: '中华艺术宫',
            staWay: 21.114
        }, {
            staId: 21,
            staName: '耀华路',
            staWay: 21.858,
            transfer: [7]
        }, {
            staId: 22,
            staName: '成山路',
            staWay: 22.806
        }, {
            staId: 23,
            staName: '杨思',
            staWay: 24.004
        }, {
            staId: 24,
            staName: '东方体育中心',
            staWay: 25.597,
            transfer: [6, 11]
        }, {
            staId: 25,
            staName: '凌兆新村',
            staWay: 26.917
        }, {
            staId: 26,
            staName: '芦恒路',
            staWay: 29.65
        }, {
            staId: 27,
            staName: '浦江镇',
            staWay: 32.105
        }, {
            staId: 28,
            staName: '江月路',
            staWay: 33.528
        }, {
            staId: 29,
            staName: '联航路',
            staWay: 34.578
        }, {
            staId: 30,
            staName: '沈杜公路',
            staWay: 36.02
        }]
    }, {
        id: 9,
        subName: '九号线',
        subStation: [{
            staId: 1,
            staName: '松江南站',
            staWay: 0
        }, {
            staId: 2,
            staName: '醉白池',
            staWay: 1.8
        }, {
            staId: 3,
            staName: '松江体育中心',
            staWay: 3.5
        }, {
            staId: 4,
            staName: '松江新城',
            staWay: 5.1
        }, {
            staId: 5,
            staName: '松江大学城',
            staWay: 7.742
        }, {
            staId: 6,
            staName: '洞泾',
            staWay: 11.123
        }, {
            staId: 7,
            staName: '佘山',
            staWay: 13.328
        }, {
            staId: 8,
            staName: '泗泾',
            staWay: 17.196
        }, {
            staId: 9,
            staName: '九亭',
            staWay: 23.442
        }, {
            staId: 10,
            staName: '中春路',
            staWay: 25.705
        }, {
            staId: 11,
            staName: '七宝',
            staWay: 27.01
        }, {
            staId: 12,
            staName: '星中路',
            staWay: 28.89
        }, {
            staId: 13,
            staName: '合川路',
            staWay: 30.746
        }, {
            staId: 14,
            staName: '漕河泾开发区',
            staWay: 32.081
        }, {
            staId: 15,
            staName: '桂林路',
            staWay: 34.113
        }, {
            staId: 16,
            staName: '宜山路',
            staWay: 35.8,
            transfer: [3, 4]
        }, {
            staId: 17,
            staName: '徐家汇',
            staWay: 37.305,
            transfer: [1, 11]
        }, {
            staId: 18,
            staName: '肇嘉浜路',
            staWay: 38.694,
            transfer: [7]
        }, {
            staId: 19,
            staName: '嘉善路',
            staWay: 39.757,
            transfer: [12]
        }, {
            staId: 20,
            staName: '打浦桥',
            staWay: 40.632
        }, {
            staId: 21,
            staName: '马当路',
            staWay: 41.474,
            transfer: [13]
        }, {
            staId: 22,
            staName: '陆家浜路',
            staWay: 42.419,
            transfer: [8]
        }, {
            staId: 23,
            staName: '小南门',
            staWay: 43.894
        }, {
            staId: 24,
            staName: '商城路',
            staWay: 46.292
        }, {
            staId: 25,
            staName: '世纪大道',
            staWay: 47.271,
            transfer: [2, 4, 6]
        }, {
            staId: 26,
            staName: '杨高中路',
            staWay: 49.705
        }]
    }, {
        id: 10,
        subName: '十号线',
        subStation: [{
            staId: 1,
            staName: '新江湾城',
            staWay: 0
        }, {
            staId: 2,
            staName: '殷高东路',
            staWay: 0.75
        }, {
            staId: 3,
            staName: '三门路',
            staWay: 1.8
        }, {
            staId: 4,
            staName: '江湾体育场',
            staWay: 3.0
        }, {
            staId: 5,
            staName: '五角场',
            staWay: 3.6
        }, {
            staId: 6,
            staName: '国权路',
            staWay: 4.6
        }, {
            staId: 7,
            staName: '同济大学',
            staWay: 5.5
        }, {
            staId: 8,
            staName: '四平路',
            staWay: 6.5,
            transfer: [8]
        }, {
            staId: 9,
            staName: '邮电新村',
            staWay: 7.5
        }, {
            staId: 10,
            staName: '海伦路',
            staWay: 8.6,
            transfer: [4]
        }, {
            staId: 11,
            staName: '四川北路',
            staWay: 9.6
        }, {
            staId: 12,
            staName: '天潼路',
            staWay: 10.5,
            transfer: [12]
        }, {
            staId: 13,
            staName: '南京东路',
            staWay: 11.2,
            transfer: [2]
        }, {
            staId: 14,
            staName: '豫园',
            staWay: 12.4
        }, {
            staId: 15,
            staName: '老西门',
            staWay: 13.8,
            transfer: [8]
        }, {
            staId: 16,
            staName: '新天地',
            staWay: 14.6,
            transfer: [13]
        }, {
            staId: 17,
            staName: '陕西南路',
            staWay: 16.3,
            transfer: [1, 12]
        }, {
            staId: 18,
            staName: '上海图书馆',
            staWay: 17.9
        }, {
            staId: 19,
            staName: '交通大学',
            staWay: 19.0,
            transfer: [11]
        }, {
            staId: 20,
            staName: '虹桥路',
            staWay: 20.3,
            transfer: [3, 4]
        }, {
            staId: 21,
            staName: '宋园路',
            staWay: 21.4
        }, {
            staId: 22,
            staName: '伊犁路',
            staWay: 22.1
        }, {
            staId: 23,
            staName: '水城路',
            staWay: 23.3
        }, {
            staId: 24,
            staName: '龙溪路',
            staWay: 24.7
        }, {
            staId: 25,
            staName: '上海动物园',
            staWay: 25.9
        }, {
            staId: 26,
            staName: '虹桥1号航站楼',
            staWay: 27.9
        }, {
            staId: 27,
            staName: '虹桥2号航站楼',
            staWay: 29.8,
            transfer: [2]
        }, {
            staId: 28,
            staName: '虹桥火车站',
            staWay: 30.4,
            transfer: [2]
        }, {
            staId: 29,
            staName: '龙柏新村',
            staWay: 27.0
        }, {
            staId: 30,
            staName: '紫藤路',
            staWay: 28.3
        }, {
            staId: 31,
            staName: '航中路站',
            staWay: 29.3
        }]
    }, {
        id: 11,
        subName: '十一号线',
        subStation: [{
            staId: 1,
            staName: '迪士尼',
            staWay: 0
        }, {
            staId: 2,
            staName: '康新公路',
            staWay: 0
        }, {
            staId: 3,
            staName: '秀沿路',
            staWay: 0
        }, {
            staId: 4,
            staName: '罗山路',
            staWay: 0,
            transfer: [16]
        }, {
            staId: 5,
            staName: '御桥',
            staWay: 2.7
        }, {
            staId: 6,
            staName: '浦三路',
            staWay: 5.7
        }, {
            staId: 7,
            staName: '三林东',
            staWay: 7.3
        }, {
            staId: 8,
            staName: '三林',
            staWay: 8.5
        }, {
            staId: 9,
            staName: '东方体育中心',
            staWay: 11.8,
            transfer: [6, 8]
        }, {
            staId: 10,
            staName: '龙耀路',
            staWay: 14
        }, {
            staId: 11,
            staName: '云锦路',
            staWay: 14.8
        }, {
            staId: 12,
            staName: '龙华',
            staWay: 15.8,
            transfer: [12]
        }, {
            staId: 13,
            staName: '上海游泳馆',
            staWay: 17.2
        }, {
            staId: 14,
            staName: '徐家汇',
            staWay: 19,
            transfer: [1, 9]
        }, {
            staId: 15,
            staName: '交通大学',
            staWay: 19.9,
            transfer: [10]
        }, {
            staId: 16,
            staName: '江苏路',
            staWay: 22,
            transfer: [2]
        }, {
            staId: 17,
            staName: '隆德路',
            staWay: 23.358,
            transfer: [13]
        }, {
            staId: 18,
            staName: '曹杨路',
            staWay: 24.365,
            transfer: [3, 4]
        }, {
            staId: 19,
            staName: '枫桥路',
            staWay: 25.091
        }, {
            staId: 20,
            staName: '真如',
            staWay: 26.21
        }, {
            staId: 21,
            staName: '上海西站',
            staWay: 27.788
        }, {
            staId: 22,
            staName: '李子园',
            staWay: 29.098
        }, {
            staId: 23,
            staName: '祁连山路',
            staWay: 30.478
        }, {
            staId: 24,
            staName: '武威路',
            staWay: 31.756
        }, {
            staId: 25,
            staName: '桃浦新村',
            staWay: 33.393
        }, {
            staId: 26,
            staName: '南翔',
            staWay: 36.63
        }, {
            staId: 27,
            staName: '马陆',
            staWay: 42.476
        }, {
            staId: 28,
            staName: '嘉定新城',
            staWay: 44.363
        }, {
            staId: 29,
            staName: '白银路',
            staWay: 47.259
        }, {
            staId: 30,
            staName: '嘉定西',
            staWay: 51.178
        }, {
            staId: 31,
            staName: '嘉定北',
            staWay: 53.122
        }, {
            staId: 32,
            staName: '上海赛车场',
            staWay: 47.436
        }, {
            staId: 33,
            staName: '昌吉东路',
            staWay: 52.951
        }, {
            staId: 34,
            staName: '上海汽车城',
            staWay: 55.169
        }, {
            staId: 35,
            staName: '安亭',
            staWay: 56.98
        }, {
            staId: 36,
            staName: '兆丰路',
            staWay: 58.08
        }, {
            staId: 37,
            staName: '光明路',
            staWay: 61.38
        }, {
            staId: 38,
            staName: '花桥',
            staWay: 62.68
        }]
    }, {
        id: 12,
        subName: "十二号线",
        subStation: [{
            staId: 1,
            staName: '金海路站',
            staWay: 0
        }, {
            staId: 2,
            staName: '申江路站',
            staWay: 0
        }, {
            staId: 3,
            staName: '金京路站',
            staWay: 0
        }, {
            staId: 4,
            staName: '杨高北路站',
            staWay: 0
        }, {
            staId: 5,
            staName: '巨峰路站',
            staWay: 0,
            transfer: [6]
        }, {
            staId: 6,
            staName: '东陆路站',
            staWay: 0
        }, {
            staId: 7,
            staName: '复兴岛站',
            staWay: 0
        }, {
            staId: 8,
            staName: '爱国路站',
            staWay: 0
        }, {
            staId: 9,
            staName: '隆昌路站',
            staWay: 0
        }, {
            staId: 10,
            staName: '宁国路站',
            staWay: 0
        }, {
            staId: 11,
            staName: '江浦公园站',
            staWay: 0
        }, {
            staId: 12,
            staName: '大连路站',
            staWay: 0,
            transfer: [4]
        }, {
            staId: 13,
            staName: '提篮桥站',
            staWay: 0
        }, {
            staId: 14,
            staName: '国际客运中心站',
            staWay: 0
        }, {
            staId: 15,
            staName: '天潼路站',
            staWay: 0,
            transfer: [10]
        }, {
            staId: 16,
            staName: '曲阜路站',
            staWay: 0,
            transfer: [8]
        }, {
            staId: 17,
            staName: '汉中路站',
            staWay: 0,
            transfer: [1, 13]
        }, {
            staId: 18,
            staName: '南京西路站',
            staWay: 0,
            transfer: [2, 13]
        }, {
            staId: 19,
            staName: '陕西南路站',
            staWay: 0,
            transfer: [1, 10]
        }, {
            staId: 20,
            staName: '嘉善路站',
            staWay: 0,
            transfer: [9]
        }, {
            staId: 21,
            staName: '大木桥路站',
            staWay: 0,
            transfer: [11]
        }, {
            staId: 22,
            staName: '龙华中路站',
            staWay: 0
        }, {
            staId: 23,
            staName: '龙华站',
            staWay: 0,
            transfer: [11]
        }, {
            staId: 24,
            staName: '龙漕路站',
            staWay: 0,
            transfer: [3]
        }, {
            staId: 25,
            staName: '漕宝路站',
            staWay: 0,
            transfer: [1]
        }, {
            staId: 26,
            staName: '桂林公园站',
            staWay: 0
        }, {
            staId: 27,
            staName: '虹漕路站',
            staWay: 0
        }, {
            staId: 28,
            staName: '虹梅路站',
            staWay: 0
        }, {
            staId: 29,
            staName: '东兰路站',
            staWay: 0
        }, {
            staId: 30,
            staName: '顾戴路站',
            staWay: 0
        }, {
            staId: 31,
            staName: '虹莘路站',
            staWay: 0
        }, {
            staId: 32,
            staName: '七莘路站',
            staWay: 0
        }]
    }, {
        id: 13,
        subName: '十三号线',
        subStation: [{
            staId: 1,
            staName: '金运路站',
            staWay: 0
        }, {
            staId: 2,
            staName: '金沙江西路站',
            staWay: 0
        }, {
            staId: 3,
            staName: '丰庄站',
            staWay: 0
        }, {
            staId: 4,
            staName: '祁连山南路站',
            staWay: 0
        }, {
            staId: 5,
            staName: '真北路站',
            staWay: 0
        }, {
            staId: 6,
            staName: '大渡河路站',
            staWay: 0
        }, {
            staId: 7,
            staName: '金沙江路站',
            staWay: 0,
            transfer: [3, 4]
        }, {
            staId: 8,
            staName: '隆德路站',
            staWay: 0,
            transfer: [11]
        }, {
            staId: 9,
            staName: '武宁路站',
            staWay: 0
        }, {
            staId: 10,
            staName: '长寿路站',
            staWay: 0,
            transfer: [7]
        }, {
            staId: 11,
            staName: '江宁路站',
            staWay: 0
        }, {
            staId: 12,
            staName: '汉中路站',
            staWay: 0,
            transfer: [1, 12]
        }, {
            staId: 13,
            staName: '自然博物馆站',
            staWay: 0
        }, {
            staId: 14,
            staName: '南京西路站',
            staWay: 0,
            transfer: [2, 12]
        }, {
            staId: 15,
            staName: '淮海中路站',
            staWay: 0
        }, {
            staId: 16,
            staName: '新天地站',
            staWay: 0,
            transfer: [10]
        }, {
            staId: 17,
            staName: '马当路站',
            staWay: 0,
            transfer: [9]
        }, {
            staId: 18,
            staName: '世博会博物馆站',
            staWay: 0
        }, {
            staId: 19,
            staName: '世博大道站',
            staWay: 0
        }]
    }, {
        id: 16,
        subName: '十六号线',
        subStation: [{
            staId: 1,
            staName: '滴水湖站',
            staWay: 0
        }, {
            staId: 2,
            staName: '临港大道站',
            staWay: 0
        }, {
            staId: 3,
            staName: '书院站',
            staWay: 0
        }, {
            staId: 4,
            staName: '惠南东站',
            staWay: 0
        }, {
            staId: 5,
            staName: '惠南站',
            staWay: 0
        }, {
            staId: 6,
            staName: '野生动物园站',
            staWay: 0
        }, {
            staId: 7,
            staName: '新场站',
            staWay: 0
        }, {
            staId: 8,
            staName: '航头东站',
            staWay: 0
        }, {
            staId: 9,
            staName: '鹤沙航城站',
            staWay: 0
        }, {
            staId: 10,
            staName: '周浦东站',
            staWay: 0
        }, {
            staId: 12,
            staName: '罗山路站',
            staWay: 0
        }, {
            staId: 13,
            staName: '华夏中路站',
            staWay: 0
        }, {
            staId: 14,
            staName: '龙阳路站',
            staWay: 0
        }]
    }];
})

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
        for (var i = 0; i < 5; i++, base++) {
            $scope.chats.unshift(["chat", base].join(''));
        }
        $scope.$broadcast('scroll.refreshComplete');
    }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
    // $scope.settings = {
    //   enableFriends: true
    // }

    // 百度地图API功能
    // $('.lbs-logo').css('display', 'none');
})
.controller('LoginCtrl',function($rootScope,$scope,$http,$ionicPopup,$timeout,$location,$state,$ionicHistory){
    $ionicHistory.nextViewOptions({
        disableBack: true
    });
    $scope.showAlert = function() {
        var alertPopup = $ionicPopup.alert({
            title: '登陆警告',
            template: '请正确填写用户名和验证码！'
        });
        alertPopup.then(function(res) {
            console.log('Thank you for not eating my delicious ice cream cone');
        });
    };
    $scope.doLogin = function() {
        $scope.loginData = {
            username:username.value,
            password:password.value
        }

        if($scope.loginData.username=="" || $scope.loginData.password=="") {
            $scope.showAlert();
            console.log($scope.template);
        }else{
            $http.post('http://localhost:3000/api/user?username='+$scope.loginData.username+'&password='+$scope.loginData.password)
                .success(function(data){   
                    console.log(data);
                    // $window.location.href = "#/tab/addLine";
                    $rootScope.isLogin = true;
                    $rootScope.username = $scope.loginData.username;
                    $rootScope.password = $scope.loginData.password;
                    // console.log($rootScope.username);
                    $location.path("#/tab/dash");
                }
            )
        }
    }
})
.controller('RegisterCtrl',function($scope,$http,$location,$state){
    $scope.RegisterData = {
        username:registerUsername.value,
        email:registerEmail.value,
        password:registerPassword.value
           
    };
    $scope.doRegister = function() {
        $http.post('http://localhost:3000/api/admin?username='+$scope.RegisterData.username+'&email='+$scope.RegisterData.email+'&password='+$scope.RegisterData.password)
        .success(function(data) {
            if(data){
                $state.go('tab.login');
            }
        })
    };
})
.controller('AddLineCtrl',function($scope, $ionicActionSheet, $timeout){
     // Triggered on a button click, or some other target
     $scope.show = function() {

       // Show the action sheet
       var hideSheet = $ionicActionSheet.show({
         buttons: [
           { text: '增加' },
           { text:'删除（谨慎操作）'}
         ],
         titleText: '操作',
         cancelText: '取消',
         cancel: function() {
              // add cancel code..
            },
         buttonClicked: function(index) {
            console.log(index);
           return true;
         }
       });

       // For example's sake, hide the sheet after two seconds
       $timeout(function() {
         hideSheet();
       }, 2000);

     };
})
.controller('AddStationCtrl',function($rootScope,$scope,$http){
    // $scope.subwayData = [];
    
    $http.get('http://localhost:3000/api/all')
    .success(function(data) {
        if(data){
            $scope.subwayData = data;
        }
    })
    
    // console.log($rootScope.subwayData);
    
})
.controller('StationListCtrl', function($scope, $stateParams,$http,$ionicListDelegate) {
    $http.get('http://localhost:3000/api/list/' + $stateParams.addStationId)
    .success(function(data) {
        if(data){
            $scope.items = data[0];
            console.log($scope.items);
        }
    })
    $scope.data = {
        showDelete: false
    };
    $scope.addItem = function(items) {
        var staNname = prompt('填写要在此站点之后添加的站点');
        if(staNname) {
            $scope.items.subStation.push({
                'staNname':name
            });
        }
        $ionicListDelegate.closeOptionButtons(); 
    }
     $scope.moveItem = function(item, fromIndex, toIndex) {
        $scope.items.splice(fromIndex, 1);
        $scope.items.splice(toIndex, 0, item);
    };
        
    $scope.onItemDelete = function(item) {
        $scope.item = item;
        $scope.items.subStation.splice($scope.items.subStation.indexOf(item), 1);
    };
    $scope.deleteItem = function(item) {
        $scope.item = item;
        $scope.item['status'] = 'deleteItem';
       
        $ionicListDelegate.closeOptionButtons();
    }
    $scope.editItem = function(item) {
        var staNname = prompt('填写需要修改的信息');
        if(staNname) {
            $scope.items.subStation.push({
                'staNname':name
            });
        }
        
        $ionicListDelegate.closeOptionButtons();
    }
})
.controller('SearchForm', function($scope) {});