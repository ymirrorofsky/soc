angular.module("starter.controllers", [])
  .controller("homeCtrl", function (
    $rootScope,
    $scope,
    User,
    Message,
    Home,
    $ionicLoading,
    $timeout,
    $ionicPopup,
    System
  ) {

    $scope.info = {
      pwd: ''
    }
    $scope.gouMaiKuangJi = function (id) {

      System.systemVersion().then(function (response) {
        if (response) {
          // 一个精心制作的自定义弹窗
          var myPopup = $ionicPopup.show({
            template: '<input type="password" ng-model="info.pwd">',
            title: '请输入交易密码',
            subTitle: '',
            scope: $scope,
            buttons: [
              { text: '取消' },
              {
                text: '确认',
                type: 'button-positive',
                onTap: function (e) {
                  User.gouMaiKuangJi(id, $scope.info.pwd, response).then(function (res) {
                    Message.show(res.msg, 1500);
                  });
                }
              },
            ]
          });
        }
      })

      // new Prompt(
      //   "请输入交易密码",
      //   "交易密码",
      //   function() {
      //     var pwd = this.text();

      //     User.gouMaiKuangJi(id, pwd).then(function(res) {
      //       Message.show(res.msg, 1500);
      //     });
      //   },
      //   function() {},
      //   "确认",
      //   "取消"
      // ).show();
    };

    Home.millsList().then(function (response) {
      console.log(response);
      $scope.millsList = response.data;
    });

    $scope.doRefresh = function () {
      $scope.noMore = true;
      $scope.page = 2;
      Home.millsList().then(function (response) {
        $scope.millsList = response.data;
        $scope.$broadcast("scroll.refreshComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "刷新成功",
          duration: "1500"
        });
        $timeout(function () {
          $scope.noMore = false;
        }, 1000);
      });
    };
    // 下拉加载更多商家
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMoreGoods = function () {
      Home.millsList($scope.page).then(function (res) {
        $scope.page++;
        $scope.millsList = $scope.millsList.concat(res.data);
        $scope.$broadcast("scroll.infiniteScrollComplete");
        if (res.code == 0 && res.data.length == 0) {
          $ionicLoading.show({
            noBackdrop: true,
            template: "没有更多了",
            duration: "1500"
          });
          $scope.noMore = true;
        }
      });
    };
  })

  .controller("kuangjiCtrl", function (
    $rootScope,
    $timeout,
    $scope,
    $cordovaGeolocation,
    $cordovaBarcodeScanner,
    Area,
    $ionicSlideBoxDelegate,
    $ionicLoading,
    $ionicModal,
    $anchorScroll,
    $state,
    $http,
    Home,
    Message,
    $location
  ) {
    //		$scope.$on("$ionicView.beforeEnter", function () {
    //		});
    $scope.type = "run";
    Home.mymillsList($scope.type).then(function (response) {
      console.log(response);
      $scope.mymillsinfo = response.data;
      $scope.mymillsList = response.data.list;
    });
    $scope.changetype = function (type) {
      $scope.noMore = false;
      $scope.type = type;
      Home.mymillsList($scope.type).then(function (response) {
        console.log(response);
        $scope.mymillsinfo = response.data;
        $scope.mymillsList = response.data.list;
        $timeout(function () {
          $scope.noMore = true;
        }, 0);
      });
    };
    // 下拉刷新
    $scope.doRefresh = function () {
      $scope.noMore = false;
      $scope.page = 2;
      Home.mymillsList($scope.type).then(function (response) {
        console.log(response);
        $scope.mymillsinfo = response.data;
        $scope.mymillsList = response.data.list;
        $timeout(function () {
          $scope.noMore = true;
        }, 0);
        $scope.$broadcast("scroll.refreshComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "刷新成功！",
          duration: "2000"
        });
      });
    };
    $scope.noMore = true;
    $scope.page = 2;
    $scope.loadMoreGoods = function () {
      Home.mymillsList($scope.type, $scope.page).then(function (response) {
        $scope.page++;
        $scope.mymillsinfo = response.data;
        $scope.mymillsList = $scope.mymillsList.concat(response.data.list);
        $scope.$broadcast("scroll.infiniteScrollComplete");
        if (response.data.list == "") {
          $ionicLoading.show({
            noBackdrop: true,
            template: "没有更多了！",
            duration: "1200"
          });
          $scope.noMore = false;
        }
      });
    };
  })
  .controller("kuangshiCtrl", function (
    $rootScope,
    $scope,
    $ionicHistory,
    $stateParams,
    $ionicSlideBoxDelegate,
    $ionicLoading,
    $state,
    Message,
    $anchorScroll,
    $ionicScrollDelegate,
    Storage,
    System,
    $timeout,
    $cordovaBarcodeScanner,
    Home,
    $cordovaGeolocation,
    User,
    $ionicPopup,
    $ionicModal
  ) {
    $scope.type = "1";
    $scope.typeS = function (type) {
      $scope.type = type;
    };
    console.log($stateParams)
    if ($stateParams.option) {
      $scope.option2 = $stateParams.option;
    } else {
      $scope.option2 = "1";
    }
    $scope.info = {
      charge: "",
      worth: "",
      user_ID: "",
      num: "",
      cost: "",
      di: "",
      fu: "",
      gao: ""
    };
    $scope.info2 = {
      num: 10,
      curWorth: "",
      worth: "",
      isShow: false, //是否挂单
      max_num: "", //最大挂单个数
      min_num: "" //最小挂单个数
    };
    $scope.hourArr = [];
    $scope.dateArr = [];

    var option1 = {
      legend: {
        data: ["实时价格"],
        left: "left",
        tooltip: {
          show: !0
        },
        textStyle: {
          color: "#42ad2c"
        }
      },
      tooltip: {
        show: !0
      },
      grid: {
        x: 35,
        x2: 10,
        y: 30,
        y2: 25
      },
      toolbox: {
        show: !1,
        feature: {
          mark: {
            show: !0
          },
          dataView: {
            show: !0,
            readOnly: !1
          },
          magicType: {
            show: !0,
            type: ["line", "bar"]
          },
          restore: {
            show: !0
          },
          saveAsImage: {
            show: !0
          }
        }
      },
      calculable: !1,
      xAxis: [
        {
          type: "category",
          data: ["01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"],
          axisLabel: {
            color: "#42ad2c" //刻度线标签颜色
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          splitArea: {
            show: !1
          },
          data: [0, 2, 4, 6, 8, 10],
          axisLabel: {
            color: "#42ad2c" //刻度线标签颜色
          }
        }
      ],
      series: [
        {
          name: "实时价格",
          type: "line",
          data: [9, 9, 9, 9, 9, 9],
          color: ["#42ad2c"],
          areaStyle: {
            normal: {
              color: "rgba(32, 182, 75, 0.2)"
            }
          }
        }
      ]
    };
    var option2 = {
      legend: {
        data: ["实时价格"],
        left: "left",
        tooltip: {
          show: !0
        },
        textStyle: {
          color: "#42ad2c"
        }
      },
      tooltip: {
        show: !0
      },
      grid: {
        x: 35,
        x2: 10,
        y: 30,
        y2: 25
      },
      toolbox: {
        show: !1,
        feature: {
          mark: {
            show: !0
          },
          dataView: {
            show: !0,
            readOnly: !1
          },
          magicType: {
            show: !0,
            type: ["line", "bar"]
          },
          restore: {
            show: !0
          },
          saveAsImage: {
            show: !0
          }
        }
      },
      calculable: !1,
      xAxis: [
        {
          type: "category",
          data: ["01-09", "01-10", "01-11", "01-12", "01-13", "01-14", "01-15"],
          axisLabel: {
            color: "#42ad2c" //刻度线标签颜色
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          splitArea: {
            show: !1
          },
          data: [0, 2, 4, 6, 8, 10],
          axisLabel: {
            color: "#42ad2c" //刻度线标签颜色
          }
        }
      ],
      series: [
        {
          name: "实时价格",
          type: "line",
          data: [9, 9, 9, 9, 9, 9],
          color: ["#42ad2c"],
          areaStyle: {
            normal: {
              color: "rgba(32, 182, 75, 0.2)"
            }
          }
        }
      ]
    };
    $scope.hourArr = [];
    $scope.getShiXian = function () {
      var date = new Date();
      var curHour = date.getHours();
      console.log("curHour : ", curHour);
      hourArr = [];
      var begin = curHour - 6;
      console.log("begin : ", begin);
      var over = curHour;
      for (var i = 0; i < 7; i++) {
        $scope.hourArr.push(begin + ":00");
        begin = begin + 1;
      }
      option1.xAxis[0].data = $scope.hourArr;
    };
    $scope.getRiXian = function () {
      var myDate = new Date(); //获取今天日期
      myDate.setDate(myDate.getDate() - 6);

      var dateTemp;
      var flag = 1;
      for (var i = 0; i < 7; i++) {
        dateTemp = myDate.getMonth() + 1 + "-" + myDate.getDate();
        $scope.dateArr.push(dateTemp);
        myDate.setDate(myDate.getDate() + flag);
      }

      option2.xAxis[0].data = $scope.dateArr;
    };

    $scope.getShiXian();
    $scope.getRiXian();
    User.getMaiJiaKanBan("2").then(function (res) {
      $scope.displayListBuy = res.data;
    });
    User.getMaiJiaKanBan("1").then(function (res) {
      $scope.displayListSell = res.data;
    });
    // 买入，卖出，矿市卖出切换
    $scope.option2S = function (option2, $event) {
      // $event.stopPropagation()
      $scope.option2 = option2;
      $scope.info2.worth = $scope.info.worth;
      $scope.info2.num = $scope.info2.min_num;
      $scope.noMore = true;

      $scope.page = 2;
      if (option2 == "1") {
        User.getMaiJiaKanBan("2").then(function (res) {
          $scope.displayListBuy = res.data;

        });
      } else if (option2 == "2") {
        User.getMaiJiaKanBan("1").then(function (res) {
          $scope.displayListSell = res.data;
        });
      }

      $timeout(function () {
        $scope.noMore = false;

      }, 1000)

    };
    // 挂买单
    $scope.guaBuyDan = function () {
    	document.addEventListener("deviceready",function () {
    		System.systemVersion().then(function (response) {
    		  if (response) {
    		    var confirmPopup = $ionicPopup.confirm({
    		      title: '提示',
    		      template: '确认挂买单吗?',
    		      cancelText: '取消',
    		      okText: '确定'
    		    });
    		    confirmPopup.then(function (res) {
    		      if (res) {
    		        User.guaMaiDan($scope.info2, "1", response).then(function (res) {
    		          Message.show(res.msg, 1500);
    		          //
    		        });
    		      } else {

    		      }
    		    });
    		  }
    		})
    	},false)
    };
    // 挂卖单
    $scope.guaSellDan = function () {
    	document.addEventListener("deviceready",function () {
    		System.systemVersion().then(function (response) {
    		  if (response) {
    		    var confirmPopup = $ionicPopup.confirm({
    		      title: '提示',
    		      template: '确认挂卖单吗?',
    		      cancelText: '取消',
    		      okText: '确定'
    		    });
    		    confirmPopup.then(function (res) {
    		      if (res) {
    		        User.guaMaiDan($scope.info2, "2", response).then(function (res) {
    		          Message.show(res.msg, 1500);
    		          //
    		        });
    		      } else {
    		        console.log('You are not sure');
    		      }
    		    });
    		  }
    		})
    	},false)
    };
    // 矿市卖出
    $scope.maiChu = function (action) {
    	document.addEventListener("deviceready",function () {
	    	System.systemVersion().then(function (response) {
	        if (response) {
	          User.maiChu($scope.info, response).then(function (res) {
	            Message.show(res.msg, 1500);
	            $timeout(function () {
	              $state.go('user.jiaoYiDaTing', { type: action })
	            }, 1500)
	            User.getTradeList("0").then(function (res) {
	              $scope.tradeList = res.data;
	            });
	          });
	        }
	      })
    	},false)
    };
    // 卖给Ta
    $scope.maiGeiTa = function (id, action) {
    	document.addEventListener("deviceready",function () {
	      System.systemVersion().then(function (response) {
	        if (response) {
	          // 一个精心制作的自定义弹窗
	          var myPopup = $ionicPopup.show({
	            template: '<input type="password" ng-model="info.pwd">',
	            title: '请输入交易密码',
	            subTitle: '',
	            scope: $scope,
	            buttons: [
	              { text: '取消' },
	              {
	                text: '确认',
	                type: 'button-positive',
	                onTap: function (e) {
	                  User.maiGeiTa(id, $scope.info.pwd, response).then(function (res) {
	                    $scope.info.pwd = ''
	                    Message.show(res.msg, 1500);
	                    $state.go('user.jiaoYiDaTing', { type: action })
	                    User.getMaiJiaKanBan("2").then(function (res) {
	                      $scope.displayListBuy = res.data;
	                    });
	                    User.getMaiJiaKanBan("1").then(function (res) {
	                      $scope.displayListSell = res.data;
	                    });
	                  });
	
	                }
	              },
	            ]
	          });
	        }
	      })
    	},false)
    };
    $scope.doRefresh = function () {
      // 当前CNY价格
      User.getKuangShiInfo().then(function (res) {
        $scope.info.charge = res.data.cost;
        $scope.info.worth = res.data.worth;
        $scope.info2.worth = res.data.worth;
      });
      //获取挂单信息
      User.getGuaDanInfo("1").then(function (res) {
        $scope.info2.max_num = res.data.max_num;
        $scope.info2.min_num = res.data.min_num;
        $scope.info2.num = res.data.min_num;
        $scope.info2.isShow = res.data.isShow;
      });
      User.getMaiJiaKanBan("2").then(function (res) {
        $scope.displayListBuy = res.data;
      });
      User.getMaiJiaKanBan("1").then(function (res) {
        $scope.displayListSell = res.data;
      });
      // 日线，时线等
      User.getTuBiao().then(function (res) {
        option1.series[0].data = res.data.shixian;
        option2.series[0].data = res.data.rixian;
        $scope.info.cost = res.data.cost;
        $scope.info.gao = res.data.gao;
        $scope.info.di = res.data.di;
        $scope.info.fu = res.data.fu;
        $scope.info.liang = res.data.liang;
        var myChart1 = echarts.init(document.getElementById("lineChart"));
        myChart1.setOption(option1);
        var myChart2 = echarts.init(document.getElementById("lineChart2"));
        myChart2.setOption(option2);
        $scope.$broadcast("scroll.refreshComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "刷新成功",
          duration: "1500"
        });
      });
    };
    // 取消交易
    $scope.quXiaoJiaoYi = function (id) {
      new Confirm(
        "确认取消交易吗?",
        function () {
          User.quXiaoJiaoYi(id).then(function (res) {
            User.getTradeList("0").then(function (res) {
              $scope.tradeList = res.data;
            });
          });
        },
        function () { },
        "确认",
        "取消"
      ).show();
    };
    $scope.queRenJiaoYi = function (id, role) {
      User.queRenJiaoYi(id, $scope.pingzheng, role).then(function (res) {
        Message.show(res.msg);
        User.getTradeList("0").then(function (res) {
          $scope.tradeList = res.data;
        });
      });
    };
    // 当前CNY价格
    User.getKuangShiInfo().then(function (res) {
      $scope.info.charge = res.data.cost;
      $scope.info.worth = res.data.worth;
      $scope.info2.worth = res.data.worth;
    });
    // 日线，时线等
    User.getTuBiao().then(function (res) {
      option1.series[0].data = res.data.shixian;
      $scope.info.cost = res.data.cost;
      $scope.info.gao = res.data.gao;
      $scope.info.di = res.data.di;
      $scope.info.fu = res.data.fu;
      $scope.info.liang = res.data.liang;
      var myChart1 = echarts.init(document.getElementById("lineChart"));
      myChart1.setOption(option1);
    });
    $scope.typeS = function (type) {
      $scope.type = type;
      if ($scope.type == 1) {
        User.getTuBiao().then(function (res) {
          option1.series[0].data = res.data.shixian;
          $scope.info.cost = res.data.cost;
          $scope.info.gao = res.data.gao;
          $scope.info.di = res.data.di;
          $scope.info.fu = res.data.fu;
          var myChart1 = echarts.init(document.getElementById("lineChart"));
          myChart1.setOption(option1);
        })
      } else if ($scope.type == 2) {
        User.getTuBiao().then(function (res) {
          option2.series[0].data = res.data.rixian;
          $scope.info.cost = res.data.cost;
          $scope.info.gao = res.data.gao;
          $scope.info.di = res.data.di;
          $scope.info.fu = res.data.fu;
          var myChart2 = echarts.init(document.getElementById("lineChart2"));
          myChart2.setOption(option2);
        })
      }
    };
    //获取挂单信息
    User.getGuaDanInfo("1").then(function (res) {
      $scope.info2.max_num = res.data.max_num;
      $scope.info2.min_num = res.data.min_num;
      $scope.info2.num = res.data.min_num;
      $scope.info2.isShow = res.data.isShow;
    });
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      if ($scope.option2 == "1") {
        User.getMaiJiaKanBan("2", $scope.page).then(function (res) {
          $scope.page++;
          console.log($scope.displayListBuy)
          $scope.displayListBuy = $scope.displayListBuy.concat(res.data);
          $scope.$broadcast("scroll.infiniteScrollComplete");
          if (res.code == 0 && res.data.length == 0) {
            console.log('88888888888')
            $ionicLoading.show({
              noBackdrop: true,
              template: "没有更多了",
              duration: "1500"
            });
            $scope.noMore = true;
          }
        });
      } else if ($scope.option2 == "2") {
        User.getMaiJiaKanBan("1", $scope.page).then(function (res) {
          console.log('77777')
          $scope.page++;
          $scope.displayListSell = $scope.displayListSell.concat(res.data);
          $scope.$broadcast("scroll.infiniteScrollComplete");
          if (res.code == 0 && res.data.length == 0) {
            $ionicLoading.show({
              noBackdrop: true,
              template: "没有更多了",
              duration: "1500"
            });
            $scope.noMore = true;
          }
        });
      }
    }
    // 挂买单弹框，挂卖单弹框
    $ionicModal.fromTemplateUrl('my-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modalmaimai = modal;
    });
    $scope.openModalmaimai = function () {
      $scope.modalmaimai.show();
    };
    $scope.closeModalmaimai = function () {
      $scope.modalmaimai.hide();
    };
  })
  .controller("myCtrl", function (
    $scope,
    $cordovaBarcodeScanner,
    $ionicLoading,
    User,
    $state,
    Message,
    Mc,
    $rootScope,
    Storage,
    Auth,
    Home,
    $ionicActionSheet,
    $timeout,
    $cordovaInAppBrowser,
    $window,
    $stateParams,
    $ionicModal
  ) {


    $scope.$on("$ionicView.beforeEnter", function () {

      User.geRenXinXi().then(function (res) {
        $scope.info.all_vrc = parseFloat(res.data.all_vrc);
        $scope.info.freeze_vrc = parseFloat(res.data.freeze_vrc);
        $scope.info.level = res.data.level;
        $scope.info.number = res.data.number;
        $scope.info.is_smrz = res.data.is_smrz;
        $scope.info.id = res.data.id;
        $scope.info.total_vrc = $scope.info.freeze_vrc + $scope.info.all_vrc;
      });

    });
    $scope.goodisshow = false;
    console.log($stateParams.from)
    $scope.from = $stateParams.from || '';
    //		Mc.getMy().then(function(data) {
    //			$scope.myInfo = data;
    //		});
    console.log($scope.from)
    $scope.info = {
      all_vrc: "",
      freeze_vrc: "",
      total_vrc: "",
      level: "",
      number: "",
      is_smrz: 0,
      id: ''
    };
    $scope.popup = {
      title: "",
      info: "",
      isShow: false,
      id: ""
    };

    $scope.confirmAction = function (index) {
      $stateParams.from = "other";
      console.log(333)
      console.log($scope.from)
      if (index == "0") {
        $scope.popup.isShow = false;
      } else if (index == "1") {
        $scope.popup.isShow = false;
        $state.go("user.xiaoXiXiangQing", { id: $scope.popup.id });
      }
    };
    $scope.developing = function () {
      Message.show("暂时未开放", 2000);
    };

    if ($scope.from == 'login') {

      User.tanGongGao().then(function (res) {
        $stateParams.from = "other";
        $scope.popup.isShow = true;
        angular.element(document).ready(function () {
          $scope.popup.title = res.data.title;
          $scope.popup.info = res.data.info;
          $scope.popup.id = res.data.id;
          console.log($scope.popup.info);

          $timeout(function () {
            console.log($("#popupInfo"));
            $("#popupInfo").html($scope.popup.info);
          }, 0);
        });
      });
      User.informList().then(function (res) {

        $scope.informList = res.data;

        if ($scope.informList.length > 0) {
          $scope.modalmaimai.show();
        }

      })




    }
    $ionicModal.fromTemplateUrl('my-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modalmaimai = modal;


    });
    $scope.openModalmaimai = function () {

    };
    $scope.closeModalmaimai = function () {
      $scope.modalmaimai.hide();
    };
    $scope.goJYDT = function () {
      $scope.modalmaimai.hide();
      $state.go('user.jiaoYiDaTing')
    }
    User.geRenXinXi().then(function (res) {
      $scope.info.all_vrc = parseFloat(res.data.all_vrc);
      $scope.info.freeze_vrc = parseFloat(res.data.freeze_vrc);
      $scope.info.level = res.data.level;
      $scope.info.number = res.data.number;
      $scope.info.is_smrz = res.data.is_smrz;
      $scope.info.id = res.data.id;
      $scope.info.total_vrc = $scope.info.freeze_vrc + $scope.info.all_vrc;
    });
    $scope.toto = function () {
      $state.go("tab.kuangshi", { option: 3 })
    }
  })

  .controller("loginCtrl", function (
    $rootScope,
    $scope,
    $ionicModal,
    Auth,
    $timeout,
    $state,
    Message,
    $http,
    $ionicHistory,
    ENV,
    Storage,
    System,
    $cordovaInAppBrowser
  ) {
    $scope.info = {
      username: "",
      pwd: ""
    };

    $scope.download = function () {
    
      // window.href = 'http://www.pgyer.com/SYBAPP'
      // $cordovaInAppBrowser.open(
      //   'http://www.pgyer.com/SYBAPP',
      //   "_system"
      // );
            var options = {
        location: 'no',
        clearcache: 'yes',
        toolbar: 'no'
      };
      $cordovaInAppBrowser.open('http://www.pgyer.com/SYBAPP', '_system', options)
        .then(function (event) {
          // success
        })
        .catch(function (event) {
          // error
        });
    }



    $scope.autoPsd = function () {
      angular.element(document).ready(function () {
        var _ele = $(".mycheckbox .rempass");
        _ele.hasClass("act")
          ? (_ele.html("&#xe604;"),
            _ele.toggleClass("act"),
            $("#isrem").val(!1),
            ($scope.keepPsd = false))
          : (_ele.html("&#xe678;"),
            _ele.toggleClass("act"),
            $("#isrem").val(!0),
            ($scope.keepPsd = true));
        console.log(" $scope.keepPsd : ", $scope.keepPsd);
      });
    };

    $scope.submit = function () {
      // document.addEventListener("deviceready", function () {
      //   System.systemVersion().then(function (response) {
      //     if (response) {

            if (
              !$scope.info.username ||
              !ENV.REGULAR_MOBILE.test($scope.info.username)
            ) {
              Message.show("请输入正确的手机号");
              return;
            }
            if (!$scope.info.pwd) {
              Message.show("请输入密码");
              return false;
            }
            Auth.login($scope.info, $scope.keepPsd, 'response').then(function (res) {
              Message.show(res.msg, 1500);
              $timeout(function () {
                $state.go("tab.my", { from: 'login' });
              }, 1500);
            });
          // }
      //   })
      // }, false)
    };

    $scope.keepPsd = false;

    $scope.keepPsdS = function () {
      $scope.keepPsd = !$scope.keepPsd;
    };
    $scope.checkPsd = function () {
      if (Storage.get("mobileArr")[$scope.info.username]) {
        if (Storage.get("mobileArr")[$scope.info.username].password) {
          $scope.info.pwd = Storage.get("mobileArr")[
            $scope.info.username
          ].password;
          $scope.keepPsd = true;
        }
      }
    };
    // 选择手机号
    $scope.mobileArr = [];
    $scope.mobileShow = false;

    if (Storage.get("mobileArr")) {
      for (var i in Storage.get("mobileArr")) {
        $scope.mobileArr.push(i);
        if (Storage.get("mobileArr")[i].register) {
          $scope.info.username = i;
          delete Storage.get("mobileArr")[i].register;
        } else {
        }
      }
    } else {
      Storage.set("mobileArr", {});
      $scope.mobileArr = [];
    }
    $scope.mobileIsShow = function () {
      $scope.mobileShow = !$scope.mobileShow;
    };
    $scope.mobileShowS = function (mobile) {
      $scope.mobileShow = false;
      $scope.info.username = mobile;
      if (Storage.get("mobileArr")[mobile]) {
        if (Storage.get("mobileArr")[mobile].keepPsd) {
          $scope.info.pwd = Storage.get("mobileArr")[mobile].password;
          $scope.keepPsd = true;
        } else {
          $scope.info.pwd = "";
          $scope.keepPsd = false;
        }
      }
    };
    $scope.deleteMobile = function (mobile, $event) {
      $event.stopPropagation();
      if (Storage.get("mobileArr")[mobile]) {
        var obj = Storage.get("mobileArr");
        delete obj[mobile];
        Storage.set("mobileArr", obj);
        $scope.mobileArr = [];
        for (var i in Storage.get("mobileArr")) {
          $scope.mobileArr.push(i);
        }
      }
    };

    $scope.wangji = function () {
      $state.go("user.wangJiDengMa");
    };
  })

  .controller("registerCtrl", function (
    $scope,
    $ionicModal,
    Message,
    ENV,
    Auth,
    $interval,
    $ionicScrollDelegate,
    $state,
    $timeout
  ) {
    $scope.reg = {
      step: 1,
      tMobile: "",
      mobile: "",
      pictureCaptcha: "",
      captcha: "",
      agree: true,
      password: "",
      rePassword: "",
      number: 60,
      bol: false
    };

    //发送验证后倒计时
    $scope.countDown = function () {
      $scope.reg.step = 2;
      $scope.reg.bol = true;
      $scope.reg.number = 60;
      var timer = $interval(function () {
        if ($scope.reg.number <= 1) {
          $interval.cancel(timer);
          $scope.reg.bol = false;
          $scope.reg.number = 60;
        } else {
          $scope.reg.number--;
        }
      }, 1000);
    };
    //获取短信验证码
    $scope.pictureCaptchaUrl = ENV.YD_URL + "auth/getCode";
    $scope.getSmsCaptcha = function () {
      if (!$scope.reg.mobile || !ENV.REGULAR_MOBILE.test($scope.reg.mobile)) {
        Message.show("请输入正确的手机号");
        return;
      }

      Auth.sendRegCode($scope.reg.mobile).then(
        function () {
          $ionicScrollDelegate.scrollTop();

          $scope.countDown();
        },
        function () {
          document.querySelector("img[update-img]").src =
            $scope.pictureCaptchaUrl; // 更新图片验证码
        }
      );
    };
    $scope.submit = function () {
      Auth.register($scope.reg).then(function (res) {
        Message.show(res.msg, 1500);
        $timeout(function () {
          $state.go("auth.login");
        }, 1500);
      });
    };
  })

  .controller("resetPsdCtrl", function (
    $scope,
    Auth,
    $interval,
    Message,
    $rootScope
  ) {
    $scope.reg = {
      captcha: null,
      mobile: null,
      password: null,
      repassword: null,
      number: 60,
      bol: false
    };
    $scope.showNext = 1;
    //获取短信验证码
    $scope.getCaptcha = function () {
      Auth.getCaptcha(
        function (response) {
          if (response.code !== 0) {
            Message.show(response.msg);
            return false;
          }
          $rootScope.$broadcast("Captcha.send");
          Message.show(response.msg, 1000);
        },
        function () {
          Message.show("通信错误，请检查网络!", 1500);
        },
        $scope.reg.mobile
      );
    };
    // 验证验证码
    $scope.next = function () {
      if ($scope.showNext == 3) {
        Auth.setPassword($scope.reg, 1);
      } else if ($scope.showNext == 1) {
        Auth.checkCaptain($scope.reg.mobile, $scope.reg.captcha, 1);
      }
    };
    //验证成功后
    $scope.$on("Captcha.success", function () {
      $scope.showNext = 3;
    });
    //发送验证后倒计时
    $scope.$on("Captcha.send", function () {
      $scope.reg.bol = true;
      $scope.reg.number = 60;
      var timer = $interval(function () {
        if ($scope.reg.number <= 1) {
          $interval.cancel(timer);
          $scope.reg.bol = false;
          $scope.reg.number = 60;
        } else {
          $scope.reg.number--;
        }
      }, 1000);
    });
  })

  .controller("userCenterCtrl", function (
    $scope,
    $rootScope,
    ENV,
    $ionicActionSheet,
    $ionicLoading,
    $ionicHistory,
    $timeout,
    $state,
    User,
    $ionicModal,
    $cordovaCamera,
    Storage,
    Message,
    $resource,
    System
  ) {
    // 退出登录
    $scope.logout = function () {
      $ionicActionSheet.show({
        destructiveText: "退出登录",
        titleText: "确定退出当前登录账号么？",
        cancelText: "取消",
        cancel: function () {
          return true;
        },
        destructiveButtonClicked: function () {
          User.logout();
          $ionicHistory.nextViewOptions({
            //退出后清除导航的返回
            disableBack: true
          });
          $ionicLoading.show({
            noBackdrop: true,
            template: "退出成功！",
            duration: "1500"
          });
          $timeout(function () {
            $state.go("tab.notice");
          }, 1200);
          return true;
        }
      });
    };
    //		System.aboutUs(function(response) {
    //			Message.hidden();
    //			$scope.version = response.data;
    //			console.log($scope.version)
    //		}, function(err) {
    //			Message.show(err.msg);
    //		});
    //昵称
    $scope.NickName = {
      nickname: ""
    };
    $scope.setNickname = function (nickname) {
      User.setnickname(nickname.nickname).then(function (response) {
        //	console.log(nickname);
        var setNick = Storage.get("user");
        setNick.nickname = nickname.nickname;
        Storage.set("user", setNick);
        $rootScope.globalInfo.user = setNick;
        console.log(Storage.get("user"));

        $timeout(function () {
          Message.show("修改成功");
          $state.go("tab.tcmytc");
        }, 1000);
      });
    };

    $scope.payInfo = {
      img: ""
    };
    var resource = $resource(ENV.YD_URL, {
      do: "users",
      op: "@op"
    });
    /*上传证件照*/
    $scope.uploadAvatar = function () {
      var buttons = [
        {
          text: "拍一张照片"
        },
        {
          text: "从相册选一张"
        }
      ];
      $ionicActionSheet.show({
        buttons: buttons,
        titleText: "请选择",
        cancelText: "取消",
        buttonClicked: function (index) {
          if (index == 0) {
            selectImages("camera");
          } else if (index == 1) {
            selectImages("");
          }
          return true;
        }
      });
    };
    var selectImages = function (from) {
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: false,
        targetWidth: 1000,
        targetHeight: 1000,
        correctOrientation: true,
        cameraDirection: 0
      };
      if (from == "camera") {
        options.sourceType = Camera.PictureSourceType.CAMERA;
      }
      document.addEventListener(
        "deviceready",
        function () {
          $cordovaCamera.getPicture(options).then(
            function (imageURI) {
              $scope.payInfo.img = "data:image/jpeg;base64," + imageURI;
              //										alert($scope.payInfo.img);
              resource.save(
                {
                  op: "changeHead",
                  img: $scope.payInfo.img
                },
                function (response) {
                  //						alert(JSON.stringify(response));
                  if (response.code == "0") {
                    var shopApply = Storage.get("user");
                    shopApply.avatar = $scope.payInfo.img;
                    Storage.set("user", shopApply);
                    $rootScope.globalInfo.user = shopApply;
                    Message.show("上传成功");
                    $state.go("tab.tcmytc");
                  } else {
                    Message.show(response.msg);
                  }
                }
              );
            },
            function (error) {
              Message.show("选择失败,请重试.", 1000);
            }
          );
        },
        false
      );
    };
    // 关于我们modal
    $ionicModal
      .fromTemplateUrl("templates/modal/aboutUs.html", {
        scope: $scope,
        animation: "slide-in-left"
      })
      .then(function (modal) {
        $scope.aboutUs = modal;
      });
    $scope.openModal = function () {
      $scope.aboutUs.show();
    };
  })

  .controller("userLoginPswCtrl", function (
    $scope,
    $stateParams,
    Message,
    $interval
  ) {
    $scope.type = $stateParams.type;
    $scope.getCaptchaSuccess = false;
    $scope.pageData = {
      oldpsd: "",
      code: "",
      newpsd: "",
      respsd: ""
    };
    $scope.reg = {
      number: 60
    };
    // 获取修改登录或支付验证码
    $scope.getCode = function (oldpsd, newpsd, respsd, type) {
      if (oldpsd.length < 6 || newpsd.length < 6 || respsd.length < 6) {
        Message.show("请输入至少6位的密码");
        return;
      } else if (newpsd != respsd) {
        Message.show("两次密码不一致");
        return;
      }
      User.getCaptcha(oldpsd, newpsd, respsd, type).then(function (data) {
        $scope.getCaptchaSuccess = true;
        var timer = $interval(function () {
          if ($scope.reg.number <= 1) {
            $interval.cancel(timer);
            $scope.getCaptchaSuccess = false;
            $scope.reg.number = 60;
          } else {
            $scope.reg.number--;
          }
        }, 1000);
      });
    };
    $scope.savePsd = function (oldpsd, code, newpsd, respsd) {
      if (oldpsd.length < 6 || newpsd.length < 6 || respsd.length < 6) {
        Message.show("请输入至少6位的密码");
        return;
      } else if (newpsd != respsd) {
        Message.show("两次密码不一致");
        return;
      }
      //		else if(code.length < 4) {
      //			Message.show('请输入正确的验证码');
      //			return;
      //		}
      if ($scope.type == 1) {
        User.changeLoginPsd(oldpsd, code, newpsd, respsd);
      } else if ($scope.type == 2) {
        User.changePayPsd(oldpsd, code, newpsd, respsd);
      }
    };
  })
  .controller("userResetPayWordCtrl", function (
    $scope,
    ENV,
    Message,
    $interval
  ) {
    $scope.getPsd = true;
    $scope.getCaptchaSuccess = false;
    $scope.pay = {
      mobile: "",
      code: "",
      newpsd: "",
      respsd: "",
      number: 60
    };
    $scope.getCode = function (newpsd, respsd) {
      if (newpsd.length < 6 || respsd.length < 6) {
        Message.show("请输入至少6位的密码");
        return;
      } else if (newpsd != respsd) {
        Message.show("两次密码不一致");
        return;
      }
      User.resetPwd(newpsd, respsd).then(function (data) {
        $scope.getCaptchaSuccess = true;
        var timer = $interval(function () {
          if ($scope.pay.number <= 1) {
            $interval.cancel(timer);
            $scope.getCaptchaSuccess = false;
            $scope.pay.number = 60;
          } else {
            $scope.pay.number--;
          }
        }, 1000);
      });
    };

    $scope.savePsd = function (newpsd, respsd, code) {
      User.resetPayPsd(newpsd, respsd, code);
    };
  })
  // 忘记支付密码
  .controller("userResetPayWordCtrl", function (
    $scope,
    User,
    ENV,
    Message,
    $interval
  ) {
    $scope.getPsd = true;
    $scope.getCaptchaSuccess = false;
    $scope.pay = {
      mobile: "",
      code: "",
      newpsd: "",
      respsd: "",
      number: 60
    };
    $scope.getCode = function (newpsd, respsd) {
      if (newpsd.length < 6 || respsd.length < 6) {
        Message.show("请输入至少6位的密码");
        return;
      } else if (newpsd != respsd) {
        Message.show("两次密码不一致");
        return;
      }
      User.resetPwd(newpsd, respsd).then(function (data) {
        $scope.getCaptchaSuccess = true;
        var timer = $interval(function () {
          if ($scope.pay.number <= 1) {
            $interval.cancel(timer);
            $scope.getCaptchaSuccess = false;
            $scope.pay.number = 60;
          } else {
            $scope.pay.number--;
          }
        }, 1000);
      });
    };

    $scope.savePsd = function (newpsd, respsd, code) {
      User.resetPayPsd(newpsd, respsd, code);
    };
  })
  .controller("kuangchiCtrl", function (
    $scope,
    Home,
    User,
    $ionicLoading,
    $timeout
  ) {
    // Home.getbanner().then(function (response) {
    // 	$scope.banner = response.data;
    // });
    // Home.getnoticelist().then(function (response) {
    // 	$scope.noticelist = response.data;
    // });
    $scope.info = {
      suanli: "",
      teamNum: "",
      zhitui: "",
      team: ""
    };
    $scope.type = "1";
    $scope.typeS = function (type) {
      $scope.page = 2;
      $scope.noMore = false;
      $scope.type = type;
    };

    $scope.doRefresh = function () {
      $scope.noMore = true;
      $scope.page = 2;
      User.kuangChiXiaJi().then(function (res) {
        $scope.info = res.data;
        $scope.info.zhitui = res.data.zhitui || [];
        $scope.info.team = res.data.team || [];
        $scope.$broadcast("scroll.refreshComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "刷新成功",
          duration: "1500"
        });
        $timeout(function () {
          $scope.noMore = false;
        }, 1000);
      });
    };
    $scope.noMore = false;
    //  $scope.page = 2;
    $scope.loadMore = function () {
      User.kuangChiXiaJi().then(function (res) {
        //      $scope.page++;
        $scope.info.zhitui = res.data.zhitui
        $scope.info.team = res.data.team
        $scope.$broadcast("scroll.infiniteScrollComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "没有更多了",
          duration: "1500"
        });
        $scope.noMore = true;
      });
    };
    User.kuangChiXiaJi().then(function (res) {
      $scope.info = res.data;
      $scope.info.zhitui = res.data.zhitui || [];
      $scope.info.team = res.data.team || [];
    });
  })

  .controller("guoNeiGuaDanCtrl", function (
    $scope,
    User,
    Message,
    $ionicLoading,
    $cordovaClipboard
  ) {
    $scope.info = {
      num: 10,
      curWorth: "",
      worth: "",
      isShow: false, //是否挂单
      max_num: "", //最大挂单个数
      min_num: "" //最小挂单个数
    };
    $scope.option1 = "tab1";
    $scope.options1Show = function (option1) {
      $scope.option1 = option1;
    };
    $scope.guaMaiDan = function () {
      new Confirm(
        "确认挂单吗?",
        function () {
          User.guaMaiDan($scope.info, "2").then(function (res) {
            Message.show(res.msg, 1500);
            User.getTradeList("2").then(function (res) {
              $scope.tradeList = res.data;
            });
          });
        },
        function () { },
        "确认",
        "取消"
      ).show();
    };
    $scope.maiGeiTa = function (id) {
      new Prompt(
        "请输入交易密码",
        "交易密码",
        function () {
          var pwd = this.text();
          User.maiGeiTa(id, pwd).then(function (res) {
            Message.show(res.msg, 1500);
            User.getMaiJiaKanBan("2").then(function (res) {
              $scope.displayList = res.data;
            });
            User.getTradeList("2").then(function (res) {
              $scope.tradeList = res.data;
            });
          });
        },
        function () { },
        "确认",
        "取消"
      ).show();
    };
    $scope.quXiaoJiaoYi = function (id) {
      new Confirm(
        "确认取消交易吗?",
        function () {
          User.quXiaoJiaoYi(id).then(function (res) {
            User.getTradeList("2").then(function (res) {
              $scope.tradeList = res.data;
            });
          });
        },
        function () { },
        "确认",
        "取消"
      ).show();
    };
    $scope.queRenJiaoYi = function (id, role) {
      User.queRenJiaoYi(id, role).then(function (res) {
        User.getTradeList("2").then(function (res) {
          $scope.tradeList = res.data;
        });
      });
    };

    $scope.quXiaoDingDan = function (id) {
      new Confirm(
        "确认取消挂单吗?",
        function () {
          User.quXiaoDingDan(id, "2").then(function (res) {
            User.getTradeList("2").then(function (res) {
              $scope.tradeList = res.data;
            });
          });
        },
        function () { },
        "确认",
        "取消"
      ).show();
    };
    $scope.danJiaBlur = function () {
      if ($scope.info.worth <= 0) {
        $scope.info.worth = 1;
        Message.show("单价必须大于0");
      }
    };
    $scope.popup = {
      isShow: false,
      realname: "",
      bankcard: "",
      alipay: "",
      wechat: "",
      mobile: ""
    };
    $scope.showZiLiao = function (id, role) {
      $scope.popup.role = role;
      User.geRenXinXi(id).then(function (res) {

        angular.element(document).ready(function () {
          // $scope.info = res.data;
          $scope.popup.realname = res.data.realname;
          $scope.popup.bankcard = res.data.bankcard;
          $scope.popup.bankName = res.data.bankName;
          $scope.popup.alipay = res.data.alipay;
          $scope.popup.wechat = res.data.wechat;
          $scope.popup.mobile = res.data.mobile;
          $scope.popup.isShow = true;
        });

        console.log("$scope.info: ", $scope.info);
      });
    };

    $scope.confirmAction = function () {
      $scope.popup.isShow = false;
    };
    $scope.copy = function (content) {
      $cordovaClipboard.copy(content).then(
        function () {
          Message.show("复制成功", 1500);
        },
        function () {
          // error
        }
      );
    };
    // 请求当前价CNY
    User.getKuangShiInfo().then(function (res) {
      $scope.info.curWorth = res.data.worth;
      $scope.info.worth = res.data.worth;
    });
    //获取挂单信息
    User.getGuaDanInfo("2").then(function (res) {
      $scope.info.max_num = res.data.max_num;
      $scope.info.min_num = res.data.min_num;
      $scope.info.num = res.data.min_num;
      $scope.info.isShow = res.data.isShow;
    });
    //卖家看板列表
    User.getMaiJiaKanBan("2").then(function (res) {
      $scope.displayList = res.data;
    });
    // 交易信箱列表
    User.getTradeList("2").then(function (res) {
      $scope.tradeList = res.data;
    });

    $scope.doRefresh = function () {
      //卖家看板列表
      User.getMaiJiaKanBan("2").then(function (res) {
        $scope.displayList = res.data;
      });
      // 交易信箱列表
      User.getTradeList("2").then(function (res) {
        $scope.tradeList = res.data;
      });
      $scope.$broadcast("scroll.refreshComplete");
      $ionicLoading.show({
        noBackdrop: true,
        template: "刷新成功",
        duration: "1500"
      });
      $timeout(function () {
        $scope.noMore = false;
      }, 1000);
    };

    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      if ($scope.option1 == "tab1") {
        User.getMaiJiaKanBan("2", $scope.page).then(function (res) {
          $scope.displayList = $scope.displayList.concat(res.data);
          $scope.$broadcast("scroll.infiniteScrollComplete");
          if (res.code == 0 && res.data.length == 0) {
            $ionicLoading.show({
              noBackdrop: true,
              template: "没有更多了",
              duration: "1500"
            });
            $scope.noMore = true;
          }
        });
      } else if ($scope.option1 == "tab2") {
        User.getTradeList("2", $scope.page).then(function (res) {
          $scope.tradeList = $scope.tradeList.concat(res.data);
          $scope.$broadcast("scroll.infiniteScrollComplete");
          if (res.code == 0 && res.data.length == 0) {
            $ionicLoading.show({
              noBackdrop: true,
              template: "没有更多了",
              duration: "1500"
            });
            $scope.noMore = true;
          }
        });
      }
    };
  })
  .controller("xinShouGuaDanCtrl", function (
    $scope,
    User,
    Message,
    $ionicLoading,
    $timeout,
    $cordovaClipboard
  ) {
    $scope.info = {
      num: 10,
      curWorth: "",
      worth: "",
      isShow: false, //是否挂单
      max_num: "", //最大挂单个数
      min_num: "" //最小挂单个数
    };
    $scope.option1 = "tab1";
    $scope.options1Show = function (option1) {
      $scope.option1 = option1;
    };
    $scope.guaMaiDan = function () {
      new Confirm(
        "确认挂单吗?",
        function () {
          User.guaMaiDan($scope.info, "1").then(function (res) {
            Message.show(res.msg, 1500);
            User.getTradeList("1").then(function (res) {
              $scope.tradeList = res.data;
            });
          });
        },
        function () { },
        "确认",
        "取消"
      ).show();
    };
    $scope.maiGeiTa = function (id) {
      new Prompt(
        "请输入交易密码",
        "交易密码",
        function () {
          var pwd = this.text();
          User.maiGeiTa(id, pwd).then(function (res) {
            Message.show(res.msg, 1500);
            User.getMaiJiaKanBan("1").then(function (res) {
              $scope.displayList = res.data;
            });
            User.getTradeList("1").then(function (res) {
              $scope.tradeList = res.data;
            });
          });
        },
        function () { },
        "确认",
        "取消"
      ).show();
    };
    $scope.quXiaoJiaoYi = function (id) {
      new Confirm(
        "确认取消交易吗?",
        function () {
          User.quXiaoJiaoYi(id).then(function (res) {
            User.getMaiJiaKanBan("1").then(function (res) {
              $scope.displayList = res.data;
            });
            User.getTradeList("1").then(function (res) {
              $scope.tradeList = res.data;
            });
          });
        },
        function () { },
        "确认",
        "取消"
      ).show();
    };
    $scope.queRenJiaoYi = function (id, role) {
      User.queRenJiaoYi(id, role).then(function (res) {
        User.getMaiJiaKanBan("1").then(function (res) {
          $scope.displayList = res.data;
        });
        User.getTradeList("1").then(function (res) {
          $scope.tradeList = res.data;
        });
      });
    };
    $scope.quXiaoDingDan = function (id) {
      new Confirm(
        "确认取消挂单吗?",
        function () {
          User.quXiaoDingDan(id, "1").then(function (res) {
            User.getTradeList("1").then(function (res) {
              $scope.tradeList = res.data;
            });
          });
        },
        function () { },
        "确认",
        "取消"
      ).show();
    };
    $scope.popup = {
      isShow: false,
      realname: "",
      bankcard: "",
      alipay: "",
      wechat: "",
      mobile: ""
    };
    $scope.showZiLiao = function (id, role) {
      $scope.popup.role = roles;
      User.geRenXinXi(id).then(function (res) {
        $scope.popup.isShow = true;
        angular.element(document).ready(function () {
          $scope.popup.realname = res.data.realname;
          $scope.popup.bankcard = res.data.bankcard;
          $scope.popup.bankName = res.data.bankName;
          $scope.popup.alipay = res.data.alipay;
          $scope.popup.wechat = res.data.wechat;
          $scope.popup.mobile = res.data.mobile;
        });
      });
    };
    $scope.confirmAction = function () {
      $scope.popup.isShow = false;
    };
    $scope.copy = function (content) {
      $cordovaClipboard.copy(content).then(
        function () {
          Message.show("复制成功", 1500);
        },
        function () {
          // error
        }
      );
    };
    $scope.doRefresh = function () {
      //卖家看板列表
      User.getMaiJiaKanBan("1").then(function (res) {
        $scope.displayList = res.data;
      });
      // 交易信箱列表
      User.getTradeList("1").then(function (res) {
        $scope.tradeList = res.data;
      });
      $scope.$broadcast("scroll.refreshComplete");
      $ionicLoading.show({
        noBackdrop: true,
        template: "刷新成功",
        duration: "1500"
      });
      $timeout(function () {
        $scope.noMore = false;
      }, 1000);
    };
    // 请求当前价CNY
    User.getKuangShiInfo().then(function (res) {
      $scope.info.curWorth = res.data.worth;
      $scope.info.worth = res.data.worth;
    });
    //获取挂单信息
    User.getGuaDanInfo("1").then(function (res) {
      $scope.info.max_num = res.data.max_num;
      $scope.info.min_num = res.data.min_num;
      $scope.info.num = res.data.min_num;
      $scope.info.isShow = res.data.isShow;
    });
    //卖家看板列表
    User.getMaiJiaKanBan("1").then(function (res) {
      $scope.displayList = res.data;
    });
    // 交易信箱列表
    User.getTradeList("1").then(function (res) {
      $scope.tradeList = res.data;
    });

    $scope.noMore = false;
    $scope.page = 2;

    $scope.loadMore = function () {
      if ($scope.option1 == "tab1") {
        User.getMaiJiaKanBan("1", $scope.page).then(function (res) {
          $scope.displayList = $scope.displayList.concat(res.data);
          $scope.$broadcast("scroll.infiniteScrollComplete");
          if (res.code == 0 && res.data.length == 0) {
            $ionicLoading.show({
              noBackdrop: true,
              template: "没有更多了",
              duration: "1500"
            });
            $scope.noMore = true;
          }
        });
      } else if ($scope.option1 == "tab2") {
        User.getTradeList("1", $scope.page).then(function (res) {
          $scope.tradeList = $scope.tradeList.concat(res.data);
          $scope.$broadcast("scroll.infiniteScrollComplete");
          if (res.code == 0 && res.data.length == 0) {
            $ionicLoading.show({
              noBackdrop: true,
              template: "没有更多了",
              duration: "1500"
            });
            $scope.noMore = true;
          }
        });
      }
    };
  })
  .controller("geRenZiLiaoCtrl", function (
    $scope,
    User,
    $ionicLoading,
    $stateParams
  ) {
    $scope.$on("$ionicView.beforeEnter", function () { });

    $scope.doRefresh = function () {
      User.geRenXinXi().then(function (res) {
        $scope.info = res.data;
        $scope.$broadcast("scroll.refreshComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "刷新成功",
          duration: "1500"
        });
      });
    };

    User.geRenXinXi().then(function (res) {
      $scope.info = res.data;
    });
  })
  .controller("realNameCtrl", function (
    $scope,
    ENV,
    User,
    Message,
    $interval,
    $timeout,
    $state,
    $stateParams,
    $ionicHistory

  ) {
    $scope.info = {
      mobile: "",
      bankcard: "",
      idcard: "",
      realname: "",
      code: "",
      bol: false,
      number: 60,
      smrzStatus: 0,
      type: $stateParams.type,
      bankname: ''
    };
    $scope.btnDisabled = false;
    console.log($stateParams.type);

    $scope.sendCode = function () {
      if (!$scope.info.mobile || !ENV.REGULAR_MOBILE.test($scope.info.mobile)) {
        Message.show("请输入预留手机号");
        return;
      }
      User.sendShiMingCode($scope.info.mobile).then(function (res) {
        Message.show(res.msg, 1500);
        $scope.countDown();
      });
    };
    $scope.shiMing = function () {

      if (!$scope.info.realname) {
        Message.show("请输入真实姓名");
        return;
      }
      if (!$scope.info.idcard || !ENV.REGULAR_IDCARD.test($scope.info.idcard)) {
        Message.show("请输入身份证号");
        return;
      }
      if (!$scope.info.bankcard) {
        Message.show("请输入银行卡号");
        return;
      }
      if (!$scope.info.mobile || !ENV.REGULAR_MOBILE.test($scope.info.mobile)) {
        Message.show("请输入预留手机号");
        return;
      }
      if (!$scope.info.code) {
        Message.show("请输入验证码");
        return;
      }

      $scope.btnDisabled = true;
      // $timeout(function () {
      //   console.log($scope.btnDisabled)
      //   $scope.btnDisabled = false;
      // }, 2000)

      User.shiMingRenZheng($scope.info).then(function (res) {
    		$scope.btnDisabled = true;
        Message.show(res.msg, 2000);
        $timeout(function () {
          $state.go("tab.my");
          $scope.btnDisabled = false;
        }, 2000);
      }, function (res) {
        console.log('ddd')
        Message.show(res.msg, 2000);
        $timeout(function () {
          $scope.btnDisabled = false;
        }, 2000);
      });
    };

    //发送验证后倒计时
    $scope.countDown = function () {
      $scope.info.bol = true;
      $scope.info.number = 60;
      var timer = $interval(function () {
        if ($scope.info.number <= 1) {
          $interval.cancel(timer);
          $scope.info.bol = false;
          $scope.info.number = 60;
        } else {
          $scope.info.number--;
        }
      }, 1000);
    };

    User.shiMingZhuangTai().then(function (res) {
      if (res.code == 0) {
        $scope.info.smrzStatus = 0;
      } else if (res.code == 1) {
        new Alert(res.msg, function () {
          $ionicHistory.goBack();
        }).show();
      } else if (res.code == 2) {
        new Alert(res.msg, function () { }).show();
      } else if (res.code == 3) {
        $scope.info.smrzStatus = 3;
      }
    });
    User.geRenXinXi().then(function (res) {
      $scope.info.realname = res.data.realname;
      $scope.info.bankcard = res.data.bankcard;
      $scope.info.idcard = res.data.idcard;
      if ($scope.info.bankcard) {
        var str = $scope.info.bankcard;
        $scope.info.bankcardShow = str.substring(
          str.length - 4,
          str.length - 0
        );
      }
    });
  })
  .controller("zhiFuBaoRenCtrl", function (
    $scope,
    User,
    Message,
    $stateParams,
    $timeout,
    $state
  ) {
    $scope.type = $stateParams.type;
    $scope.info = {
      val: ""
    };

    $scope.shiMing = function () {
      if (!$scope.info.val) {
        Message.show("请输入账号");
        return;
      }
      User.zhiFuBaoRen($scope.type, $scope.info.val).then(function (res) {
	      Message.show(res.msg, 2000,function(){
	      	$state.go("user.geRenZiLiao");
	      });
      });
    };
  })
  .controller("zhangDanCtrl", function ($scope, User, $timeout, Message, $ionicLoading) {
    $scope.type = "6";
    $scope.select = 6;
    $scope.tabS = function (type) {
      $scope.type = type;
      $scope.page = 2;
      $scope.noMore = true;
      User.getZhangDanList($scope.type).then(function (res) {
        $scope.list = res.data;
        $timeout(function () {
          $scope.noMore = false;
        }, 1000);
      });
    };
    $scope.onSwipe = function (a) {
      $scope.noMore = true;
      $scope.page = 2;
      if (a == "l") {
        // if(!$scope.type){
        // 	$scope.type  = '6';
        // }
        $scope.type--;

        //   $scope.type = $scope.select
        console.log("l");
        if ($scope.type >= 0) {
          User.getZhangDanList($scope.type).then(function (res) {
            $scope.list = res.data;
          });
        }
        $scope.type = Math.max(0, $scope.type);
        console.log("$scope.type--: ", $scope.type);
      } else {
        console.log("r");
        //   if($scope.type == ''){
        // 	$scope.type  = '6';
        //   }
        $scope.type++;
        if ($scope.type <= 5) {
          User.getZhangDanList($scope.type).then(function (res) {
            $scope.list = res.data;
          });
        }
        $scope.type = Math.min(6, $scope.type);
        //   if($scope.type == '6'){
        // 	$scope.type = ''
        //   }
      }
    };
    User.geRenXinXi().then(function (res) {
      $scope.total_vrc =
        parseInt(res.data.all_vrc) + parseInt(res.data.freeze_vrc);
      console.log("$scope.total_vrc: ", $scope.total_vrc);
    });

    $scope.doRefresh = function () {
      $scope.noMore = true;
      $scope.page = 2;
      User.getZhangDanList($scope.type).then(function (res) {
        $scope.list = res.data;
        $scope.$broadcast("scroll.refreshComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "刷新成功",
          duration: "1500"
        });
        $timeout(function () {
          $scope.noMore = false;
        }, 1000);
      });
    }



    $scope.page = 2;
    $scope.noMore = false
    $scope.loadMore = function () {
      User.getZhangDanList($scope.type, $scope.page).then(function (res) {
        $scope.page++
        $scope.list = $scope.list.concat(res.data);
        $scope.$broadcast("scroll.infiniteScrollComplete");
        if (res.code == 0 && res.data.length == 0) {
          $ionicLoading.show({
            noBackdrop: true,
            template: "没有更多了",
            duration: "1500"
          });
          $scope.noMore = true;
        }
      });
    }
    User.getZhangDanList($scope.type).then(function (res) {
      $scope.list = res.data;
    });
  })
  .controller("xiaoXiTongZhiCtrl", function (
    $scope,
    User,
    $timeout,
    Message,
    $ionicLoading
  ) {
    User.getXiaoXi().then(function (res) {
      $scope.list = res.data;
    });

    $scope.doRefresh = function () {
      $scope.noMore = true;
      $scope.page = 2;

      User.getXiaoXi().then(function (res) {
        $scope.list = res.data;
        $scope.$broadcast("scroll.refreshComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "刷新成功",
          duration: "1500"
        });
        $timeout(function () {
          $scope.noMore = false;
        }, 1000);
      });
    };

    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      User.getXiaoXi($scope.page).then(function (res) {
        $scope.page++;
        $scope.list = $scope.list.concat(res.data);
        $scope.$broadcast("scroll.infiniteScrollComplete");
        if (res.code == 0 && res.data.length == 0) {
          $ionicLoading.show({
            noBackdrop: true,
            template: "没有更多了",
            duration: "1500"
          });
          $scope.noMore = true;
        }
      });
    };
  })
  .controller("xiaoXiXiangQingCtrl", function ($scope, $stateParams, User, $rootScope) {
    $scope.info = {
      info: "",
      title: "",
      id: ""
    };
    if ($stateParams.type == "about") {
      User.guanYu().then(function (res) {
        $scope.info.info = res.data;
        $scope.info.title = "关于" + $rootScope.globalInfo.noun.coin_name;
        angular.element(document).ready(function () {
          $("#content").html($scope.info.info);
        });
      });
    } else {
      User.getXiaoXiXQ($stateParams.id).then(function (res) {
        $scope.info = res.data;
        angular.element(document).ready(function () {
          $("#content").html($scope.info.info);
        });
      });
    }
  })
  .controller("sheZhiCtrl", function (
    //	cordova,
    $scope,
    Message,
    $cordovaAppVersion,
    Storage,
    $rootScope,
    $ionicActionSheet,
    $ionicHistory,
    $ionicLoading,
    $timeout,
    $state
  ) {
  	 $scope.version = ''
    document.addEventListener("deviceready", function () {
      $cordovaAppVersion.getVersionNumber().then(function (version) {
        $scope.version = version;
      });
   	}, false)
    $scope.logout = function () {
      $ionicActionSheet.show({
        destructiveText: "退出登录",
        titleText: "确定退出当前登录账号吗？",
        cancelText: "取消",
        cancel: function () {
          return true;
        },
        destructiveButtonClicked: function () {
          Storage.remove("user");
          $ionicHistory.clearCache();
          $ionicHistory.clearHistory();
          $ionicHistory.nextViewOptions({
            //退出后清除导航的返回
            disableBack: true
          });
          $ionicLoading.show({
            noBackdrop: true,
            template: "退出成功！",
            duration: "1500"
          });
          $timeout(function () {
            $state.go("auth.login");
          }, 1500);
          return true;
        }
      });
    };

    // $scope.logout = function(){
    // 	Storage.remove('user');
    // 	Message.show('退出成功！', '1500', function () {
    // 		$state.go('auth.login')
    // 	});
    // }
  })
  .controller("dengMaXiuCtrl", function (
    $scope,
    $stateParams,
    User,
    Message,
    $timeout,
    $state,
    Storage,
    $ionicHistory
  ) {
    $scope.type = "login_pwd";
    $scope.info = {
      pwd: "",
      newPwd: "",
      surePwd: ""
    };

    $scope.xiuGai = function () {
      if (!$scope.info.pwd) {
        Message.show("请输入旧密码");
        return;
      }
      if (!$scope.info.newPwd) {
        Message.show("请输入新密码");
        return;
      }
      if (!$scope.info.surePwd) {
        Message.show("请确认新密码");
        return;
      }
      if ($scope.info.newPwd != $scope.info.surePwd) {
        Message.show("两次密码不一致");
        return;
      }
      User.xiuGaiMiMa($scope.type, $scope.info).then(function (res) {
        Message.show(res.msg, 2000);
        Storage.remove("user");
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        $ionicHistory.nextViewOptions({
          //退出后清除导航的返回
          disableBack: true
        });

        $timeout(function () {
          $state.go("auth.login");
        }, 2000);
      });
    };
  })
  .controller("jiaoMaXiuCtrl", function (
    $scope,
    $stateParams,
    User,
    Message,
    $timeout,
    $state
  ) {
    $scope.type = "trade_pwd";
    $scope.info = {
      pwd: "",
      newPwd: "",
      surePwd: ""
    };

    $scope.xiuGai = function () {
      if (!$scope.info.pwd) {
        Message.show("请输入旧密码");
        return;
      }
      if (!$scope.info.newPwd) {
        Message.show("请输入新密码");
        return;
      }
      if (!$scope.info.surePwd) {
        Message.show("请确认新密码");
        return;
      }
      if ($scope.info.newPwd != $scope.info.surePwd) {
        Message.show("两次密码不一致");
        return;
      }
      User.xiuGaiMiMa($scope.type, $scope.info).then(function (res) {
        Message.show(res.msg, 2000);

        $timeout(function () {
          $state.go("user.geRenZiLiao");
        }, 2000);
      });
    };
  })
  .controller("wangJiJiaoMaCtrl", function (
    $scope,
    $stateParams,
    ENV,
    Auth,
    User,
    Message,
    $timeout,
    $state,
    $interval
  ) {
    $scope.info = {
      pwd: "",
      newPwd: "",
      surePwd: "",
      mobile: "",
      code: "",
      bol: false,
      number: 60
    };
    $scope.countDown = function () {
      $scope.info.bol = true;
      $scope.info.number = 60;
      var timer = $interval(function () {
        if ($scope.info.number <= 1) {
          $interval.cancel(timer);
          $scope.info.bol = false;
          $scope.info.number = 60;
        } else {
          $scope.info.number--;
        }
      }, 1000);
    };
    $scope.role = "trade_pwd";
    $scope.sendCode = function () {
      if (!$scope.info.mobile || !ENV.REGULAR_MOBILE.test($scope.info.mobile)) {
        Message.show("请输入手机号");
        return;
      }
      Auth.sendRegCode($scope.info.mobile, "forget").then(function (res) {
        Message.show(res.msg);
        $scope.countDown();
      });
    };

    $scope.xiuGai = function () {
      if (!$scope.info.mobile || !ENV.REGULAR_MOBILE.test($scope.info.mobile)) {
        Message.show("请输入手机号");
        return;
      }
      if (!$scope.info.code) {
        Message.show("请输入验证码");
        return;
      }
      if (!$scope.info.newPwd) {
        Message.show("请输入新密码");
        return;
      }
      if (!$scope.info.surePwd) {
        Message.show("请确认新密码");
        return;
      }
      if ($scope.info.newPwd != $scope.info.surePwd) {
        Message.show("两次密码不一致");
        return;
      }
      User.wangJiMiMa($scope.info, $scope.role).then(function (res) {
        Message.show(res.msg, 2000);

        $timeout(function () {
          $state.go("user.geRenZiLiao");
        }, 2000);
      });
    };
  })
  .controller("wangJiDengMaCtrl", function (
    $scope,
    $stateParams,
    ENV,
    Auth,
    User,
    Message,
    $timeout,
    $state,
    $interval
  ) {
    $scope.info = {
      pwd: "",
      newPwd: "",
      surePwd: "",
      mobile: "",
      code: "",
      bol: false,
      number: 60
    };
    $scope.countDown = function () {
      $scope.info.bol = true;
      $scope.info.number = 60;
      var timer = $interval(function () {
        if ($scope.info.number <= 1) {
          $interval.cancel(timer);
          $scope.info.bol = false;
          $scope.info.number = 60;
        } else {
          $scope.info.number--;
        }
      }, 1000);
    };
    $scope.role = "login_pwd";
    $scope.sendCode = function () {
      if (!$scope.info.mobile || !ENV.REGULAR_MOBILE.test($scope.info.mobile)) {
        Message.show("请输入手机号");
        return;
      }
      Auth.sendRegCode($scope.info.mobile, "forget").then(function (res) {
        Message.show(res.msg);
        $scope.countDown();
      });
    };

    $scope.xiuGai = function () {
      if (!$scope.info.mobile || !ENV.REGULAR_MOBILE.test($scope.info.mobile)) {
        Message.show("请输入手机号");
        return;
      }
      if (!$scope.info.code) {
        Message.show("请输入验证码");
        return;
      }
      if (!$scope.info.newPwd) {
        Message.show("请输入新密码");
        return;
      }
      if (!$scope.info.surePwd) {
        Message.show("请确认新密码");
        return;
      }
      if ($scope.info.newPwd != $scope.info.surePwd) {
        Message.show("两次密码不一致");
        return;
      }
      User.wangJiMiMa($scope.info, $scope.role).then(function (res) {
        Message.show(res.msg, 2000);

        $timeout(function () {
          $state.go("auth.login");
        }, 2000);
      });
    };
  })
  .controller("kefuZhongXinCtrl", function (User, $scope, $rootScope) {
    User.keFuZhongXin().then(function (res) {
      angular.element(document).ready(function () {
        $("#content").html(res.data);
      });
    });
  })
  .controller("jiaoYiDaTingCtrl", function (
    $scope,
    User,
    Message,
    $stateParams,
    $cordovaClipboard,
    $timeout,
    $ionicLoading,
    $cordovaCamera,
    $ionicActionSheet
  ) {
    $scope.option = $stateParams.type || "1";
    ($scope.optionS = function (option) {
      $scope.option = option;
      if ($scope.option == '3') {
        $scope.getComplete()
      } else {
        $scope.getTradeList();
      }

    });
    $scope.getTradeList = function () {
      $scope.page = 2;
      $scope.noMore = false;
      User.getTradeList($scope.option).then(function (res) {
        $scope.tradeList = res.data;
        console.log($scope.tradeList)
      });
    };
    $scope.getComplete = function () {
      $scope.page = 2;
      $scope.noMore = false;
      User.getComplete($scope.option).then(function (res) {
        $scope.tradeList = res.data;
      })
    };
    $scope.quXiaoJiaoYi = function (id) {
      new Confirm(
        "确认取消交易吗?",
        function () {
          User.quXiaoJiaoYi(id).then(function (res) {
            $scope.getTradeList();
          });
        },
        function () { },
        "确认",
        "取消"
      ).show();
    };
    $scope.queRenJiaoYi = function (id, role) {
      User.queRenJiaoYi(id, '', role).then(function (res) {
        $scope.getTradeList();
      });
    };

    $scope.quXiaoDingDan = function (id) {
      new Confirm(
        "确认取消挂单吗?",
        function () {
          User.quXiaoDingDan(id, "2").then(function (res) {
            $scope.getTradeList();
          });
        },
        function () { },
        "确认",
        "取消"
      ).show();
    };
    $scope.popup = {
      isShow: false,
      realname: "",
      bankcard: "",
      alipay: "",
      wechat: "",
      mobile: "",
      isShowPic: false,
      user_id: '',
      role: '',
      pingzheng: ''
    };
    $scope.showZiLiao = function (id, role, orderId) {
      User.geRenXinXi(id).then(function (res) {

        // $timeout(function(){
        // angular.element(document).ready(function() {


        $scope.info = res.data;
        console.log("$scope.info: ", $scope.info);
        $scope.popup.realname = res.data.realname;
        $scope.popup.bankcard = res.data.bankcard;
        $scope.popup.bankName = res.data.bankname;
        $scope.popup.alipay = res.data.alipay;
        $scope.popup.wechat = res.data.wechat;
        $scope.popup.mobile = res.data.mobile;
        // });
        // },200)

        $scope.popup.isShow = true;

      });
      $scope.popup.role = role;


      if (orderId) {
        User.getPingZheng(orderId).then(function (res) {
          $scope.popup.pingzheng = res.data
        })
      }

    };
    $scope.showPic = function (id, role) {
      $scope.popup.isShowPic = true;
      $scope.popup.user_id = id;
      $scope.popup.role = role;

    }
    $scope.confirmAction = function () {
      $scope.popup.isShow = false;

    };
    $scope.confirmAction2 = function (index) {
      if (index == '0') {
        $scope.popup.isShowPic = false;
      } else {

        User.queRenJiaoYi($scope.popup.user_id, $scope.pingzheng, $scope.popup.role).then(function (res) {
          $scope.popup.isShowPic = false;
          $scope.getTradeList();
        });
      }

    };
    $scope.copy = function (content) {
      $cordovaClipboard.copy(content).then(
        function () {
          Message.show("复制成功", 1500);
        },
        function () {
          // error
        }
      );
    };
    var selectImages = function (from) {
      var options = {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: false,
        targetWidth: 1500,
        targetHeight: 2000,
        correctOrientation: true,
        cameraDirection: 0
      };
      if (from == 'camera') {
        options.sourceType = Camera.PictureSourceType.CAMERA;
      }
      document.addEventListener("deviceready", function () {
        $cordovaCamera.getPicture(options).then(function (imageURI) {
          $scope.pingzheng = "data:image/jpeg;base64," + imageURI;
          var image = document.getElementById('divImg');
          image.style.backgroundImage = "url(data:image/jpeg;base64," + imageURI + ")";

        }, function (error) {
          console.log('失败原因：' + error);
          Message.show('选择失败,请重试.', 1000);
        });
      }, false);
    };
    // 弹出选择图片 
    $scope.chuanPingZheng = function () {
      var buttons = [];
      buttons = [{
        text: "拍一张照片"
      },
        {
          text: "从相册选一张"
        }
      ]
      $ionicActionSheet.show({
        buttons: buttons,
        titleText: '请选择',
        cancelText: '取消',
        buttonClicked: function (index) {
          if (index == 0) {
            selectImages("camera");
          } else if (index == 1) {
            selectImages();
          }
          return true;
        }
      })
    };



    $scope.doRefresh = function () {
      $scope.noMore = true;
      $scope.page = 2;
      if ($scope.option == '3') {

        User.getComplete($scope.option).then(function (res) {
          $scope.tradeList = res.data;
          $scope.$broadcast("scroll.refreshComplete");
          $ionicLoading.show({
            noBackdrop: true,
            template: "刷新成功",
            duration: "1500"
          });
          $timeout(function () {
            $scope.noMore = false;
          }, 1000);
        })
      } else {
        User.getTradeList($scope.option).then(function (res) {
          $scope.tradeList = res.data;
          $scope.$broadcast("scroll.refreshComplete");
          $ionicLoading.show({
            noBackdrop: true,
            template: "刷新成功",
            duration: "1500"
          });
          $timeout(function () {
            $scope.noMore = false;
          }, 1000);
        });
      }

    };
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {

      if ($scope.option == '3') {
        User.getComplete($scope.option, $scope.page).then(function (res) {
          $scope.tradeList = $scope.tradeList.concat(res.data);
          $scope.page++;
          $scope.$broadcast("scroll.infiniteScrollComplete");
          if (res.code == 0 && res.data.length == 0) {
            $ionicLoading.show({
              noBackdrop: true,
              template: "没有更多了",
              duration: "1500"
            });
            $scope.noMore = true;
          }
        });
      } else {
        User.getTradeList($scope.option, $scope.page).then(function (res) {
          $scope.tradeList = $scope.tradeList.concat(res.data);
          $scope.page++;
          $scope.$broadcast("scroll.infiniteScrollComplete");
          if (res.code == 0 && res.data.length == 0) {
            $ionicLoading.show({
              noBackdrop: true,
              template: "没有更多了",
              duration: "1500"
            });
            $scope.noMore = true;
          }
        });
      }

    };
    User.getTradeList($scope.option).then(function (res) {
      $scope.tradeList = res.data;

      console.log("  $scope.tradeList:", $scope.tradeList);
    });
  })
  .controller("kuangJiXiangQingCtrl", function (
    $scope,
    $stateParams,
    User,
    $interval,
    $timeout
  ) {
    $scope.$on("$ionicView.beforeEnter", function () { });
    $scope.info = {
      drVRC: "",
      output_total: "",
      suanli: "",
      pro_name: "",
      five_sec: "",
      qwsl: ""
    };
    User.kuangJiXQ($stateParams.id).then(function (res) {
      $scope.info.drVRC = res.data.detail.drVRC;

      $scope.info.output_total = res.data.detail.output_total;
      $scope.info.suanli = res.data.detail.suanli;
      $scope.info.pro_name = res.data.detail.pro_name;
      $scope.info.five_sec = res.data.detail.five_sec;
      $scope.info.qwsl = res.data.qwsl;
    });

    $interval(function () {
      $scope.info.drVRC = (
        Number($scope.info.drVRC) + Number($scope.info.five_sec)
      ).toFixed(8);

      console.log("$scope.info.drVRC: ", typeof $scope.info.drVRC);
      //  parseFloat(0.0000004)+ parseFloat(0.0000004)

      // $scope.info.drVRC =  parseFloat($scope.info.drVRC).toFixed(8)+parseFloat($scope.info.five_sec).toFixed(8)
      $scope.info.output_total = (
        Number($scope.info.output_total) + Number($scope.info.five_sec)
      ).toFixed(8);
    }, 5000);

    // $timeout(function(){
    //   angular.element(document).ready(function() {
    //     var matrix = document.getElementById("matrix");
    //     console.log("matrix: ", matrix);

    //     var context = matrix.getContext("2d");
    //     matrix.height = window.innerHeight;
    //     matrix.width = window.innerWidth;
    //     var drop = [];
    //     var font_size = 16;
    //     var columns = matrix.width / font_size;
    //     for (var i = 0; i < columns; i++) drop[i] = 1;

    //     function drawMatrix() {
    //       context.fillStyle = "rgba(0, 0, 0, 0.1)";
    //       context.fillRect(0, 0, matrix.width, matrix.height);

    //       context.fillStyle = "green";
    //       context.font = font_size + "px";
    //       for (var i = 0; i < columns; i++) {
    //         context.fillText(
    //           Math.floor(Math.random() * 2),
    //           i * font_size,
    //           drop[i] * font_size
    //         ); /*get 0 and 1*/

    //         if (
    //           drop[i] * font_size > matrix.height * 2 / 3 &&
    //           Math.random() > 0.85
    //         )
    //           /*reset*/
    //           drop[i] = 0;
    //         drop[i]++;
    //       }
    //     }
    //     setInterval(drawMatrix, 40);

    //     // var i = parseFloat(document.getElementById("drGEC").innerHTML);
    //     var max = parseFloat(i + 0.00000424);
    //     // var time1 = setInterval(function() {
    //     //   var time2 = setInterval(function() {
    //     //     i = parseFloat((i + 0.000222).toFixed(8));
    //     //     console.log(i);
    //     //     if (i >= max) {
    //     //       clearInterval(time2);
    //     //       i = max;
    //     //     }
    //     //     $("#drGEC").html(i.toFixed(8));
    //     //   }, 10);
    //     //   max = i + 0.00000424;
    //     //   $("#drGEC").html(i);
    //     // }, 5000);
    //     // var s = parseFloat(document.getElementById("ljGEC").innerHTML);
    //     //    console.log(s);
    //     // var time2 = setInterval(function() {

    //     //   s = parseFloat((s + 0.00000424).toFixed(8));
    //     //   $("#ljGEC").html(s.toFixed(8));
    //     // }, 5000);
    //   });
    // },0)
  })
  .controller("bangZhuZhongXinCtrl", function (
    $scope,
    User,
    Message,
    $ionicLoading,
    $timeout
  ) {
    $scope.doRefresh = function () {
      $scope.noMore = true;
      $scope.page = 2;

      User.bangZhuLieBiao().then(function (res) {
        $scope.list = res.data;
        $scope.$broadcast("scroll.refreshComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "刷新成功",
          duration: "1500"
        });
        $timeout(function () {
          $scope.noMore = false;
        }, 1000);
      });
    };
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      User.bangZhuLieBiao().then(function (res) {
        $scope.page++;
        $scope.list = $scope.list.concat(res.data);
        $scope.$broadcast("scroll.infiniteScrollComplete");
        if (res.code == 0 && res.data.length == 0) {
          $ionicLoading.show({
            noBackdrop: true,
            template: "没有更多了",
            duration: "1500"
          });
          $scope.noMore = true;
        }
      });
    };

    User.bangZhuLieBiao().then(function (res) {
      $scope.list = res.data;
    });
  })
  .controller("bangZhuXiangQingCtrl", function (
    $scope,
    User,
    Message,
    $stateParams
  ) {
    User.bangZhuXiangQing($stateParams.id).then(function (res) {
      angular.element(document).ready(function () {
        $("#content").html(res.data.info);
      });
    });
  })
  .controller("fanKuiZhongXinCtrl", function ($scope, User, Message, $timeout, $state) {
    $scope.showPlatform = false;
    $scope.fankui = {
      cateId: "",
      cateName: "",
      title: "",
      content: ""
    };
    $scope.platformType = false;
    $scope.platformType = function (title) {
      $scope.fankui.cateName = title;
      $scope.showPlatform = true;
    };
    $scope.info = [
      {
        id: "1",
        title: "咨询"
      },
      {
        id: "2",
        title: "建议"
      }
    ];
    $scope.submit = function () {
      if (!$scope.fankui.cateName) {
        Message.show("请选择反馈类型");
        return false;
      }
      if (!$scope.fankui.title) {
        Message.show("请输入题目");
        return false;
      }
      if (!$scope.fankui.content) {
        Message.show("请输入内容");
        return false;
      }

      User.fanKuiZhongxin($scope.fankui, "save").then(function (res) {
        Message.show(res.msg, 2000)
        $timeout(function () {
          $state.go('tab.my')
        }, 2000)

      });
    };

    User.fanKuiZhongxin().then(function (res) {
      $scope.info = res.data;
    });
  })
  .controller("faBuWenZhangCtrl", function ($scope, User, Message, $timeout, $state) {
    $scope.info = {
      title: '',
      content: ''
    }

    $scope.submit = function () {

      User.faBuWenZhang($scope.info).then(function (res) {
        Message.show(res.msg, 2000)
        $timeout(function () {
          $state.go('user.WenZhangLieBiao')
        }, 2000)

      })
    }



  })
  .controller("WenZhangLieBiaoCtrl", function (
    $scope,
    User,
    Message,
    $ionicLoading,
    $timeout
  ) {
    ($scope.option = "1"),
      ($scope.optionS = function (option) {
        $scope.noMore = true;
        $scope.page = 2;
        $scope.option = option;
        User.wenZhangLieBiao($scope.option).then(function (res) {
          $scope.list = res.data;
        });
        $timeout(function () {
          $scope.noMore = false;
        }, 1000);
      });

    $scope.doRefresh = function () {
      $scope.noMore = true;
      $scope.page = 2;

      User.wenZhangLieBiao($scope.option).then(function (res) {
        $scope.list = res.data;
        $scope.$broadcast("scroll.refreshComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "刷新成功",
          duration: "1500"
        });
        $timeout(function () {
          $scope.noMore = false;
        }, 1000);
      });
    };
    $scope.noMore = false;
    $scope.page = 2;
    $scope.loadMore = function () {
      User.wenZhangLieBiao($scope.option, $scope.page).then(function (res) {
        $scope.page++;
        $scope.list = $scope.list.concat(res.data);
        $scope.$broadcast("scroll.infiniteScrollComplete");
        if (res.code == 0 && res.data.length == 0) {
          $ionicLoading.show({
            noBackdrop: true,
            template: "没有更多了",
            duration: "1500"
          });
          $scope.noMore = true;
        }
      });
    };

    User.wenZhangLieBiao($scope.option).then(function (res) {
      $scope.list = res.data;
    });
  })
  .controller("artDetailCtrl", function (
    $scope,
    User,
    Message,
    $ionicLoading,
    $timeout,
    $stateParams) {
    User.WenZhangXiangQing($stateParams.id).then(function (res) {
      angular.element(document).ready(function () {
        $("#content").html(res.data.content)
      })
    })



  })
  .controller('tuiJianMaCtrl', function ($scope, User, ENV, $rootScope, $stateParams, $cordovaClipboard, Message) {

    //     		$("#code").qrcode({ 
    //     render: "table", //table方式 
    //     width: 200, //宽度 
    //     height:200, //高度 
    //     text: "www.helloweba.com" //任意内容 
    // });

    $scope.imgSrc = ENV.YD_URL + "members/qrcode?uid=" + $stateParams.id

    $scope.link = '1'

    $scope.copy = function (link) {
      $cordovaClipboard.copy(link).then(
        function () {
          Message.show("复制成功", 1500);
        },
        function () {
          // error
        }
      );
    };
    console.log($stateParams.id)
    User.tuiJianLink($stateParams.id).then(function (res) {
      $scope.link = res.data
    })
    // User.tuiJianMa().then(function(res){
    //   console.log(res)
    // })


    // $.ajax({
    //     url: ENV.YD_URL + "members/qrcode",
    //     headers: {
    //         TOKEN:$rootScope.globalInfo.user.token
    //     },
    //     type: "get",
    //     success: function (data) {
    //     console.log('data: ', data);
    //     // $scope.imgSrc = data;
    //     $("#img").src(data)
    //     }
    //   });



  })
  .controller('phoneTopUpCtrl', function ($scope, Message, User, ENV, $timeout, $state) {
    $scope.info = {
      mobile: '',
      id: '',
      password: ''
    }
    $scope.list = [
      {
        id: '1',
        sum: '50',
        coin: '12'
      },
      {
        id: '2',
        sum: '50',
        coin: '12'
      },
    ]

    $scope.TopUpS = function (id) {
      $scope.info.id = id;
    }

    $scope.TopUp = function () {

      if (
        !$scope.info.mobile ||
        !ENV.REGULAR_MOBILE.test($scope.info.mobile)
      ) {
        Message.show("请输入正确的手机号");
        return;
      }
      if (
        !$scope.info.password
      ) {
        Message.show("请输入支付密码");
        return;
      }
      User.TopUp($scope.info).then(function (res) {
        Message.show(res.msg, 2000);
        $timeout(function () {
          $state.go('user.phoneTopUpRec')
        }, 2000)

      })
    }


    User.TopUpList().then(function (res) {
      $scope.list = res.data;
      $scope.info.id = $scope.list[0].id
    })

  })
  .controller("phoneTopUpRecCtrl", function ($scope, Message, User, $ionicLoading, $timeout) {
    $scope.list = ""
    $scope.statusArr = {
      '1': '充值成功',
      '2': '充值失败',
      '0': '稍后到账'
    }

    $scope.doRefresh = function () {
      $scope.noMore = true;
      $scope.page = 2;
      User.TopUpRec().then(function (res) {
        $scope.list = res.data
        $scope.$broadcast("scroll.refreshComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "刷新成功",
          duration: "1500"
        });
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
      })

    }



    $scope.page = 2
    $scope.noMore = false;
    $scope.loadMore = function () {

      User.TopUpRec($scope.page).then(function (res) {

        $scope.list = $scope.list.concat(res.data)
        $scope.page++;
        $scope.$broadcast("scroll.infiniteScrollComplete");
        if (res.code == 0 && res.data.length == 0) {
          $ionicLoading.show({
            noBackdrop: true,
            template: "没有更多了",
            duration: "1500"
          });
          $scope.noMore = true;
        }
      })

    }


    User.TopUpRec().then(function (res) {
      $scope.list = res.data
    })

  })
  .controller('introCtrl', function ($scope, User) {
    User.getAppIntro().then(function (res) {
      $scope.info = res.data
      console.log($scope.info)
      angular.element(document).ready(function () {
        console.log($('#info'))
        $('#intro').html($scope.info)
      })

    })
  })
  .controller('fuelTopUpCtrl', function ($scope, Message, User, ENV, $timeout, $state) {
    $scope.info = {
      card: '',
      mobile: '',
      id: '',
      password: ''
    }
    $scope.list = [
      {
        id: '1',
        sum: '50',
        coin: '12'
      },
      {
        id: '2',
        sum: '50',
        coin: '12'
      },
    ]

    $scope.TopUpS = function (id) {
      $scope.info.id = id;
    }

    $scope.TopUp = function () {
      if (
        !$scope.info.card
      ) {
        Message.show("请输入正确的加油卡号");
        return;
      }
      if (
        !$scope.info.mobile ||
        !ENV.REGULAR_MOBILE.test($scope.info.mobile)
      ) {
        Message.show("请输入正确的手机号");
        return;
      }
      if (
        !$scope.info.password
      ) {
        Message.show("请输入支付密码");
        return;
      }
      User.fuelTopUp($scope.info).then(function (res) {
        Message.show(res.msg, 2000);
        $timeout(function () {
          $state.go('user.fuelTopUpRec')
        }, 2000)

      })
    }


    User.fuelTopUpList().then(function (res) {
      $scope.list = res.data;
      $scope.info.id = $scope.list[0].id
    })
  })
  .controller('fuelTopUpRecCtrl', function ($scope, Message, User, $ionicLoading, $timeout) {
    $scope.list = ""
    $scope.statusArr = {
      '1': '充值成功',
      '2': '充值失败',
      '0': '稍后到账'
    }

    $scope.doRefresh = function () {
      $scope.noMore = true;
      $scope.page = 2;
      User.fuelTopUpRec().then(function (res) {
        $scope.list = res.data
        $scope.$broadcast("scroll.refreshComplete");
        $ionicLoading.show({
          noBackdrop: true,
          template: "刷新成功",
          duration: "1500"
        });
        $timeout(function () {
          $scope.noMore = false;
        }, 1000)
      })

    }



    $scope.page = 2
    $scope.noMore = false;
    $scope.loadMore = function () {

      User.fuelTopUpRec($scope.page).then(function (res) {

        $scope.list = $scope.list.concat(res.data)
        $scope.page++;
        $scope.$broadcast("scroll.infiniteScrollComplete");
        if (res.code == 0 && res.data.length == 0) {
          $ionicLoading.show({
            noBackdrop: true,
            template: "没有更多了",
            duration: "1500"
          });
          $scope.noMore = true;
        }
      })

    }


    User.fuelTopUpRec().then(function (res) {
      $scope.list = res.data
    })
  })