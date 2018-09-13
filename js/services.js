angular.module("starter.services", [])
	.factory("Storage", function() {
		return {
			set: function(key, data) {
				return window.localStorage.setItem(key, window.JSON.stringify(data));
			},
			get: function(key) {
				return window.JSON.parse(window.localStorage.getItem(key));
			},
			remove: function(key) {
				return window.localStorage.removeItem(key);
			}
		};
	})
	.factory("System", function(
		$rootScope,
		$http,
		$q,
		$timeout,
		$ionicLoading,
		$resource,
		$ionicPopup,
		$cordovaInAppBrowser,
		$cordovaAppVersion,
		Message,
		ENV
	) {
		var verInfo;
		var resource = $resource(ENV.YD_URL, {
			do: "config"
		});
		return {
			aboutUs: function(success, error) {
				Message.loading();
				resource.get({
						op: "getVersion"
					},
					success,
					error
				);
			},
			//			checkUpdate: function() {
			//				var deferred = $q.defer();
			//				Message.loading();
			//				$http.get(ENV.YD_URL + '&do=config&op=getVersion').then(function(response) {
			//					console.log(response);
			//					if(response.data.code != 0) {
			//						return;
			//					}
			//					verInfo = response.data.data; //服务器 版本
			//					console.log(verInfo);
			//					$cordovaAppVersion.getVersionNumber().then(function(version) {
			//						Message.hidden();
			//						if(version < verInfo.version) {
			//							var confirmPopup = $ionicPopup.confirm({
			//								template: '发现新版本，是否更新版本',
			//								buttons: [{
			//									text: '取消',
			//									type: 'button-default'
			//								}, {
			//									text: '更新',
			//									type: 'button-positive',
			//									onTap: function() {
			//										$cordovaInAppBrowser.open(verInfo.downloadUrl, '_system');
			//									}
			//								}]
			//							});
			//						} else {
			//							deferred.resolve('aaa');
			//							//							return true;
			//						}
			//					}, function() {
			//						Message.show('通讯失败，请检查网络！');
			//					});
			//				}, false);
			//				return deferred.promise;
			//			},
			// &do=config&op=getVersion
			checkUpdate: function() {

				var deferred = $q.defer();

				Message.loading();
					var resource = $resource(ENV.YD_URL + "article/getVersion");
				resource.save('',function(response){
                  	if(response.code != 0) {
							Message.show(response.msg)
							return;
						}
						serveVersion = response.data.version; //服务器 版本
						versionLink = response.data.download_url
						$rootScope.versionLink = response.data.download_url
	   
						$cordovaAppVersion.getVersionNumber().then(
							function(version) {   
								Message.hidden();
								if(version < serveVersion) {
							
									var confirmPopup = $ionicPopup.confirm({
										template: "发现新版本，是否更新版本",
										buttons: [{
												text: "取消",
												type: "button-default"
											},
											{
												text: "更新",
												type: "button-positive",
												onTap: function() {
													$cordovaInAppBrowser.open(
														versionLink,
														"_system"
													);
												}
											}
										]
									});
								} else {
									deferred.resolve("aaa");
									//							return true;
								}
							},
							function() {
								Message.show("通讯失败，请检查网络！");
							}
						);

				})
				return deferred.promise;
			},
			systemVersion: function() {
				var deferred = $q.defer();
				$cordovaAppVersion.getVersionNumber().then(
					function(version) {
						//             $rootScope.globalInfo.version=version;
						deferred.resolve(version);
					},
					function() {
						Message.show("通讯失败，请检查网络！");
					}
				);

				return deferred.promise;
			},
			getNotice: function() {
				// document.getElementById("noticeMp3").play();
				$rootScope.globalInfo.noticeNum++;
				console.log("接受消息");
				// resource.get({op: 'notice'}, function (response) {
				// 	$rootScope.globalInfo.noticeNum++;
				// 	console.log('接受消息');
				// });
			},
			fetchCount: function() {
				var deferred = $q.defer();
				resource.get({
						op: "count"
					},
					function(response) {
						//					console.log(response);
						if(response.code == 0) {
							deferred.resolve(response.data);
						} else if(response.code == 1) {
							Message.show(response.msg);
						}
					}
				);
				return deferred.promise;
			}
		};
	})

	.factory("Message", function($ionicLoading) {
		return {
			show: function() {
				var text = arguments[0] ?
					arguments[0] :
					"Hi，出现了一些错误，请检查网络或者退出重试！";
				var duration = arguments[1] ? arguments[1] : 1000;
				var callback = arguments[2] ? arguments[2] : "";
				$ionicLoading.hide();
				if(typeof callback === "function") {
					$ionicLoading
						.show({
							noBackdrop: true,
							template: text,
							duration: duration
						})
						.then(function() {
							callback();
						});
				} else {
					$ionicLoading.show({
						noBackdrop: true,
						template: text,
						duration: duration
					});
				}
			},
			loading: function() {
				var text = arguments[0] ? arguments[0] : "";
				$ionicLoading.hide();
				$ionicLoading.show({
					hideOnStateChange: false,
					duration: 10000,
					template: '<ion-spinner icon="spiral" class="spinner-stable"></ion-spinner><br/>' +
						text
				});
			},
			hidden: function() {
				$ionicLoading.hide();
			}
		};
	})

	.factory("TokenAuth", function($q, Storage, $location) {
		return {
			request: function(config) {
				var userInfo = Storage.get("user");
				config.headers = config.headers || {};
				if(userInfo && userInfo.token) {
					config.headers.TOKEN = userInfo.token;
				}
				return config;
			},
			response: function(response) {
				if(response.data.code === 403) {
					// Message.show(response.data.msg)
					Storage.remove("user");
					$location.path("/auth/login");
				} else if(response.data.code === 302) {
					// Message.show(response.data.msg,2000)
					Storage.remove("user");
					$location.path("/auth/login");
				}
				return response || $q.when(response);
			}
		};
	})
	.factory("Home", function(
		$resource,
		$rootScope,
		ENV,
		$q,
		Message,
		$state,
		$http,
		Storage
	) {
		return {
			//			getnounDict: function() {
			//				var deferred = $q.defer();
			//				$http.get(ENV.YD_URL + '&do=home&op=getDict').then(function(response) {
			//					//					console.log(response);
			//					$rootScope.globalInfo.nounInfo = response.data.data;
			//					Storage.set('nounInfo', response.data.data);
			//					deferred.resolve(response);
			//				}, false);
			//				return deferred.promise;
			//			},
			millsList: function(page) {
				var deferred = $q.defer();
				var resource = $resource(ENV.YD_URL + "product/productlist");
				var _json = {
					page: page || 1
				};
				resource.get(_json, function(res) {
					if(res.code == 0) {
						deferred.resolve(res);
					} else {
						Message.show(res.msg);
					}
				});
				return deferred.promise;
			},
			mymillsList: function(type, page) {
				var deferred = $q.defer();
				var resource = $resource(ENV.YD_URL + "product/myProList");
				var _json = {
					type: type,
					page: page || 1
				};
				resource.get(_json, function(res) {
					if(res.code == 0) {
						deferred.resolve(res);
					} else {
						Message.show(res.msg);
					}
				});
				return deferred.promise;
			}
		};
	})

	// 用户登录、注册、找回密码
	.factory("Auth", function(
		$resource,
		$rootScope,
		$q,
		ENV,
		Message,
		$state,
		Storage,
		$ionicHistory
	) {
		// var resource = $resource(ENV.YD_URL + '?do=auth', {op: "@op"});
		var resource = $resource(ENV.YD_URL + "&do=auth", {
			op: "@op"
		});
		var checkMobile = function(mobile) {
			if(!ENV.REGULAR_MOBILE.test(mobile)) {
				Message.show("请输入正确的11位手机号码", 800);
				return false;
			} else {
				return true;
			}
		};

		var checkPwd = function(pwd) {
			if(!pwd || pwd.length < 6) {
				Message.show("请输入正确的密码(最少6位)", 800);
				return false;
			}
			return true;
		};

		return {
			sendRegCode: function(mobile, type) {
				var resource = $resource(ENV.YD_URL + "auth/sendMsg");
				var deferred = $q.defer();
				var _json = {
					mobile: mobile,
					type: type || "reg"
				};
				resource.save(_json, function(res) {
					if(res.code == 0) {
						deferred.resolve(res);
					} else {
						Message.show(res.msg);
					}
				});
				return deferred.promise;
			},

			register: function(regInfo) {
				var resource = $resource(ENV.YD_URL + "auth/register");
				var deferred = $q.defer();
				var _json = {
					mobile: regInfo.mobile,
					pictureCaptcha: regInfo.pictureCaptcha,
					mobileCode: regInfo.mobileCode,
					password: regInfo.password,
					pid: regInfo.pid
				};
				resource.save(_json, function(res) {
					if(res.code == 0) {
						deferred.resolve(res);
					} else {
						Message.show(res.msg, 2000);
					}
				});
				return deferred.promise;
			},
			login: function(info, keepPsd, version) {
				var mobile = info.username;
				var password = info.pwd;

				var resource = $resource(ENV.YD_URL + "auth/login");
				var deferred = $q.defer();
				var _json = {
					username: info.username,
					pwd: info.pwd,
					version: version
				};
				resource.save(_json, function(res) {
					if(res.code == 0) {
						console.log(res.data)
						deferred.resolve(res);
						Storage.set("user", res.data);
						var oneObj = {};
						oneObj[mobile] = {};
						oneObj[mobile].password = password;
						if(Storage.get("mobileArr")) {
							if(keepPsd) {
								oneObj[mobile].keepPsd = true;
							} else {
								if(Storage.get("mobileArr")[mobile]) {
									delete Storage.get("mobileArr")[mobile].keepPsd;
								}
							}
							Storage.set(
								"mobileArr",
								Object.assign(Storage.get("mobileArr"), oneObj)
							);
						} else {
							Storage.set("mobileArr", {});
							if(keepPsd) {
								oneObj[mobile].keepPsd = true;
							} else {
								if(Storage.get("mobileArr")[mobile]) {
									delete Storage.get("mobileArr")[mobile].keepPsd;
								}
							}
							Storage.set(
								"mobileArr",
								Object.assign(Storage.get("mobileArr"), oneObj)
							);
						}
					} else if(res.code == 303) {
						Message.show(res.msg, 1000, function() {
							$cordovaInAppBrowser.open(
								res.data.url,
								"_system"
							);
						})

					} else {
						Message.show(res.msg, 2000);
					}
				});
				return deferred.promise;
			},

			// 用户注册协议
			fetchAgreement: function() {
				var deferred = $q.defer();
				resource.get({
						op: "agreement"
					},
					function(response) {
						deferred.resolve(response.data);
					}
				);
				return deferred.promise;
			},
			// 登陆操作

			otherLogin: function(type, info) {
				resource.save({
						op: "thirdLogin",
						info: info,
						type: type
					},
					function(response) {
						//					alert(JSON.stringify(response))
						if(response.code == 0) {
							Message.show("登陆成功", 1500);
							Storage.set("user", response.data);
							$rootScope.globalInfo.user = response.data;
							Jpush.setTagsWithAlias();
							if($ionicHistory.backView()) {
								if($ionicHistory.backView() == "poorson.introPage") {
									$state.go("tab.online", {
										iscache: "false"
									});
								} else {
									$ionicHistory.goBack();
								}
							} else {
								$state.go("tab.online", {
									iscache: "false"
								});
							}
						} else if(response.code == 307) {
							//前去绑定手机号
							$state.go("auth.addMobile", {
								uid: response.data,
								logintype: type
							});
						} else {
							// code 1 失败
							Message.show(response.msg, 1500);
						}
					},
					function() {
						Message.show("通信错误，请检查网络", 1500);
					}
				);
			},
			//获取验证码
			getSmsCaptcha: function(type, tMobile, mobile, pictureCaptcha) {
				if(!checkMobile(mobile)) {
					return false;
				}
				var deferred = $q.defer();
				Message.loading("加载中");
				resource.save({
						op: "register",
						type: type,
						tMobile: tMobile,
						mobile: mobile,
						pictureCaptcha: pictureCaptcha
					},
					function(response) {
						Message.hidden();
						if(response.code !== 0) {
							Message.show(response.msg);
							if(response.code == 2) {
								deferred.reject();
							}
							return false;
						} else {
							deferred.resolve();
						}
					}
				);
				return deferred.promise;
			},
			//获取验证码 绑定手机号
			addMobile: function(type, info, logintype) {
				var _json = {};
				if(type == "send") {
					_json = {
						op: "bindMobile",
						type: type,
						mobile: info.mobile
					};
				}
				if(type == "check") {
					_json = {
						op: "bindMobile",
						type: type,
						mobile: info.mobile,
						uid: info.uid,
						code: info.code,
						logintype: logintype
					};
				}
				var deferred = $q.defer();
				resource.save(_json, function(response) {
					if(type == "check") {
						// alert(JSON.stringify(response));
					}
					Message.hidden();
					deferred.resolve();
					if(response.code == 0) {
						if(type == "check") {
							Message.show("绑定成功", 1500);
							Storage.set("user", response.data);
							$rootScope.globalInfo.user = response.data;
							Jpush.setTagsWithAlias();
							$state.go("tab.online", {
								iscache: "false"
							});
						}
					} else {
						Message.show(response.msg);
					}
				});
				return deferred.promise;
			},
			getoneLogin: function(success, error) {
				var res = $resource(ENV.YD_URL + "?do=api");
				res.save({
						op: "nav"
					},
					success,
					error
				);
			},
			//忘记密码获取验证码
			getCaptcha: function(success, error, mobile) {
				if(!checkMobile(mobile)) {
					return false;
				}
				var _json = {
					op: "forget",
					type: "send",
					mobile: mobile
				};
				Message.loading();
				resource.save(_json, success, error);
			},
			//检查验证码
			checkCaptain: function(mobile, captcha, type) {
				if(!checkMobile(mobile)) {
					return false;
				}
				var _json = {
					op: "register",
					type: "verifycode",
					mobile: mobile,
					code: captcha
				};

				if(type) {
					_json = {
						op: "forget",
						type: "verifycode",
						mobile: mobile,
						code: captcha
					};
				}

				Message.loading();

				return resource.get(
					_json,
					function(response) {
						console.log(response);
						if(response.code !== 0) {
							Message.show(response.msg, 1500);
							return;
						}
						$rootScope.$broadcast("Captcha.success");
						Message.show(response.msg, 1000);
					},
					function() {
						Message.show("通信错误，请检查网络！", 1500);
					}
				);
			},

			/*设置密码*/
			setPassword: function(reg, type) {
				if(reg.password.length < 6) {
					Message.show("密码长度不能小于6位！", 1500);
					return false;
				}
				if(reg.password != reg.rePassword) {
					Message.show("两次密码不一致，请检查！", 1500);
					return false;
				}
				var _json = {
					op: "register",
					tMobile: reg.tMobile,
					mobile: reg.mobile,
					password: reg.password,
					repassword: reg.rePassword,
					code: reg.captcha
				};

				if(type) {
					_json = {
						op: "forget",
						mobile: reg.mobile,
						password: reg.password,
						repassword: reg.rePassword,
						code: reg.captcha
					};
				}

				Message.loading();
				return resource.get(
					_json,
					function(response) {
						if(response.code !== 0) {
							Message.show(response.msg, 1500);
							return;
						}
						$state.go("auth.login");
						Message.show("密码设置成功，请重新登录！", 1500);
					},
					function() {
						Message.show("通信错误，请检查网络！", 1500);
					}
				);
			},
			// 获取头像
			getUserLogo: function() {
				var res = $resource(ENV.YD_URL + "?do=api");
				var deferred = $q.defer();
				res.get({
						op: "logo"
					},
					function(response) {
						console.log(response);
						deferred.resolve(response.data);
					}
				);
			}
		};
	})

	.factory("User", function(
		$resource,
		$rootScope,
		$q,
		$ionicLoading,
		ENV,
		$ionicPopup,
		$state,
		Message,
		$timeout,
		Storage,
		$ionicHistory,
		$cordovaInAppBrowser
	) {
		var resource = $resource(ENV.YD_URL, {
			do: "users"
		});
		return {
			// 获取appIntro
			getAppIntro: function() {
				var resource = $resource(ENV.YD_URL + "article/information");
				var deferred = $q.defer();
				var _json = {

				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {
						console.log(deferred.promise);
					}
				);
				return deferred.promise;
			},
			informList: function() {
				var resource = $resource(ENV.YD_URL + "order/pending");
				var deferred = $q.defer();
				var _json = {

				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {
						console.log(deferred.promise);
					}
				);
				return deferred.promise;
			},

			TopUpList: function() {
				var resource = $resource(ENV.YD_URL + "members/rechargeIndex");
				var deferred = $q.defer();
				var _json = {

				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {
						console.log(deferred.promise);
					}
				);
				return deferred.promise;
			},
			// 手机充值
			TopUp: function(info) {
				var resource = $resource(ENV.YD_URL + "members/recharge");
				var deferred = $q.defer();
				var _json = {
					id: info.id,
					mobile: info.mobile,
					password: info.password,
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {
						console.log(deferred.promise);
					}
				);
				return deferred.promise;
			},
			TopUpRec: function(page) {
				var resource = $resource(ENV.YD_URL + "members/rechargeList");
				var deferred = $q.defer();
				var _json = {
					page: page || 1
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {
						console.log(deferred.promise);
					}
				);
				return deferred.promise;
			},
			fuelTopUpList: function() {
				var resource = $resource(ENV.YD_URL + "members/oilRecharge");
				var deferred = $q.defer();
				var _json = {

				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {
						console.log(deferred.promise);
					}
				);
				return deferred.promise;
			},
			// 加油卡充值
			fuelTopUp: function(info) {
				var resource = $resource(ENV.YD_URL + "members/doOilRecharge");
				var deferred = $q.defer();
				var _json = {
					id: info.id,
					mobile: info.mobile,
					password: info.password,
					card: info.card
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {
						console.log(deferred.promise);
					}
				);
				return deferred.promise;
			},
			fuelTopUpRec: function(page) {
				var resource = $resource(ENV.YD_URL + "members/oilRechargeList");
				var deferred = $q.defer();
				var _json = {
					page: page || 1
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {
						console.log(deferred.promise);
					}
				);
				return deferred.promise;
			},
			getKuangShiInfo: function() {
				var resource = $resource(ENV.YD_URL + "order/getWorth");
				var deferred = $q.defer();
				var _json = {};
				resource.save({},
					function(res) {
						console.log("1111");
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {
						console.log(deferred.promise);
					}
				);
				return deferred.promise;
			},
			// 交易信箱
			getTradeList: function(type, page) {
				var resource = $resource(ENV.YD_URL + "order/tradeList");
				var deferred = $q.defer();
				var _json = {
					type: type,
					page: page || 1
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			maiChu: function(info, version) {
				var resource = $resource(ENV.YD_URL + "order/marketPost");
				var deferred = $q.defer();
				var _json = {
					user_ID: info.user_ID,
					num: info.num,
					version: version
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else if(res.code == 303) {
							if(res.data.url == '') {
								$state.go('auth.login')
							} else {
								Message.show(res.msg, 1000, function() {
									$cordovaInAppBrowser.open(
										res.data.url,
										"_system"
									);
								})

							}

						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			getMaiJiaKanBan: function(type, page) {
				var resource = $resource(ENV.YD_URL + "order/getOrder");
				var deferred = $q.defer();
				var _json = {
					type: type,
					page: page || 1
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			// 挂单信息
			getGuaDanInfo: function(type) {
				var resource = $resource(ENV.YD_URL + "order/tradeIndex");
				var deferred = $q.defer();
				var _json = {
					type: type
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			guaMaiDan: function(info, type, version) {
				var resource = $resource(ENV.YD_URL + "order/putOrder");
				var deferred = $q.defer();
				var _json = {
					num: info.num,
					unit_price: info.worth,
					type: type,
					version: version
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else if(res.code == 303) {
							if(res.data.url == '') {
								$state.go('auth.login')
							} else {
								Message.show(res.msg, 1000, function() {
									$cordovaInAppBrowser.open(
										res.data.url,
										"_system"
									);
								})
							}

						} else if(res.code == 1) {
							Message.show(res.msg, 2000);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			maiGeiTa: function(id, pwd, version) {
				var resource = $resource(ENV.YD_URL + "order/trade");
				var deferred = $q.defer();
				var _json = {
					id: id,
					pwd: pwd,
					version: version
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else if(res.code == 303) {
							if(res.data.url == '') {
								$state.go('auth.login')
							} else {
								Message.show(res.msg, 1000, function() {
									$cordovaInAppBrowser.open(
										res.data.url,
										"_system"
									);
								})

							}

						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			quXiaoJiaoYi: function(id) {
				var resource = $resource(ENV.YD_URL + "order/delTrade");
				var deferred = $q.defer();
				var _json = {
					id: id
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			queRenJiaoYi: function(id, pingzheng, role) {

				if(role == "buy") {
					var resource = $resource(ENV.YD_URL + "order/buyerConfirm ");
				} else if(role == "sell") {
					var resource = $resource(ENV.YD_URL + "order/sellerConfirm ");
				}
				var deferred = $q.defer();

				var _json = {
					id: id,
					pingzheng: pingzheng
				};

				resource.save(
					_json,
					function(res) {

						if(res.code == 0) {

							deferred.resolve(res);
						} else if(res.code == 1) {

							Message.show(res.msg);
						} else {

							Message.show(res.msg);
						}
					},
					function() {

						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			geRenXinXi: function(id) {
				// Message.loading();
				var resource = $resource(ENV.YD_URL + "members/userInfo");
				var deferred = $q.defer();
				var _json = {
					user_ID: id
				};
				resource.save(
					_json,
					function(res) {
						Message.hidden();
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			gouMaiKuangJi: function(id, pwd, version) {
				var resource = $resource(ENV.YD_URL + "product/buy");
				var deferred = $q.defer();
				var _json = {
					id: id,
					pwd: pwd,
					version: version
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else if(res.code == 303) {
							if(res.data.url == '') {
								$state.go('auth.login')
							} else {
								Message.show(res.msg, 1000, function() {
									$cordovaInAppBrowser.open(
										res.data.url,
										"_system"
									);
								})

							}

						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			sendShiMingCode: function(mobile) {
				var resource = $resource(ENV.YD_URL + "auth/sendMsg");
				var deferred = $q.defer();
				var _json = {
					mobile: mobile
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			shiMingRenZheng: function(info) {
				var resource = $resource(ENV.YD_URL + "members/smrz");
				var deferred = $q.defer();
				var _json = {
					mobile: info.mobile,
					bankcard: info.bankcard,
					idcard: info.idcard,
					realname: info.realname,
					code: info.code,
					bankname: info.bankname
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							deferred.reject(res);
							// Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			shiMingZhuangTai: function() {
				var resource = $resource(ENV.YD_URL + "members/smrzStatus");
				var deferred = $q.defer();
				var _json = {};
				resource.save(
					_json,
					function(res) {
						deferred.resolve(res);
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			zhiFuBaoRen: function(type, val) {
				var resource = $resource(ENV.YD_URL + "members/wechatAlipaySet");
				var deferred = $q.defer();
				var _json = {
					type: type,
					val: val
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg,1500);
							$timeout(function(){
								$state.go("user.geRenZiLiao");
							},1500)
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			getZhangDanList: function(type, page) {
				var resource = $resource(ENV.YD_URL + "members/record");
				var deferred = $q.defer();
				if(type == "6") {
					type = "";
				}
				var _json = {
					type: type,
					page: page || 1
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			getTuBiao: function() {
				var resource = $resource(ENV.YD_URL + "order/getWorth");
				var deferred = $q.defer();
				var _json = {};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			getXiaoXi: function(page) {
				var resource = $resource(ENV.YD_URL + "article/index");
				var deferred = $q.defer();
				var _json = {
					page: page || 1
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			getXiaoXiXQ: function(id) {
				var resource = $resource(ENV.YD_URL + "article/detail");
				var deferred = $q.defer();
				var _json = {
					id: id
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			guanYu: function() {
				var resource = $resource(ENV.YD_URL + "members/aboutUs");
				var deferred = $q.defer();
				var _json = {};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			tanGongGao: function() {
				var resource = $resource(ENV.YD_URL + "article/alert");
				var deferred = $q.defer();
				var _json = {};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							// Message.show(res.msg)
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			kuangChiXiaJi: function(page) {
				var resource = $resource(ENV.YD_URL + "members/myTeam");
				var deferred = $q.defer();
				var _json = {
					page: page || 1
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			quXiaoDingDan: function(id, type) {
				var resource = $resource(ENV.YD_URL + "order/delOrder");
				var deferred = $q.defer();
				var _json = {
					id: id,
					type: type
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			xiuGaiMiMa: function(type, info) {
				var resource = $resource(ENV.YD_URL + "auth/updatePwd");
				var deferred = $q.defer();
				var _json = {
					type: type,
					pwd: info.pwd,
					newPwd: info.newPwd
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			wangJiMiMa: function(info, type) {
				var resource = $resource(ENV.YD_URL + "auth/forgetPwd");
				var deferred = $q.defer();
				var _json = {
					mobile: info.mobile,
					code: info.code,
					pwd: info.pwd,
					newPwd: info.newPwd,
					type: type
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			keFuZhongXin: function() {
				var resource = $resource(ENV.YD_URL + "members/custom");
				var deferred = $q.defer();
				var _json = {};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			kuangJiXQ: function(id) {
				var resource = $resource(ENV.YD_URL + "product/detail");
				var deferred = $q.defer();
				var _json = {
					id: id
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			bangZhuLieBiao: function(page) {
				var resource = $resource(ENV.YD_URL + "Article/helpCenter");
				var deferred = $q.defer();
				var _json = {
					page: page
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			bangZhuXiangQing: function(id) {
				var resource = $resource(ENV.YD_URL + "article/helpDetail");
				var deferred = $q.defer();
				var _json = {
					id: id
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			fanKuiZhongxin: function(info, type) {
				var resource = $resource(ENV.YD_URL + "Article/feedback");
				var deferred = $q.defer();
				console.log(info)
				if(type && type == 'save') {
					var _json = {
						title: info.title,
						content: info.content,
						cate: info.cateName,
						type: 'save'
					};
				} else {
					var _json = {

					};
				}
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			tuiJianMa: function() {
				var resource = $resource(ENV.YD_URL + "members/qrcode");
				var deferred = $q.defer();
				var _json = {};
				resource.save(
					_json,
					function(res) {
						deferred.resolve(res);

					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			tuiJianLink: function(id) {
				console.log(id)
				var resource = $resource(ENV.YD_URL + "members/shareUrl");
				var deferred = $q.defer();
				var _json = {
					uid: id
				};
				resource.save(
					_json,
					function(res) {
						deferred.resolve(res);

					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			wenZhangLieBiao: function(type, page) {
				var resource = $resource(ENV.YD_URL + "Article/jieyue");
				var deferred = $q.defer();
				if(type == '2') {
					var _json = {
						isMine: true,
						page: page || 1
					};
				} else {
					var _json = {
						page: page || 1
					};
				}

				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			WenZhangXiangQing: function(id) {
				var resource = $resource(ENV.YD_URL + "article/jieyueDetail");
				var deferred = $q.defer();
				var _json = {
					id: id
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			faBuWenZhang: function(info) {
				var resource = $resource(ENV.YD_URL + "Article/fabiao");
				var deferred = $q.defer();
				var _json = {
					title: info.title,
					content: info.content
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			getComplete: function(type, page) {
				var resource = $resource(ENV.YD_URL + "Order/finishOrder");
				var deferred = $q.defer();
				var _json = {
					page: page || 1
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},
			getPingZheng: function(id) {
				var resource = $resource(ENV.YD_URL + "Order/getPingzheng");
				var deferred = $q.defer();
				var _json = {
					id: id
				};
				resource.save(
					_json,
					function(res) {
						if(res.code == 0) {
							deferred.resolve(res);
						} else {
							Message.show(res.msg);
						}
					},
					function() {
						console.log("error");
					},
					function() {}
				);
				return deferred.promise;
			},

			checkAuth: function() {
				return Storage.get("user") && Storage.get("user").token != "";
			},
			/*退出登录*/
			logout: function() {
				Storage.remove("user");
				$rootScope.globalInfo.user = {
					uid: "",
					isShop: 0
				};
				$ionicHistory.clearCache();
				$ionicHistory.clearHistory();
				Message.show("退出成功！", "1500", function() {
					$state.go("tab.online");
				});
			},

			//检查用户信息
			checkjobinfo: function(ids) {
				var deferred = $q.defer();
				var _json = {
					op: "checkunionjob",
					id: ids
				};
				resource.save(_json, function(response) {
						deferred.resolve(response);
					}),
					function() {
						Message.show("通信错误，请检查网络!", 1500);
					};
				return deferred.promise;
			},
			//检查用户信息
			checkuserinfo: function(mobile) {
				Message.loading();
				var deferred = $q.defer();
				var _json = {
					op: "checkUserInfo",
					mobile: mobile
				};
				resource.get(
					_json,
					function(response) {
						Message.hidden();
						deferred.resolve(response);
					},
					function() {
						Message.show("通信错误，请检查网络!", 1500);
					}
				);
				return deferred.promise;
			},
			// 修改登录及支付密码 获取验证码
			getCaptcha: function(oldpsd, newpsd, respsd, type) {
				var _json = {};
				Message.loading();
				var deferred = $q.defer();
				if(type == 1) {
					_json = {
						op: "updatePassword",
						type: "send",
						userPassword: oldpsd,
						password: newpsd,
						repassword: respsd
					};
				} else if(type == 2) {
					_json = {
						op: "updatePayPassword",
						type: "send",
						userPassword: oldpsd,
						password: newpsd,
						repassword: respsd
					};
				}
				resource.get(
					_json,
					function(response) {
						Message.hidden();
						if(response.code == 0) {
							deferred.resolve(response.data);
							Message.show(response.msg);
						} else {
							Message.show(response.msg);
						}
					},
					function() {
						Message.show("通信错误，请检查网络!", 1500);
					}
				);
				return deferred.promise;
			},
			// 忘记密码获取验证码
			resetPwd: function(newpsd, respsd) {
				Message.loading();
				var deferred = $q.defer();
				var _json = {
					op: "forgetPayPassword",
					type: "send",
					password: newpsd,
					repassword: respsd
				};
				resource.get(
					_json,
					function(response) {
						Message.hidden();
						if(response.code == 0) {
							deferred.resolve(response.data);
							Message.show(response.msg);
						} else {
							Message.show(response.msg);
						}
					},
					function() {
						Message.show("通信错误，请检查网络!", 1500);
					}
				);
				return deferred.promise;
			},
			// 修改登录密码
			changeLoginPsd: function(oldpsd, code, newpsd, respsd) {
				Message.loading();
				var deferred = $q.defer();
				var _json = {
					op: "updatePassword",
					userPassword: oldpsd,
					//					code: code,
					password: newpsd,
					repassword: respsd
				};
				resource.save(
					_json,
					function(response) {
						Message.hidden();
						if(response.code == 0) {
							deferred.resolve(response.data);
						} else if(response.code == 301) {
							Message.show(response.msg);
							$state.go("user.safesetting");
						} else {
							Message.show(response.msg);
						}
					},
					function() {
						Message.show("通信错误，请检查网络!", 1500);
					}
				);
				return deferred.promise;
			},
			// 修改支付密码
			changePayPsd: function(oldpsd, code, newpsd, respsd) {
				Message.loading();
				var deferred = $q.defer();
				var _json = {
					op: "updatePayPassword",
					userPassword: oldpsd,
					code: code,
					password: newpsd,
					repassword: respsd
				};
				resource.get(
					_json,
					function(response) {
						Message.hidden();
						if(response.code == 0) {
							deferred.resolve(response.data);
						} else if(response.code == 301) {
							Message.show(response.msg);
							$state.go("user.safesetting");
						} else {
							Message.show(response.msg);
						}
					},
					function() {
						Message.show("通信错误，请检查网络!", 1500);
					}
				);
				return deferred.promise;
			},
			// 忘记支付密码提交修改
			resetPayPsd: function(newpsd, respsd, code) {
				Message.loading();
				var deferred = $q.defer();
				var _json = {
					op: "forgetPayPassword",
					code: code,
					password: newpsd,
					repassword: respsd
				};
				resource.get(
					_json,
					function(response) {
						Message.hidden();
						if(response.code == 0) {
							deferred.resolve(response.data);
						} else if(response.code == 301) {
							Message.show(response.msg);
							$ionicHistory.goBack();
							//						$state.go('user.safesetting');
						} else {
							Message.show(response.msg);
						}
					},
					function() {
						Message.show("通信错误，请检查网络!", 1500);
					}
				);
				return deferred.promise;
			}
		};
	})

	.factory("Area", function($resource) {
		var resource = $resource("lib/area-bak.json");
		return {
			getList: function(success, pid, cid) {
				resource.get({}, function(data) {
					success(data);
				});
			},
			getcityList: function(success) {
				var res = $resource("data/city.json");
				res.get({}, function(data) {
					success(data);
				});
			}
		};
	})

	.factory("Lbs", function(ENV, $resource) {
		var resource = $resource(ENV.YD_URL, {
			do: "api"
		});
		/**
		 * @return {number}
		 */
		var Rad = function(d) {
			return d * Math.PI / 180.0; //经纬度转换成三角函数中度分表形式。
		};
		return {
			calcDistance: function(p1, p2) {
				var radLat1 = Rad(p1.lat);
				var radLat2 = Rad(p2.lat);
				var a = radLat1 - radLat2;
				var b = Rad(p1.lng) - Rad(p2.lng);
				var s =
					2 *
					Math.asin(
						Math.sqrt(
							Math.pow(Math.sin(a / 2), 2) +
							Math.cos(radLat1) *
							Math.cos(radLat2) *
							Math.pow(Math.sin(b / 2), 2)
						)
					);
				s = s * 6378.137;
				s = Math.round(s * 10) / 10000; //输出为公里
				s = s.toFixed(2);
				return s;
			},
			getCity: function(success, error, posi) {
				return resource.get({
						op: "getPlace",
						lat: posi.lat,
						lng: posi.lng
					},
					success,
					error
				);
			}
		};
	})
	.factory("Mc", function($resource, $ionicLoading, ENV, Message, $q) {
		var resource = $resource(ENV.YD_URL, {
			do: "mc",
			op: "@op"
		});
		return {
			getMy: function() {
				var deferred = $q.defer();
				Message.loading();
				resource.save({
						op: "display"
					},
					function(response) {
						//					console.log(response);
						Message.hidden();
						if(response.code == 0) {
							deferred.resolve(response.data);
						} else if(response.code == 1) {
							Message.show("response.msg");
						}
					}
				);
				return deferred.promise;
			}
		};
	});