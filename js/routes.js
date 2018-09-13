angular.module('starter.routes', [])
	.config(function ($stateProvider, $urlRouterProvider) {
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
			.state('tab.home', {
				url: '/home',
				//				cache: false,
				views: {
					'tab-home': {
						templateUrl: 'templates/tab/tab-home.html',
						controller: 'homeCtrl'
					}
				}
			})
			.state('tab.kuangji', {
				url: '/kuangji',
				cache: false,
				views: {
					'tab-kuangji': {
						templateUrl: 'templates/tab/tab-kuangji.html',
						controller: 'kuangjiCtrl'
					}
				}
			})
			.state("tab.kuangchi", {
				url: "/kuangchi",
				cache: false,
				views: {
					"tab-kuangchi": {
						templateUrl: "templates/tab/tab-kuangchi.html",
						controller: "kuangchiCtrl"
					}
				}
			})

			.state('tab.kuangshi', {
				url: '/kuangshi',
				params: {
					"iscache": '',
					"option" : null
				},
				cache: false,
				views: {
					'tab-kuangshi': {
						templateUrl: 'templates/tab/tab-kuangshi.html',
						controller: 'kuangshiCtrl'
					}
				}
			})
			.state('tab.my', {
				url: '/my',
				// cache: false,
				params: {
					'from': ''
				},
				views: {
					'tab-my': {
						templateUrl: 'templates/tab/tab-my.html',
						controller: 'myCtrl'
					}
				}
			})
			.state('modals', {
				url: '/modals',
				abstract: true,
				template: '<ion-nav-view></ion-nav-view>'
			})
			.state('modals.location', {
				url: '/location',
				cache: false,
				params: {
					id: null
				},
				templateUrl: 'templates/modal/location.html',
				controller: 'homeCtrl'
			})
			.state('auth', {
				url: '/auth',
				abstract: true,
				template: '<ion-nav-view></ion-nav-view>'
			})

			.state('auth.login', {
				url: '/login',
				cache: false,
				templateUrl: 'templates/auth/login.html',
				controller: 'loginCtrl'
			})

			.state('auth.register', {
				url: '/register',
				cache: false,
				templateUrl: 'templates/auth/register.html',
				controller: 'registerCtrl'
			})
            .state('auth.addMobile', {
				url: '/addMobile',
				cache: false,
				params: {
					uid: '',
					logintype: ''
				},
				templateUrl: 'templates/auth/addMobile.html',
				controller: 'addMobileCtrl'
			})
			.state('auth.resetPsd', {
				url: '/resetPsd',
				cache: false,
				templateUrl: 'templates/auth/resetPsd.html',
				controller: 'resetPsdCtrl'
			})
			.state('user', {
				url: '/user',
				abstract: true,
				template: '<ion-nav-view></ion-nav-view>'
			})
			.state("user.intro", {
				url: "/intro",
				cache: false,
				templateUrl: "templates/tab/tab-intro.html",
				controller: "introCtrl"
			})
			// 加油卡充值
			.state('user.fuelTopUp', {
				url: '/fuelTopUp',
				cache: false,
				templateUrl: 'templates/user/fuelTopUp.html',
				controller: 'fuelTopUpCtrl'
			})
			.state('user.fuelTopUpRec', {
				url: '/fuelTopUpRec',
				cache: false,
				templateUrl: 'templates/user/fuelTopUpRec.html',
				controller: 'fuelTopUpRecCtrl'
			})
			// 手机充值

			.state('user.phoneTopUp', {
				url: '/phoneTopUp',
				cache: false,
				templateUrl: 'templates/user/phoneTopUp.html',
				controller: 'phoneTopUpCtrl'
			})
			.state('user.phoneTopUpRec', {
				url: '/phoneTopUpRec',
				cache: false,
				templateUrl: 'templates/user/phoneTopUpRec.html',
				controller: 'phoneTopUpRecCtrl'
			})
			.state('user.guoNeiGuaDan', {
				url: '/guoNeiGuaDan',
				cache: false,
				templateUrl: 'templates/user/guoNeiGuaDan.html',
				controller: 'guoNeiGuaDanCtrl'
			})
			.state('user.xinShouGuaDan', {
				url: '/xinShouGuaDan',
				cache: false,
				templateUrl: 'templates/user/xinShouGuaDan.html',
				controller: 'xinShouGuaDanCtrl'
			})
			.state('user.geRenZiLiao', {
				url: '/geRenZiLiao',
				cache: false,
				templateUrl: 'templates/user/geRenZiLiao.html',
				controller: 'geRenZiLiaoCtrl'
			})
			.state('user.realName', {
				url: '/realName/type',
				cache: false,
				params: {
					type: null
				},
				templateUrl: 'templates/user/realName.html',
				controller: 'realNameCtrl'
			})

			.state('user.zhiFuBaoRen', {
				url: '/zhiFuBaoRen/type',
				cache: false,
				params: {
					type: null
				},
				templateUrl: 'templates/user/zhiFuBaoRen.html',
				controller: 'zhiFuBaoRenCtrl'
			})
			.state('user.zhangDan', {
				url: '/zhangDan/type',
				cache: false,
				params: {
					type: null
				},
				templateUrl: 'templates/user/zhangDan.html',
				controller: 'zhangDanCtrl'
			})
			.state('user.xiaoXiTongZhi', {
				url: '/xiaoXiTongZhi',
				cache: false,
				templateUrl: 'templates/user/xiaoXiTongZhi.html',
				controller: 'xiaoXiTongZhiCtrl'
			})
			.state('user.xiaoXiXiangQing', {
				url: '/xiaoXiXiangQing',
				cache: false,
				params: {
					id: null,
					type: null
				},
				templateUrl: 'templates/user/xiaoXiXiangQing.html',
				controller: 'xiaoXiXiangQingCtrl'
			})
			.state('user.sheZhi', {
				url: '/sheZhi',
				cache: false,
				templateUrl: 'templates/user/sheZhi.html',
				controller: 'sheZhiCtrl'
			})
			.state('user.dengMaXiu', {
				url: '/dengMaXiu',
				cache: false,
				templateUrl: 'templates/user/dengMaXiu.html',
				controller: 'dengMaXiuCtrl'
			})
			.state('user.jiaoMaXiu', {
				url: '/dengMaXiu',
				cache: false,
				templateUrl: 'templates/user/jiaoMaXiu.html',
				controller: 'jiaoMaXiuCtrl'
			})

			.state('user.wangJiJiaoMa', {
				url: '/wangJiJiaoMa',
				cache: false,
				templateUrl: 'templates/user/wangJiJiaoMa.html',
				controller: 'wangJiJiaoMaCtrl'
			})

			.state('user.wangdenglu', {
				url: '/wangdenglu',
				cache: false,
				templateUrl: 'templates/user/wangJiDengMa.html',
				controller: 'wangJiDengMaCtrl'
			})
			.state('user.jiaoYiDaTing', {
				url: '/jiaoYiDaTing',
				cache: false,
				params: {
					type: ''
				},
				templateUrl: 'templates/user/jiaoYiDaTing.html',
				controller: 'jiaoYiDaTingCtrl'
			})

			.state('user.kuangJiXiangQing', {
				url: '/kuangJiXiangQing',
				cache: false,
				params: {
					id: null
				},
				templateUrl: 'templates/user/kuangJiXiangQing.html',
				controller: 'kuangJiXiangQingCtrl'
			})
			.state('user.kefuZhongXin', {
				url: '/kefuZhongXin',
				cache: false,
				templateUrl: 'templates/user/kefuZhongXin.html',
				controller: 'kefuZhongXinCtrl'
			})
			.state('user.bangZhuZhongXin', {
				url: '/bangZhuZhongXin',
				cache: false,
				templateUrl: 'templates/user/bangZhuZhongXin.html',
				controller: 'bangZhuZhongXinCtrl'
			})
			.state('user.bangZhuXiangQing', {
				url: '/bangZhuXiangQing',
				cache: false,
				params: {
					id: null
				},
				templateUrl: 'templates/user/bangZhuXiangQing.html',
				controller: 'bangZhuXiangQingCtrl'
			})
			.state('user.fanKuiZhongXin', {
				url: '/fanKuiZhongXin',
				cache: false,
				templateUrl: 'templates/user/fanKuiZhongXin.html',
				controller: 'fanKuiZhongXinCtrl'
			})
			.state('user.faBuWenZhang', {
				url: '/faBuWenZhang',
				cache: false,
				templateUrl: 'templates/user/faBuWenZhang.html',
				controller: 'faBuWenZhangCtrl'
			})
			.state('user.WenZhangLieBiao', {
				url: '/WenZhangLieBiao',
				cache: false,
				templateUrl: 'templates/user/WenZhangLieBiao.html',
				controller: 'WenZhangLieBiaoCtrl'
			})
			.state('user.artDetail', {
				url: '/artDetail',
				params: {
					id: null
				},
				cache: false,
				templateUrl: 'templates/user/artDetail.html',
				controller: 'artDetailCtrl'
			})
			.state('user.tuiJianMa', {
				url: '/tuiJianMa',
				cache: false,
				params: {
					id: ''
				},
				templateUrl: 'templates/user/tuiJianMa.html',
				controller: 'tuiJianMaCtrl'
			})
			.state('user.center', {
				url: '/center',
				cache: false,
				templateUrl: 'templates/user/center.html',
				controller: 'userCenterCtrl'
			})
			.state('user.safesetting', {
				url: '/safesetting',
				templateUrl: 'templates/user/safesetting.html',
				controller: 'userCenterCtrl'
			})





			.state('user.loginPsw', {
				url: '/loginPsw/:type',
				params: {
					type: null
				},
				cache: false,
				templateUrl: 'templates/user/loginPsw.html',
				controller: 'userLoginPswCtrl'
			})
			.state('user.resetPayWord', {
				url: '/resetPayWord',
				params: {
					type: null
				},
				cache: false,
				templateUrl: 'templates/user/resetPayWord.html',
				controller: 'userResetPayWordCtrl'
			})
		//		$urlRouterProvider.otherwise("poorson/introPage");
		$urlRouterProvider.otherwise('auth/login');
		// $urlRouterProvider.otherwise('tab/home');
	});