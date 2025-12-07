import { find, instantiate, Node, Prefab, resources, view, _decorator, game, sys, native, assetManager, director, Sprite } from "cc";
import { UIManager } from "./Framework/Managers/UIManager";
import { AudioManager } from "./Framework/Managers/AudioManager";
import DyHttpUpBehavior from "./DyHttpUpBehavior";
import PrefsManager from "./Framework/Managers/PrefsManager";
import { Constant } from "./Framework/Const/Constant";
import { Tools } from "./Framework/Utils/Tools";

export enum BannerMode {
    正式包,
    测试包,
    黑包
}

export default class Banner {
    static Mode: BannerMode = BannerMode.黑包;
    static RegionMask: boolean = false;//地区判断.true为有广告，false为无广告（不需要再此处手动修改，所有广告修改前往BannerManager）
    static IsYB: boolean = false;//是否为阴包，阴包没游戏，黑包情况默认阳包
    static TimeMask: boolean = false;//时间判断.true为有广告，false为无广告
    static WorkdayMask: boolean = false;//工作日判断.true为有广告，false为无广告
    static IsNative: boolean = true;
    static IsLogin: boolean = false;//华为登录 
    static IsWz: boolean = false;//万总华为策略

    //健康忠告
    static Owner: string = `著作权人：昆明炽业商贸有限公司`;              //著作权人
    static License: string = `登记号：2025SA0184731`;                         //登记号
    static AgeLimit: number = 16;
    Company = Company.昆明炽业商贸有限公司;

    private _appId: string = "300123126";

    private _videoId: string = "1995100469996945408";
    private _customId: string = "1995100363233034240";
    private _bannerId: string = "1995100260763303936";


    //微信
    private _gridAdId: string = "adunit-42a55b6410669601";//原生矩阵格子
    private _leftGridAdId: string = "adunit-86b0b4ede168885c";//左格子广告
    private _leftColumnGridAdId: string = "adunit-86b0b4ede168885c";//垂直单列格子左
    private _rightGridAdId: string = "adunit-71c63a6cb1a8efa6";//右格子广告
    private _rightColumnGridAdId: string = "adunit-86b0b4ede168885c";//垂直单列格子右
    private _lineGridAdId: string = "adunit-86b0b4ede168885c";//平行单行格子
    private _shareTitle: string = "修狗神枪，无惧挑战，出击突围";
    private _shareId: string = "QKbxVzqeT5GzgIY3zE1w7g==";
    private _shareUrl: string = "https://mmocgame.qpic.cn/wechatgame/SSraPWBCo8uTN55cbEEzLibdDEdNlxCDrJyaeTNhtAiagH8uaUcLicIj26wbNeDAnr0/0";

    //屏蔽时间
    private _year: number = 2025;
    private _month: number = 12;
    private _date: number = 4;
    private _hour: number = 19;

    nativeAd = null;
    bannerAd = null;
    customAd = null;
    rewardedVideoAd = null;

    popupAdIndex: number = 0;
    bannerAdIndex: number = 0;
    popupAddShortcutIndex: number = 0;
    popupAddShortcutCount: number = 0;

    public static IsShowServerBundle: boolean = true;//是否能使用远程包
    private server_year: number = 2025;//远程包屏蔽时间
    private server_month: number = 12;
    private server_date: number = 4;
    private server_hour: number = 19;

    //判断是否能使用远程包
    public GetIsShowServerBundle() {
        if (this.TimeManager(this.server_year, this.server_month, this.server_date, this.server_hour, 0)) {
            Banner.IsShowServerBundle = true;
        } else {
            Banner.IsShowServerBundle = false;
        }
    }

    ShowBannerAd(BannerID?: string) {
        console.log(`加载Banner`);
        if (Banner.Mode == BannerMode.测试包) return;

        if (Banner.IS_OPPO_MINI_GAME) {
            this.CreateOPPOBannerAd(BannerID);
        }
        if (Banner.IS_VIVO_MINI_GAME) {
            this.CreateVIVOBannerAd(BannerID);
        }
        if (Banner.IS_HUAWEI_QUICK_GAME) {
            this.ShowHWBanner(BannerID);
        }
        if (Banner.IS_HONOR_MINI_GAME) {
            this.CreateHONORBannerAd(BannerID);
        }
        if (Banner.IS_ANDROID) {
            this.CreateAndroidBannerAd();
        }
        if (Banner.IS_HarmonyOSNext_GAME) {
            this.CreateHarmonyOsNextdBannerAd();
        }
        if (Banner.IS_WECHAT_MINI_GAME) {
            this.CreateWXBanner(BannerID);
        }
        if (Banner.IS_BYTEDANCE_MINI_GAME) {
            this.CreateDYBannerAd(BannerID);
        }
        if (Banner.IS_XIAOMI_QUICK_GAME) {
            this.CreateXiaoMiBannerAd();
        }
    }
    public static repeatedly: number = 0;//多次原生，等于1为2次原生
    ShowCustomAd(BannerID?: string, Top?: number, Left?: number) {
        console.log(`加载原生`);
        if (Banner.Mode == BannerMode.测试包) return;

        if (!this.TimeManager(this._year, this._month, this._date, this._hour, 0)) return;

        if (Banner.IS_OPPO_MINI_GAME) {
            this.CreateOPPOCustomAd(BannerID, Top, Left);
        }
        if (Banner.IS_VIVO_MINI_GAME) {
            this.CreateVIVOCustomAd(BannerID, Top, Left);
        }
        if (Banner.IS_HUAWEI_QUICK_GAME) {
            if (Banner.IsNative) {
                this.CreateHWNative(BannerID);
            } else {
                this.CreateHWCustomAd(BannerID);
            }
        }
        if (Banner.IS_HONOR_MINI_GAME) {
            this.CreateHONORCustomAd(BannerID);
        }
        if (Banner.IS_BYTEDANCE_MINI_GAME) {
            this.CreateDYCustomAd(BannerID);
        }
        if (Banner.IS_KS_MINI_GAME) {
            this.CreateKSCustomAd(BannerID);
        }
        if (Banner.IS_WECHAT_MINI_GAME) {
            this.CreateWXCustomAd(BannerID);
        }
        if (Banner.IS_ANDROID) {
            this.CreateAndroidCustomAd();
        }
        if (Banner.IS_XIAOMI_QUICK_GAME) {
            this.CreateXiaoMiCustomAd();
        }
        if (Banner.IS_HarmonyOSNext_GAME) {
            this.CreateHarmonyOsNextCustomAd();
        }
    }

    ShowVideoAd(callback, args?: any) {
        console.log(`加载激励视频`);
        if (Banner.Mode == BannerMode.测试包) {
            if (args) {
                callback(args)
            } else {
                callback();
            }
            return;
        }

        if (Banner.IS_OPPO_MINI_GAME) {
            this.CreateOPPORewardedVideoAd(callback, args);
        }
        if (Banner.IS_VIVO_MINI_GAME) {
            this.CreateVIVORewardedVideoAd(callback, args);
        }
        if (Banner.IS_HUAWEI_QUICK_GAME) {
            this.CreateHWVideo(callback, args);
        }
        if (Banner.IS_HONOR_MINI_GAME) {
            this.CreateHONORRewardedVideoAd(callback, args);
        }
        if (Banner.IS_XIAOMI_QUICK_GAME) {
            this.CreateXiaoMiVideoAd(callback, args);
        }
        if (Banner.IS_BYTEDANCE_MINI_GAME) {
            this.CreateDYRewardedVideoAd(callback, args);
        }
        if (Banner.IS_KS_MINI_GAME) {
            this.CreateKSRewardedVideoAd(callback, args);
        }
        if (Banner.IS_WECHAT_MINI_GAME) {
            this.CreateWXVideo(callback, args);
        }
        if (Banner.IS_ANDROID) {
            this.CreateAndroidRewardedVideoAd(callback, args);
        }
        if (Banner.IS_HarmonyOSNext_GAME) {
            this.CreateHarmonyOsNextRewardedVideoAd(callback, args);
        }
    }

    Init() {
        if (Banner.IS_WECHAT_MINI_GAME) {
            this.ShowShareMenu();
        }
        Banner.Instance.SetCityIsWhite();
        Banner.TimeMask = Banner.Instance.TimeManager(this._year, this._month, this._date, this._hour, this._hour);
        Banner.WorkdayMask = Banner.Instance.CanShowWorkdayMask();
        Banner.Instance.GetIsShowServerBundle();
    }

    //**创建桌面图标 */
    AddShortcut(reward: Function = null) {
        console.log(`创建桌面图标`);
        if (Banner.Mode == BannerMode.测试包) {
            reward && reward();
            return;
        }
        if (PrefsManager.GetBool(Constant.Key.AddShortcut)) {
            return;
        }
        if (Banner.IS_OPPO_MINI_GAME) {
            this.AddOPPOShortcut(reward);
        }
        if (Banner.IS_VIVO_MINI_GAME) {
            this.AddVIVOShortcut(reward);
        }
        if (Banner.IS_BYTEDANCE_MINI_GAME) {
        }
        if (Banner.IS_KS_MINI_GAME) {
            this.AddKSShortcut(reward);
        }
    }

    //**手机震动 */
    VibrateShort(vibrateType: VibrateType = VibrateType.Heavy) {
        if (!AudioManager.IsVibrateOn) return;

        if (Banner.IS_OPPO_MINI_GAME) {
            this.OPPOVibrateShort(vibrateType);
        }
        if (Banner.IS_VIVO_MINI_GAME) {
            this.VIVOVibrateShort(vibrateType);
        }
    }

    //**手机震动 持续400ms */
    VibrateLong() {
        if (!AudioManager.IsVibrateOn) return;

        if (Banner.IS_OPPO_MINI_GAME) {
            this.OPPOVibrateLong();
        }
        if (Banner.IS_VIVO_MINI_GAME) {
            this.VIVOVibrateLong();
        }
    }

    //**开启原生自弹 */
    StartPopupAd(second: number = 30, Id?: string) {
        console.log(`开启原生自弹`);
        clearInterval(this.popupAdIndex);
        if (Id == null) {
            this.popupAdIndex = setInterval(() => { this.ShowCustomAd() }, 1000 * second);
        } else {
            this.popupAdIndex = setInterval(() => { this.ShowCustomAd(Id) }, 1000 * second);
        }
    }

    //**关闭原生自弹 */
    StopPopupAd() {
        console.log(`关闭原生自弹`);
        clearInterval(this.popupAdIndex);
    }

    //**开启Banner自弹 */
    StartBannerAd(second: number = 30, Id?: string) {
        console.log(`开启Banner自弹`);
        clearInterval(this.bannerAdIndex);
        if (Id == null) {
            this.bannerAdIndex = setInterval(() => { this.ShowBannerAd() }, 1000 * second);
        } else {
            this.bannerAdIndex = setInterval(() => { this.ShowBannerAd(Id) }, 1000 * second);
        }
    }

    //**关闭Banner自弹 */
    StopBannerAd() {
        console.log(`关闭Banner自弹`);
        clearInterval(this.bannerAdIndex);
    }

    //**开启视屏自弹 */
    StartVidoePopupAd(second: number = 180) {
        console.log(`开启视频自弹`);
        clearInterval(this.popupAdIndex);
        this.popupAdIndex = setInterval(() => { this.ShowVideoAd(() => { }); }, 1000 * second);
    }
    //**关闭视屏自弹 */
    StopVidoPopupAd() {
        console.log(`关闭视频自弹`);
        clearInterval(this.popupAdIndex);
    }

    //**开启添加桌面自弹 */
    StartPopupAddShortcut(second: number = 35, reward: Function = null) {
        console.log(`开启添加桌面自弹`);
        const popup = () => {
            this.popupAddShortcutCount++;
            if (this.popupAddShortcutCount > 3 || PrefsManager.GetBool(Constant.Key.AddShortcut)) return;
            this.AddShortcut(reward);
        }
        popup();
        clearInterval(this.popupAddShortcutIndex);
        this.popupAddShortcutIndex = setInterval(popup, 1000 * second);
    }

    //**关闭添加桌面自弹 */
    StopPopupAddShortcut() {
        console.log(`关闭添加桌面自弹`);
        clearInterval(this.popupAddShortcutIndex);
    }

    Quit() {
        console.log(`点击退出游戏`);
        if (Banner.IS_OPPO_MINI_GAME || Banner.IS_VIVO_MINI_GAME || Banner.IS_HUAWEI_QUICK_GAME) {
            //@ts-ignore
            qg.exitApplication({
                success: function () {
                    if (!PrefsManager.GetBool(Constant.Key.AddShortcut)) {
                        this.AddShortcut();
                    }
                    console.log("exitApplication success");
                },
                fail: function () {
                    console.log("exitApplication fail");
                },
                complete: function () { }
            });
        }

        if (Banner.IS_ANDROID) {
            this.AndroidQuit();
        }
    }

    JudgeChannel(cb: Function) {
        let channel = Channel.None;
        if (Banner.IS_ANDROID) {
            channel = Channel[`${native.reflection.callStaticMethod("com/cocos/game/MainActivity", "JudgeChannel", "()Ljava/lang/String;")}`];
        }

        if (Banner.IS_HUAWEI_QUICK_GAME) {
            channel = Channel.HuaweiBtn;
        }

        console.log(`判断渠道:[${Channel[channel]}]`)
        cb && cb(channel);
    }

    //#region OPPO小游戏

    private CreateOPPOBannerAd(bannerID?: string) {
        if (!this.TimeManager(this._year, this._month, this._date, this._hour, 0)) return;

        try {
            if (!!this.bannerAd) this.bannerAd.destroy();
            this.bannerAd = null;
            let BannerID = Banner.Instance._bannerId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            //@ts-ignore
            this.bannerAd = qg.createBannerAd({
                posId: BannerID,
                // style: {
                //     top: 300,
                //     left: 0,
                //     width: 900,
                //     height: 300
                // },
                adIntervals: 30
            });
            this.bannerAd.onLoad(() => { console.log("Banner广告加载成功") });
            this.bannerAd.onError(e => console.error(`Banner广告出现错误：${JSON.stringify(e)}`));
            this.bannerAd.onResize(this.BannerOnSizeCallback);
            this.bannerAd.show();

        } catch (error) {
            console.log("Banner展示失败：" + error.message);
        }
    }

    //版本号>=1094
    private CreateOPPOCustomAd(bannerID?: string, Top?: number, Left?: number) {
        try {
            if (!!this.customAd) this.customAd.destroy();
            this.customAd = null;
            let BannerID = Banner.Instance._customId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            if (Top || Left) {
                //@ts-ignore
                this.customAd = qg.createCustomAd({
                    posId: BannerID,
                    style: {
                        top: Top,
                        left: Left,
                    },
                });
            } else {
                //@ts-ignore
                this.customAd = qg.createCustomAd({
                    posId: BannerID,
                    style: {
                        //@ts-ignore
                        // top: qg.getSystemInfoSync().screenHeight / 2 - 120,
                        // left: 0,
                        //@ts-ignore
                        // width: qg.getSystemInfoSync().screenWidth,
                    },
                });
            }


            this.customAd.onLoad(() => console.log(`原生广告加载成功`));
            this.customAd.onError(err => console.log(`原生广告出现错误：${JSON.stringify(err)}`));
            this.customAd.show().then(() => console.log('原生模板广告展示完成')).catch((err) => console.log(`原生广告出现错误：${JSON.stringify(err)}`));
            this.customAd.onHide(() => {
                if (Banner.repeatedly > 0) {
                    Banner.repeatedly--;
                    Banner.Instance.ShowCustomAd(bannerID);
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    private CreateOPPORewardedVideoAd(callback, args?: any) {
        try {
            if (!!this.rewardedVideoAd) this.rewardedVideoAd.destroy();
            this.rewardedVideoAd = null;

            //@ts-ignore
            this.rewardedVideoAd = qg.createRewardedVideoAd({ adUnitId: Banner.Instance._videoId, });

            this.rewardedVideoAd.load();

            this.rewardedVideoAd.onLoad((data) => {
                this.rewardedVideoAd.show();
                console.info('激励视频数据拉取成功: ', data);
            })

            this.rewardedVideoAd.onError((e) => {
                UIManager.ShowTip(`激励视频加载失败`);
                console.error(`激励视频出现错误：${JSON.stringify(e)}`);
            })

            this.rewardedVideoAd.onClose((res) => {
                console.log('视频广告关闭回调')
                if (res && res.isEnded) {
                    args ? callback(args) : callback();
                    console.log("正常播放结束，可以下发游戏奖励");
                } else {
                    console.log("播放中途退出，不下发游戏奖励");
                }
            });
        } catch (error) {
            console.error("激励视频异常信息：" + error.message);
        }
    }

    private AddOPPOShortcut(reward: Function) {
        //@ts-ignore
        qg.hasShortcutInstalled({
            success: function (status) {
                // 判断图标未存在时，创建图标
                if (status == false) {
                    //@ts-ignore
                    qg.installShortcut({
                        success: function () {
                            reward && reward();
                            console.log(`创建桌面图标成功`);
                            PrefsManager.SetBool(Constant.Key.AddShortcut, true);
                        },
                        fail: function (err) {
                            console.log(`创建桌面图标失败：${err}`);
                        },
                        complete: function () { }
                    })
                }
            },
            fail: function (err) {
                console.log(`创建桌面图标失败：${err}`);
            },
        })
    }

    //使手机发生较短时间的振动（20 ms）
    private OPPOVibrateShort(vibrateType: VibrateType) {
        //@ts-ignore
        qg.vibrateShort({
            type: vibrateType,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        });
    }

    //触发较长时间震动，持续400ms
    private OPPOVibrateLong() {
        //@ts-ignore
        qg.vibrateLong({
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        });
    }


    //#region 小米小游戏
    private CreateXiaoMiBannerAd() {
        if (!this.TimeManager(this._year, this._month, this._date, this._hour, 0)) return;

        try {
            if (!!this.bannerAd) this.bannerAd.destroy();
            this.bannerAd = null;

            //@ts-ignore
            this.bannerAd = qg.createBannerAd({
                adUnitId: Banner.Instance._bannerId,
                adIntervals: 30
            }),
                this.bannerAd.onLoad(() => { console.log("Banner广告加载成功") });
            this.bannerAd.onError(e => console.error(`Banner广告出现错误：${JSON.stringify(e)}`));
            this.bannerAd.onResize(this.BannerOnSizeCallback);
            this.bannerAd.show();

        } catch (error) {
            console.log("Banner展示失败：" + error.message);
        }
    }

    private CreateXiaoMiCustomAd() {
        try {
            if (!!this.customAd) this.customAd.destroy();
            this.customAd = null;
            //@ts-ignore
            this.customAd = qg.createCustomAd({
                adUnitId: Banner.Instance._customId,
                style: {
                    top: 100,
                    left: 300,
                    width: 300,
                    height: 650
                },
                adIntervals: 30,
                success: function () {
                    console.log("createCustomAd success");
                },
                fail: function () {
                    console.log("createCustomAd fail");
                },
                complete: function () { }
            });
            this.customAd.onLoad(() => { console.log("Banner广告加载成功") });
            this.customAd.onError(e => console.error(`Banner广告出现错误：${JSON.stringify(e)}`));
            this.customAd.onResize(this.BannerOnSizeCallback);
            this.customAd.show();
        } catch (error) {
            console.log("原生展示失败：" + error.message);
        }
    }

    private CreateXiaoMiVideoAd(callback, args?: any) {
        try {
            if (this.rewardedVideoAd != null) {
                this.rewardedVideoAd.offLoad();
                this.rewardedVideoAd.offClose();
                this.rewardedVideoAd = null;
            }
            //@ts-ignore
            this.rewardedVideoAd = qg.createRewardedVideoAd({
                adUnitId: Banner.Instance._videoId,
                adIntervals: 30
            });
            this.rewardedVideoAd.load();
            this.rewardedVideoAd.onLoad((data) => {
                this.rewardedVideoAd.show();
                console.info('激励视频数据拉取成功: ', data);
            });
            this.rewardedVideoAd.onError((e) => {
                UIManager.ShowTip(`激励视频加载失败`);
                console.error('load ad error:' + JSON.stringify(e));
                console.log('load ad error:' + e.errMsg, e.errCode);
            });
            this.rewardedVideoAd.onClose((res) => {
                console.log('视频广告关闭回调')
                if (res && res.isEnded) {
                    if (args) {
                        console.log("带参回调");
                        callback(args)
                    } else {
                        console.log(callback);
                        callback();
                    }
                    console.log("正常播放结束，可以下发游戏奖励");

                } else {
                    console.log("播放中途退出，不下发游戏奖励");
                }
            });
        } catch (error) {
            console.error("激励视频异常信息：" + error.message);
        }
    }

    //#endregion

    //#region HUAWEI小游戏

    private DestroyVideoAd() {
        try {
            //如果已经有了对象则先销毁对象
            console.log("rewardedVideoAd this.destroy", this.rewardedVideoAd);
            if (!(typeof this.rewardedVideoAd == "undefined") || this.rewardedVideoAd == null) {
                console.log("rewardedVideoAd this.destroy");
                this.rewardedVideoAd.offLoad();
                //this.rewardedVideoAd.offError();
                this.rewardedVideoAd.offClose();
                this.rewardedVideoAd.destroy();
                this.rewardedVideoAd = null;
            }
        }
        catch (error) {
            console.log("异常信息：" + error.message);
        }
    }

    private CreateHWVideo(callback, args?: any) {
        this.DestroyVideoAd();
        try {
            if (this.rewardedVideoAd == null) {
                //@ts-ignore
                this.rewardedVideoAd = qg.createRewardedVideoAd({
                    adUnitId: this._videoId,
                });

                this.rewardedVideoAd.load();
                this.rewardedVideoAd.onLoad((data) => {
                    this.rewardedVideoAd.show();
                    console.info('激励视频数据拉取成功: ', data);
                })
                this.rewardedVideoAd.onError((e) => {
                    UIManager.ShowTip(`激励视频加载失败`);
                    console.error('load ad error:' + JSON.stringify(e));
                    console.log('load ad error:' + e.errMsg, e.errCode);
                })
                this.rewardedVideoAd.onClose((res) => {
                    console.log('视频广告关闭回调')
                    if (res && res.isEnded) {
                        if (args) {
                            callback(args)
                        } else {
                            callback();
                        }
                        console.log("正常播放结束，可以下发游戏奖励");

                    } else {
                        console.log("播放中途退出，不下发游戏奖励");
                    }
                });
            } else {
                this.rewardedVideoAd.load();
            }
        } catch (error) {
            console.error("激励视频异常信息：" + error.message);
        }
    }

    HWGameLogin(successCallback, failCallback) {
        if (Banner.Mode == BannerMode.测试包) {
            successCallback();
            return;
        }

        console.log(`HW游戏登陆...`);

        console.log(this._appId);
        //@ts-ignore
        qg.gameLoginWithReal({
            forceLogin: 1,
            appid: this._appId,
            success: (data) => {
                console.log(`HW游戏登陆成功：${JSON.stringify(data)}`);
                successCallback();
            },
            fail: (data, code) => {
                console.error(`HW游戏登陆失败：${data} -data：${data} -code：${code}`);
                //状态码为7004或者2012，表示玩家取消登录。
                //此时，建议返回游戏界面，可以让玩家重新进行登录操作。
                if (code == 7004 || code == 2012) {
                    console.log("玩家取消登录，返回游戏界面让玩家重新登录。")
                    failCallback();
                }
                //状态码为7021表示玩家取消实名认证。
                //在中国大陆的情况下，此时需要禁止玩家进入游戏。
                if (code == 7021) {
                    console.log("The player has canceled identity verification. Forbid the player from entering the game.")
                    game.end();
                }
            }
        });
    }

    private CreateHWCustomAd(bannerID?: string) {
        try {
            if (!!this.customAd) this.customAd.destroy();
            this.customAd = null;
            let BannerID = Banner.Instance._customId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            //@ts-ignore
            this.customAd = qg.createNativeAd({
                adUnitId: BannerID,
                success: (code) => {
                    console.log("loadNativeAd loadNativeAd : success");
                },
                fail: (data, code) => {
                    console.log("loadNativeAd loadNativeAd fail: " + data + "," + code);
                },
                complete: () => {
                    console.log("loadNativeAd loadNativeAd : complete");
                }
            });

            this.customAd.onLoad((data) => {
                console.info('ad data loaded: ' + JSON.stringify(data))
            })
            this.customAd.load()

            // this.customAd = ad.createInterstitialAd({
            //     adUnitId: this._customId
            // });

            // this.customAd.onLoad(function (data) { console.log(`原生广告加载成功:` + JSON.stringify(data)); });
            // this.customAd.onError((err) => { console.log(`原生广告出现错误：${JSON.stringify(err)}`) });
            // this.customAd.show().then(() => { console.log('插屏广告show成功') }, () => { console.log('插屏广告show失败') });
        } catch (error) {
            console.log(`原生广告出现错误：${JSON.stringify(error)}`)
        }
    }

    private ShowHWBanner(bannerID?: string) {
        try {
            console.log(`加载 HWBanner ...`);
            // this.DestroyOPPOBanner();
            let BannerID = Banner.Instance._bannerId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            //@ts-ignore
            var height = qg.getSystemInfoSync().safeArea.height;
            //@ts-ignore
            this.bannerAd = qg.createBannerAd({
                adUnitId: BannerID,
                style: {
                    top: height - 57,
                    left: 0,
                    height: 57,
                    width: 360,
                }
            });

            //加载监听事件
            this.bannerAd.onLoad();
            this.bannerAd.onClose();
            this.bannerAd.onError((e) => {
                const errCode = e.errCode
                const errMsg = e.errMsg
                console.error(`HWBanner 广告数据拉取失败:[${JSON.stringify(e)}]-[${errMsg}]-[${errCode}]`);
            });

            console.log(`加载 HWBanner 成功`);

            this.bannerAd.show();

        } catch (error) {
            console.error("Banner展示失败：" + error.message);
        }
    }

    //#endregion

    //#region VIVO小游戏

    private CreateVIVOBannerAd(bannerID?: string) {
        if (!this.TimeManager(this._year, this._month, this._date, this._hour, 0)) return;

        try {
            if (!!this.bannerAd) this.bannerAd.destroy();
            this.bannerAd = null;
            let BannerID = Banner.Instance._bannerId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            //@ts-ignore
            this.bannerAd = qg.createBannerAd({
                posId: BannerID,
                style: {
                    //vivo
                    // left: view.getVisibleSize().width / 2 - 150,
                    // top: view.getVisibleSize().height + 150
                },
                adIntervals: 30
            });

            //加载监听事件
            this.bannerAd.onLoad(() => { console.log("Banner广告加载成功") });
            this.bannerAd.onSize(this.BannerOnSizeCallback);
            this.bannerAd.onError(e => console.log(`Banner出现错误：${JSON.stringify(e)}`));
            this.bannerAd.show();
        } catch (error) {
            console.log("Banner展示失败：" + error.message);
        }
    }

    private CreateVIVOCustomAd(bannerID?: string, Top?: number, Left?: number) {
        try {
            if (!!this.customAd) this.customAd.destroy();
            this.customAd = null;
            let BannerID = Banner.Instance._customId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            if (Top || Left) {
                //@ts-ignore
                this.customAd = qg.createCustomAd({
                    posId: BannerID,
                    style: {
                        top: Top,
                        left: Left
                    }
                });
            } else {
                //@ts-ignore
                this.customAd = qg.createCustomAd({
                    posId: BannerID,
                    style: {
                        gravity: `center`
                    }
                });
            }
            this.customAd.onError(err => console.log(`原生广告出现错误：${JSON.stringify(err)}`));
            this.customAd.show().then(() => console.log('原生模板广告展示完成')).catch((err) => console.log('原生模板广告展示失败', JSON.stringify(err)));
            this.customAd.onClose(() => {
                if (Banner.repeatedly > 0) {
                    Banner.repeatedly--;
                    Banner.Instance.ShowCustomAd(bannerID);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    private CreateVIVORewardedVideoAd(callback, args?: any) {
        try {
            if (!!this.rewardedVideoAd) this.rewardedVideoAd.destroy();
            this.rewardedVideoAd = null;

            //@ts-ignore
            this.rewardedVideoAd = qg.createRewardedVideoAd({
                posId: Banner.Instance._videoId,
            });

            this.rewardedVideoAd.load();

            this.rewardedVideoAd.onLoad((data) => {
                this.rewardedVideoAd.show();
                console.info('激励视频数据拉取成功: ', data);
            })

            this.rewardedVideoAd.onError((e) => {
                UIManager.ShowTip(`激励视频加载失败`);
                console.error(`激励视频出现错误：${JSON.stringify(e)}`);
            })

            this.rewardedVideoAd.onClose((res) => {
                if (res && res.isEnded) {
                    args ? callback(args) : callback();
                    console.log("正常播放结束，可以下发游戏奖励");
                } else {
                    console.log("播放中途退出，不下发游戏奖励");
                    setTimeout(() => { Banner.Instance.ShowCustomAd() }, 1000);
                }
            });
        } catch (error) {
            console.error(`激励视频异常信息：${error.message}`);
        }
    }

    private AddVIVOShortcut(reward: Function) {
        //@ts-ignore
        qg.hasShortcutInstalled({
            success: function (status) {
                if (status) {
                    console.log(`已创建桌面图标`);
                    PrefsManager.SetBool(Constant.Key.AddShortcut, true);
                } else {
                    //@ts-ignore
                    qg.installShortcut({
                        success: function () {
                            reward && reward();
                            console.log(`建桌面图标成功`);
                        }
                    })
                }
            }
        })
    }

    //触发较短时间震动，持续15ms
    private VIVOVibrateShort(vibrateType: VibrateType) {
        //@ts-ignore
        qg.vibrateShort({
            type: vibrateType,
            success: function (res) { console.log(`震动成功：${JSON.stringify(res)}`) },
            fail: function (res) { console.log(`震动失败：${JSON.stringify(res)}`) },
            complete: function (res) { },
        });
    }

    //触发较长时间震动，持续400ms
    private VIVOVibrateLong() {
        //@ts-ignore
        qg.vibrateLong()
    }

    //#endregion

    //#region 快手小游戏

    private CreateKSCustomAd(bannerID?: string) {
        this.DestroyKSCustomAd();
        try {
            let param = {};
            let BannerID = Banner.Instance._customId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            //@ts-ignore
            param.adUnitId = BannerID;
            //@ts-ignore
            this.customAd = ks.createInterstitialAd(param);
            if (this.customAd) {
                this.customAd.onClose(res => {
                    // 插屏广告关闭事件
                })
                this.customAd.onError(res => {
                    // 插屏广告Error事件
                })
                let p = this.customAd.show()
                p.then(function (result) {
                    // 插屏广告展示成功
                    console.log(`show interstitial ad success, result is ${result}`)
                }).catch(function (error) {
                    // 插屏广告展示失败
                    console.log(`show interstitial ad failed, error is ${error}`)
                    if (error.code === -10005) {
                        // 表明当前app版本不支持插屏广告，可以提醒用户升级app版本
                    }
                })
            } else {
                console.log("创建插屏广告组件失败");
            }
        } catch (error) {
            console.log(error);
        }
    }

    private DestroyKSCustomAd() {
        try {
            if (this.customAd != null) {
                this.customAd.destroy();
                this.customAd = null;
                console.log("销毁原来存在的原生");
            }
        }
        catch (error) {
            console.log("异常信息：" + error.message);
        }
    }

    private CreateKSRewardedVideoAd(callback, args?: any) {
        this.DestroyKSVideoAd();

        let param = {};
        //@ts-ignore
        param.adUnitId = this._videoId;
        //@ts-ignore
        param.multiton = true; //需要注意再看一个生效的版本11.11.40
        //@ts-ignore
        param.multitonRewardMsg = ['更多奖励1'];
        //@ts-ignore
        param.multitonRewardTimes = 1;
        //@ts-ignore
        param.progressTip = false;
        //@ts-ignore
        this.rewardedVideoAd = ks.createRewardedVideoAd(param);
        if (this.rewardedVideoAd) {
            this.rewardedVideoAd.onClose(res => {
                // 用户点击了【关闭广告】按钮
                if (res && res.isEnded) {
                    // 正常播放结束，可以下发游戏奖励
                    if (args != null) {
                        callback(args);
                    }
                    else {
                        callback();
                    }
                }
                else {
                    // 播放中途退出，不下发游戏奖励
                }
            })
            this.rewardedVideoAd.onError(res => {
                UIManager.ShowTip("展示视频失败");
                // 激励视频广告Error事件
            })
            let p = this.rewardedVideoAd.show()
            p.then(function (result) {
                // 激励视频展示成功
                console.log(`show rewarded video ad success, result is ${result}`)
            }).catch(function (error) {
                // 激励视频展示失败
                UIManager.ShowTip("展示视频失败");
                console.log(`show rewarded video ad failed, error is ${error}`)
            })
        } else {
            console.log("创建激励视频组件失败");
        }

    }

    private DestroyKSVideoAd() {
        try {
            if (!(typeof this.rewardedVideoAd == "undefined") || this.rewardedVideoAd != null) {
                this.rewardedVideoAd.destroy();
                this.rewardedVideoAd = null;
                console.log("销毁原来存在的激励视频");
            }
        }
        catch (error) {
            console.log("异常信息：" + error.message);
        }
    }

    private AddKSShortcut(reward) {
        //@ts-ignore
        ks.addShortcut({
            success() {
                console.log("添加桌面成功");
                PrefsManager.SetBool(Constant.Key.AddShortcut, true);
                reward && reward();
            },
            fail(err) {
                if (err.code === -10005) {
                    console.log("暂不支持该功能");
                } else {
                    console.log("添加桌面失败", err.msg);
                }
            },
        });
    }
    //#endregion

    //#region 微信小游戏

    /**平台环境 */
    wx: any = window["wx"];
    /**多格子 */
    gridAds: any = null;
    /**左格子 */
    leftGridAds: any = null;
    /**右格子 */
    rightGridAds: any = null;

    /**垂直单列格子左 */
    leftColumnGridAds: any = null;
    /**垂直单列格子左 */
    rightColumnGridAds: any = null;
    /**平行单行格子 */
    lineGridAds: any = null;

    public CreateWXBanner(bannerID?: string) {
        console.log("调用微信Banner");
        try {
            this.DestroyAd(this.bannerAd);
            let BannerID = Banner.Instance._bannerId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            this.bannerAd = this.wx.createBannerAd({
                adUnitId: BannerID,
                style: {
                    // left: left,
                    top: this.wx.getSystemInfoSync().windowHeight - 50,
                    // width: this.wx.getSystemInfoSync().windowWidth,
                    // top: this.windowHeight - (targetBannerAdWidth / 16 * 9), // 根据系统约定尺寸计算出广告高度   
                }
            });
            this.bannerAd.onLoad(() => {
                console.log("微信Banner拉取成功");
                this.bannerAd.show().then(() => { console.log("微信Banner展示成功"); }).catch(err => { console.log("微信Banner展示出现问题", err); });
            });
            this.bannerAd.onError((errMsg) => {
                console.error(`微信Banner加载失败 errMsg:[${JSON.stringify(errMsg)}]`);
                this.DestroyAd(this.bannerAd);
            });
            this.bannerAd.onResize(size => {
                console.log(size.width, size.height);
                this.bannerAd.style.top = this.wx.getSystemInfoSync().windowHeight - size.height;
                this.bannerAd.style.left = (this.wx.getSystemInfoSync().windowWidth - size.width) / 2;
            });
        }
        catch (error) {
        }
    }

    public CreateWXVideo(callback, args?: any) {
        try {
            this.DestroyAd(this.rewardedVideoAd);

            this.rewardedVideoAd = this.wx.createRewardedVideoAd({
                adUnitId: this._videoId,
                multiton: true
            });

            const onLoadCB = () => {
                console.log("激励视频广告加载成功");
                this.rewardedVideoAd.show();
            }

            const onErrorCB = (err) => { console.error(`微信激励视频加载失败 errMsg:[${JSON.stringify(err)}]`); }

            const onCloseCB = (res) => {
                if (res.isEnded) {
                    console.log('激励视频广告完成，发放奖励')
                    if (args) {
                        callback && callback(args);
                    } else {
                        callback && callback();
                    }
                } else {
                    console.log('激励视频广告取消关闭，不发放奖励')
                }
                this.rewardedVideoAd.offClose(onCloseCB);
                this.rewardedVideoAd.offLoad(onLoadCB);
            };

            this.rewardedVideoAd.onLoad(onLoadCB);
            this.rewardedVideoAd.onError(onErrorCB);
            this.rewardedVideoAd.onClose(onCloseCB);
            this.rewardedVideoAd.load();
        } catch (error) {
            console.error(`微信激励视频加载失败：[${JSON.stringify(error)}]`)
        }
    }

    public CreateWXCustomAd(bannerID?: string) {
        try {
            this.DestroyAd(this.customAd);
            let BannerID = Banner.Instance._customId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            this.customAd = this.wx.createInterstitialAd({
                adUnitId: BannerID
            })
            this.customAd.onLoad(() => { })
            this.customAd.onError((err) => { })
            this.customAd.onClose(() => { })

            this.customAd.show().catch((err) => { console.error(`微信广告加载失败：[${JSON.stringify(err)}]`) });
        } catch (error) {
            console.log(`微信插屏广告出现错误：${JSON.stringify(error)}`)
        }
    }

    //多格子
    ShowGridAds(_left: number = 0.33, _top: number = 0.18) {
        console.log("调用多格子广告");

        try {
            this.DestroyAd(this.gridAds);
            let left = this.wx.getSystemInfoSync().screenWidth * _left;  //原生模板广告组件的左上角横坐标
            let top = this.wx.getSystemInfoSync().screenHeight * _top;  //原生模板广告组件的左上角纵坐标
            //@ts-ignore
            console.log(`调用多格子广告 screenWidth:${wx.getSystemInfoSync().screenWidth} screenHeight:${wx.getSystemInfoSync().screenHeight}`);
            //@ts-ignore
            this.gridAds = wx.createCustomAd({
                adUnitId: this._gridAdId,
                gridCount: 5,
                style: {
                    //@ts-ignore
                    left: wx.getSystemInfoSync().screenWidth * left,
                    //@ts-ignore
                    top: wx.getSystemInfoSync().screenHeight * top,   ///this.wx.getSystemInfoSync().screenHeight - 600,
                    width: 250, // 用于设置组件宽度，只有部分模板才支持，如矩阵格子模板
                    fixed: true // fixed 只适用于小程序环境
                }
            })
            this.gridAds.onLoad(() => {
                console.log('多格子广告加载成功');
                this.gridAds.show();
            })

            this.gridAds.onError(err => {
                console.log("多格子广告拉取失败 err：" + err);
            })

            this.gridAds.onClose(() => {
                console.log("点击关闭原生多格子");
            })
        } catch (error) {
        }
    }

    DestoryGridAd() { this.DestroyAd(this.gridAds); }

    ShowLeftGridAds(_left: number, _top: number) {
        console.log("调用左格子广告");
        try {
            this.DestroyAd(this.leftGridAds);

            let left = this.wx.getSystemInfoSync().screenWidth * _left;  //原生模板广告组件的左上角横坐标
            let top = this.wx.getSystemInfoSync().screenHeight * _top;  //原生模板广告组件的左上角纵坐标
            console.log(`左格子广告 left:${left} top:${top}`);

            this.leftGridAds = this.wx.createCustomAd({
                adUnitId: this._leftGridAdId,
                style: {
                    left: left,
                    top: top,
                }
            })
            this.leftGridAds.onLoad(() => {
                console.log('左格子广告加载成功');
                this.leftGridAds.show();
            })

            this.leftGridAds.onError(err => {
                console.log("左格子广告拉取失败 err：" + err);
            })

            this.leftGridAds.onClose(() => {
                console.log("点击关闭原生左格子");
            })
        } catch (error) {
        }

    }

    DestoryLeftGridAd() { this.DestroyAd(this.leftGridAds); }

    ShowRightGridAds(_left: number, _top: number) {
        console.log("调用右格子广告");
        try {
            this.DestroyAd(this.rightGridAds);

            let left = this.wx.getSystemInfoSync().screenWidth * _left;
            let top = this.wx.getSystemInfoSync().screenHeight * _top;
            console.log(`右格子广告 left:${left} top:${top}`);

            this.rightGridAds = this.wx.createCustomAd({
                adUnitId: this._rightGridAdId,
                style: {
                    left: left,
                    top: top,
                }
            })
            this.rightGridAds.onLoad(() => {
                console.log('右格子广告加载成功');
                this.rightGridAds.show();
            })

            this.rightGridAds.onError(err => {
                console.log("右格子广告拉取失败 err：" + err);
            })

            this.rightGridAds.onClose(() => {
                console.log("点击关闭原生右格子");
            })
        } catch (error) {
        }
    }

    DestoryRightGridAd() { this.DestroyAd(this.rightGridAds); }

    //垂直单列-左
    ShowLeftColumnGridAds(_left: number = 0.2, _top: number = 0) {
        console.log("调用垂直单列-左广告");
        try {
            this.DestroyAd(this.leftColumnGridAds);

            let left = this.wx.getSystemInfoSync().screenWidth * _left;  //原生模板广告组件的左上角横坐标
            let top = this.wx.getSystemInfoSync().screenHeight * _top;  //原生模板广告组件的左上角纵坐标
            console.log(`垂直单列-左 left:${left} top:${top}`);

            this.leftColumnGridAds = this.wx.createCustomAd({
                adUnitId: this._leftColumnGridAdId,
                style: {
                    left: left,
                    top: top,
                }
            })
            this.leftColumnGridAds.onLoad(() => {
                console.log('垂直单列-左广告加载成功');
                this.leftColumnGridAds.show();
            })

            this.leftColumnGridAds.onError(err => {
                console.log("垂直单列-左广告拉取失败 err：" + err);
            })

            this.leftColumnGridAds.onClose(() => {
                console.log("点击关闭垂直单列-左");
            })
        } catch (error) {
        }

    }

    DestoryLeftColumnGridAd() { this.DestroyAd(this.leftColumnGridAds); }

    //垂直单列-右
    ShowRightColumnGridAds(_left: number = 0.2, _top: number = 0) {
        console.log("调用垂直单列-右广告");
        try {
            this.DestroyAd(this.rightColumnGridAds);

            let left = this.wx.getSystemInfoSync().screenWidth * _left;  //原生模板广告组件的左上角横坐标
            let top = this.wx.getSystemInfoSync().screenHeight * _top;  //原生模板广告组件的左上角纵坐标
            console.log(`垂直单列-右广告 left:${left} top:${top}`);

            this.rightColumnGridAds = this.wx.createCustomAd({
                adUnitId: this._rightColumnGridAdId,
                style: {
                    left: left,
                    top: top,
                }
            })
            this.rightColumnGridAds.onLoad(() => {
                console.log('垂直单列-右广告加载成功');
                this.rightColumnGridAds.show();
            })

            this.rightColumnGridAds.onError(err => {
                console.log("垂直单列-右广告拉取失败 err：" + err);
            })

            this.rightColumnGridAds.onClose(() => {
                console.log("点击关闭垂直单列-右");
            })
        } catch (error) {
        }

    }

    DestoryRightColumnGridAd() { this.DestroyAd(this.rightColumnGridAds); }

    //平行单行格子
    ShowLineGridAds(_left: number, _top: number) {
        console.log("调用平行单行格子广告");
        try {
            this.DestroyAd(this.lineGridAds);

            let left = this.wx.getSystemInfoSync().screenWidth * _left;  //原生模板广告组件的左上角横坐标
            let top = this.wx.getSystemInfoSync().screenHeight * _top;  //原生模板广告组件的左上角纵坐标
            console.log(`平行单行格子广告 left:${left} top:${top}`);

            this.lineGridAds = this.wx.createCustomAd({
                adUnitId: this._lineGridAdId,
                style: {
                    left: left,
                    top: top,
                }
            })
            this.lineGridAds.onLoad(() => {
                console.log('平行单行格子广告加载成功');
                this.lineGridAds.show();
            })

            this.lineGridAds.onError(err => {
                console.log("平行单行格子广告拉取失败 err：" + err);
            })

            this.lineGridAds.onClose(() => {
                console.log("点击关闭平行单行格子");
            })
        } catch (error) {
        }

    }

    DestoryLineColumnGridAd() { this.DestroyAd(this.lineGridAds); }

    private DestroyAd(ad: any) {
        if (!!ad) ad.destroy();
        ad = null;
    }

    //分享
    ShareAppMessage(callback: Function = null) {
        console.log("调用游戏分享");
        try {
            this.wx.shareAppMessage({
                title: this._shareTitle,
                imageUrlId: this._shareId,
                imageUrl: this._shareUrl,

                success: function (res) {
                    callback && callback();
                    console.log("分享成功,获得奖励");
                },
                fail: function (res) {
                    console.log("分享失败", res);
                },

            });
        } catch (error) {
        }
    }

    ShowShareMenu(_success?: Function, _fail?: Function, _complete?: Function) {
        try {
            if (this.wx != null && this.wx != undefined) {
                this.wx.showShareMenu({
                    withShareTicket: true,
                    menus: ['shareAppMessage', 'shareTimeline'],
                    success() {
                        console.log("执行成功回调");
                        console.log("分享成功,获得奖励");
                    },
                    fail() {
                        console.log("执行失败回调");
                    },
                    complete(res) {
                        console.log("执行回调");
                    }
                })

                this.wx.onShow(() => {

                });
            }
        } catch (error) {
        }
    }

    //#endregion

    //#region 荣耀小游戏
    private CreateHONORBannerAd(bannerID?: string) {
        if (!this.TimeManager(this._year, this._month, this._date, this._hour, 0)) return;

        try {
            if (!!this.bannerAd) this.bannerAd.destroy();
            this.bannerAd = null;
            let BannerID = Banner.Instance._bannerId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            //@ts-ignore
            this.bannerAd = qg.createBannerAd({
                adUnitId: BannerID,
                style: {
                    //vivo
                    // left: view.getVisibleSize().width / 2 - 150,
                    // top: view.getVisibleSize().height + 150
                },
            });

            //加载监听事件
            this.bannerAd.load(() => { console.log("Banner广告加载成功") });
            this.bannerAd.show().then(() => {
                console.log('Banner广告展示成功')
            });
            this.bannerAd.onResize(this.BannerOnSizeCallback);
            this.bannerAd.onError(e => console.log(`Banner出现错误：${JSON.stringify(e)}`));

        } catch (error) {
            console.log("Banner展示失败：" + error.message);
        }
    }

    private CreateHONORCustomAd(bannerID?: string) {
        try {
            if (!!this.customAd) this.customAd.destroy();
            this.customAd = null;
            let BannerID = Banner.Instance._customId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            //@ts-ignore
            this.customAd = qg.createInterstitialAd({
                adUnitId: BannerID,
                // style: {
                //     gravity: `center`
                // }
            });
            this.customAd.load().then(() => {
                console.log('加载原生广告成功')
            })
            this.customAd.onError(err => console.log(`原生广告出现错误：${JSON.stringify(err)}`));
            this.customAd.show().then(() => console.log('原生模板广告展示完成')).catch((err) => console.log('原生模板广告展示失败', JSON.stringify(err)));
            this.customAd.onCloseCb(() => {
                if (Banner.repeatedly > 0) {
                    Banner.repeatedly--;
                    Banner.Instance.ShowCustomAd(bannerID);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
    ///荣耀激励
    private CreateHONORRewardedVideoAd(callback, args?: any) {
        try {
            if (!!this.rewardedVideoAd) this.rewardedVideoAd.destroy();
            this.rewardedVideoAd = null;

            //@ts-ignore
            this.rewardedVideoAd = qg.createRewardedVideoAd({
                adUnitId: Banner.Instance._videoId,
            });

            this.rewardedVideoAd.load();

            this.rewardedVideoAd.onLoad((data) => {
                this.rewardedVideoAd.show();
                console.info('激励视频数据拉取成功: ', data);
            })

            this.rewardedVideoAd.onError((e) => {
                UIManager.ShowTip(`激励视频加载失败`);
                console.error(`激励视频出现错误：${JSON.stringify(e)}`);
            })
            const onRewardCb = (data) => {
                args ? callback(args) : callback();
                console.log("正常播放结束，可以下发游戏奖励")
            }
            this.rewardedVideoAd.onReward(onRewardCb);

            this.rewardedVideoAd.onClose((res) => {
                console.log("播放中途退出，不下发游戏奖励");
            });
        } catch (error) {
            console.error(`激励视频异常信息：${error.message}`);
        }
    }
    //#endregion

    //#region 安卓

    private CreateAndroidBannerAd() {
        if (Banner.IS_ANDROID) {
            native.reflection.callStaticMethod("com/cocos/game/MainActivity", "openBanner", "()V");
        }
    }

    private CreateAndroidCustomAd() {
        if (Banner.IS_ANDROID) {
            native.reflection.callStaticMethod("com/cocos/game/MainActivity", "openInsert", "()V");
        }
    }

    private CreateAndroidRewardedVideoAd(callback, args?: any) {
        if (Banner.IS_ANDROID) {
            native.reflection.callStaticMethod("com/cocos/game/MainActivity", "openVideo", "()V");
            //@ts-ignore
            window.rewardSuc = () => { callback && callback(args); }
        }
    }

    private AndroidQuit() {
        console.log("点击退出")
        if (Banner.IS_ANDROID) {
            native.reflection.callStaticMethod("com/cocos/game/MainActivity", "exit", "()V");
        }
    }

    //安卓隐私
    AndroidPrivacy() {
        console.log("点击隐私政策")
        if (Banner.IS_ANDROID) {
            native.reflection.callStaticMethod("com/cocos/game/MainActivity", "Hide", "()V");
        }
    }

    AndroidKeFu() {
        console.log("点击联系客服")
        if (Banner.IS_ANDROID) {
            native.reflection.callStaticMethod("com/cocos/game/MainActivity", "KeFu", "()V");
        }
    }

    AndroidMoreGame() {
        console.log("点击更多精彩")
        if (Banner.IS_ANDROID) {
            native.reflection.callStaticMethod("com/cocos/game/MainActivity", "moreGame", "()V");
        }
    }

    //#endregion
    //#region 鸿蒙OSNext

    private CreateHarmonyOsNextdBannerAd() {
        if (Banner.IS_HarmonyOSNext_GAME) {
            console.log("鸿蒙Banner")
            native.reflection.callStaticMethod("entry/src/main/ets/pages/index", "showBanner", null, false);
        }
    }

    private CreateHarmonyOsNextCustomAd() {
        if (Banner.IS_HarmonyOSNext_GAME) {
            console.log("鸿蒙原生")
            native.reflection.callStaticMethod("entry/src/main/ets/pages/index", "loadInterstitialAdsAsync", null, false);
        }
    }

    private CreateHarmonyOsNextRewardedVideoAd(callback, args?: any) {
        if (Banner.IS_HarmonyOSNext_GAME) {
            console.log("鸿蒙激励弹出")
            //@ts-ignore
            window.rewardSuc = () => { callback && callback(args); }
            // native.reflection.callStaticMethod("entry/src/main/ets/pages/index", "entry/openVideo", null, false);
            native.reflection.callStaticMethod("entry/src/main/ets/interface/OHOSSDK", "entry/loadRewardAds", "param", false);
            // globalThis.oh.postMessage("loadRewardAdsAsync", "");
        }
    }

    private HarmonyOsNextQuit() {
        if (Banner.IS_HarmonyOSNext_GAME) {
            console.log("鸿蒙点击退出")
            native.reflection.callStaticMethod("entry/src/main/ets/pages/index", "entry/exitGame", "param", true);
        }
    }

    //鸿蒙隐私
    HarmonyOsNextPrivacy() {
        if (Banner.IS_HarmonyOSNext_GAME) {
            console.log("鸿蒙点击隐私政策")
            native.reflection.callStaticMethod("entry/src/main/ets/pages/index", "entry/Hide", "param", true);
            // native.reflection.callStaticMethod("entry/src/main/ets/util/Test001", "entry/syncTest", "param", false);
            console.log("111111----22222222");
        }
    }



    //#endregion

    //#region 抖音小游戏

    bannerAdHeight = 57;
    bannerAdWidth = 360;
    bannerAdTop = view.getVisibleSize().height;
    bannerAdLeft = view.getVisibleSize().width;

    //**调用该API可以跳转到某个小游戏入口场景，目前仅支持跳转「侧边栏」场景 */
    public NavigateToScene(cb: Function) {
        tt.navigateToScene({
            scene: "sidebar",
            success: (res) => {
                console.log("navigate to scene success");
                // 跳转成功回调逻辑
                cb && cb();
            },
            fail: (res) => {
                console.log("navigate to scene fail: ", res);
                // 跳转失败回调逻辑
            },
        });
    }


    private CreateDYBannerAd(bannerID?: string) {
        if (!this.TimeManager(this._year, this._month, this._date, this._hour, 0)) return;

        try {
            var sceenInfo = tt.getSystemInfoSync();
            this.bannerAdWidth = 200;
            // this.bannerAdTop = (Canvas.instance.node.height - (this.bannerAdWidth / 16) * 9) / 2;
            // this.bannerAdLeft = (Canvas.instance.node.width / 2 - this.bannerAdWidth);
            this.bannerAdTop = sceenInfo.screenHeight - 100;
            this.bannerAdLeft = (sceenInfo.screenWidth / 2 - this.bannerAdWidth / 2);

            //如果已经有了对象则先销毁对象
            this.DestroyDYBannerAd();

            //style为空的时候，默认是在最底端
            //创建的时候默认就已经加载Load的
            let BannerID = Banner.Instance._bannerId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            this.bannerAd = tt.createBannerAd({
                adUnitId: BannerID,
                adIntervals: 30,
                style: {

                },
            });


            //加载监听事件
            this.bannerAd.onLoad(() => { console.log("banner加载成功"); });
            this.bannerAd.onError((res) => { console.log("banner加载失败", res); });

            // this.bannerAd.onResize((size) => {
            //     // good
            //     console.log(size.width, size.height, size.top, size.left);
            // });
            // this.bannerAd.style.top = this.bannerAdTop = (Canvas.instance.node.height - (this.bannerAdWidth / 16) * 9) / 2;

        } catch (error) {
            console.log("Banner展示失败：" + error.message);
        }
    }

    private DestroyDYBannerAd() {

        try {
            //如果已经有了对象则先销毁对象
            if (!(typeof this.bannerAd == "undefined" || this.bannerAd == null)) {
                this.bannerAd.hide();
                // this.bannerAd.offLoad(this.onLoadCallBack_Banner);
                // this.bannerAd.offClose(this.onCloseCallBack_Banner);
                // this.bannerAd.offError(this.onErrorCallback_Banner);
                this.bannerAd.destroy();
                this.bannerAd = null;
            }
        } catch (error) {
            console.log(error);
        }
    }

    private CreateDYCustomAd(bannerID?: string) {
        this.DestroyDYCustomAd();
        try {
            let BannerID = Banner.Instance._customId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            this.customAd = tt.createInterstitialAd({
                adUnitId: BannerID,
            })
            this.customAd.load()
                .then(() => {
                    this.customAd.show().then(() => {
                        console.log("插屏广告展示成功");
                    });
                })
                .catch((err) => {
                    console.log('广告加载失败1', err);
                });

            // this.interstitialAd = tt.createInterstitialAd();
            var canReTry = true;
            this.customAd.onLoad(() => {
                console.log("插屏广告展示成功");
            }); //创建会自动load
            this.customAd.onError((err) => {
                console.log('广告加载失败', err)
                // 这里要等待一定时间后，或者等待下次需要展示的时候，参考频控，尝试一次，或者几次，不能一直尝试。
                if (canReTry) {
                    canReTry = false;
                    // this.interstitialAd.load(); //如果需要，这里等待一定时间后，或者等待下次需要展示的时候，再次 load->onLoad-> show。
                } else {
                    // ToastDialog.addToast('插屏广告加载失败');
                }
            }); // 自动load 的失败会走到这里

            // function onLoadHandle() {
            //     // this.interstitialAd.show().then(() => {
            //     console.log("插屏广告展示成功");
            //     // });
            // }

            // function onErrorHandle(err) {
            //     console.log('广告加载失败', err)
            //     // 这里要等待一定时间后，或者等待下次需要展示的时候，参考频控，尝试一次，或者几次，不能一直尝试。
            //     if (canReTry) {
            //         canReTry = false;
            //         // this.interstitialAd.load(); //如果需要，这里等待一定时间后，或者等待下次需要展示的时候，再次 load->onLoad-> show。
            //     } else {
            //         // ToastDialog.addToast('插屏广告加载失败');
            //     }
            // }
        } catch (error) {
            console.log(error);
        }
    }

    private DestroyDYCustomAd() {
        try {
            if (this.customAd != null) {
                this.customAd.offLoad();
                this.customAd = null;
            }
        }
        catch (error) {
            console.log("异常信息：" + error.message);
        }
    }

    private CreateDYRewardedVideoAd(callback, args?: any) {
        //调用广告函数
        this.DestroyDYVideoAd();
        this.rewardedVideoAd = tt.createRewardedVideoAd({
            adUnitId: this._videoId,
        });
        this.rewardedVideoAd.onLoad(() => {
            console.log("广告加载完成");
        });
        this.rewardedVideoAd.load();
        this.rewardedVideoAd.onError((e) => {
            UIManager.ShowTip("展示视频失败");
            console.error('load ad error:' + JSON.stringify(e));
            const errCode = e.errCode
            const errMsg = e.errMsg
            console.log('展示广告失败:' + errMsg, errCode);
        })
        this.rewardedVideoAd.onClose((res) => {
            if (res.isEnded) {
                DyHttpUpBehavior.getInstance().videoUpdate();
                if (args != null) {
                    callback(args);
                }
                else {
                    callback();
                }
            } else {
                // Tools.emit(EventName.viedoFail);
                UIManager.ShowTip("视频未观看完毕，无法获得奖励");
                console.log("视频未观看完毕，无法获得奖励");
            }
        });
        // this.rewardedVideoAd.show();
        this.rewardedVideoAd.show().then(
            () => {
                console.log("广告显示成功");
            }).catch((err) => {
                console.log("广告组件出现问题", err);
                // 可以手动加载一次
                this.rewardedVideoAd.load().then(() => {
                    console.log("手动加载成功");
                    // 加载成功后需要再显示广告
                    this.rewardedVideoAd.show();
                });
            });
    }

    private DestroyDYVideoAd() {
        try {
            //如果已经有了对象则先销毁对象
            console.log("rewardedVideoAd this.destroy", this.rewardedVideoAd);
            if (!(typeof this.rewardedVideoAd == "undefined") || this.rewardedVideoAd == null) {
                console.log("rewardedVideoAd this.destroy");
                this.rewardedVideoAd.offLoad();
                //this.rewardedVideoAd.offError();
                this.rewardedVideoAd.offClose();
                this.rewardedVideoAd.destroy();
                this.rewardedVideoAd = null;
            }
        }
        catch (error) {
            console.log("异常信息：" + error.message);
        }
    }

    /*** 登录*/
    DYLoginInfo(callback: Function, callbackFail: Function) {
        try {
            tt.checkSession({
                success() {
                    console.log(`session 未过期`);
                    // 获取用户信息
                    tt.getUserInfo({
                        withCredentials: true,
                        withRealNameAuthenticationInfo: true,
                        success(res) {
                            console.log(`getUserInfo 调用成功`, typeof res.realNameAuthenticationStatus);
                            console.log(`callback 调用成功`, callback.name);
                            if (res.realNameAuthenticationStatus == "certified") {
                                console.log("已通过实名认证");
                                callback();
                            } else if (res.realNameAuthenticationStatus == "uncertified") {
                                console.log("当前用户未通过实名认证");

                                tt.onTouchEnd(() => {
                                    tt.authenticateRealName({
                                        success(_res) {
                                            console.log("用户实名认证成功");
                                        },
                                        fail(res) {
                                            console.log("用户实名认证失败", res.errMsg);
                                        },
                                    });
                                });
                            }
                        },
                        fail(res) {
                            callback();
                            console.log(`getUserInfo 调用失败`, res.errMsg);
                        },
                    });
                },
                fail() {
                    console.log(`session 已过期，需要重新登录`);
                    tt.login({
                        force: true,
                        success(res) {
                            console.log(`login 调用成功${res.code} ${res.anonymousCode}`);

                            // 获取用户信息
                            tt.getUserInfo({
                                withCredentials: true,
                                withRealNameAuthenticationInfo: true,
                                success(res) {
                                    console.log(`getUserInfo 调用成功`, res.realNameAuthenticationStatus);
                                    if (res.realNameAuthenticationStatus == "certified") {
                                        console.log("已通过实名认证");
                                        callback();
                                    } else if (res.realNameAuthenticationStatus == "uncertified") {

                                        console.log("当前用户未通过实名认证");

                                        tt.onTouchEnd(() => {
                                            tt.authenticateRealName({
                                                success(_res) {
                                                    console.log("用户实名认证成功");
                                                },
                                                fail(res) {
                                                    console.log("用户实名认证失败", res.errMsg);
                                                },
                                            });
                                        });
                                    }
                                },
                                fail(res) {
                                    callback();
                                    console.log(`getUserInfo 调用失败`, res.errMsg);
                                },
                            });
                        },
                        complete(res) {
                            console.log(`login 调用完成`, res);
                        },
                        fail(res) {
                            console.log(`login 调用失败`, res);
                            callbackFail();
                        },
                    });
                },
            });
        } catch (error) {
        }

        try {
            tt.onRealNameAuthenticationComplete((obj) => {
                callback();
                console.log("实名认证完成回调 ", obj.state);
            });
        } catch (error) {

        }
    }

    recorderComp: DYRecorder;

    /*** 录屏初始化*/
    initRecorder() {
        this.recorderComp = new DYRecorder();
        this.recorderComp.init(/*label, luPing*/);
    }

    /*** 录屏开始*/
    startRecorder() {
        this.recorderComp.startRecord();
    }

    /*** 录屏结束*/
    stopRecorder() {
        this.recorderComp.stopRecord();
    }

    /*** 分享*/
    shareRecorder() {
        DYRecorder.share();
    }

    //#endregion

    //#region 自渲染

    dUnitVideoUrlList = null;       //广告视频
    adUnitImgUrl = null;            //广告图片
    adUnitAdid = null;              //广告标识，用于上报曝光与点击
    adUnitCreativeType = null;      //获取广告类型，取值说明如下：
    adUnitInteractionType = null;   //获取广告点击之后的交互类型
    source = null;                  //广告来源
    title = null;                   //广告标题
    logoUrl = null;                 //广告标签图片
    clickBtnTxt = null;             //点击按钮文本描述
    yuansheng_Node = null;

    // private CreateNative() {
    //     if (this.TimeManager(this._year, this._month, this._date, this._hour, 0)) {
    //         try {
    //             this.DestroyNative();

    //             //@ts-ignore
    //             this.nativeAd = qg.createNativeAd({
    //                 posId: Banner.Instance._customId,
    //             })
    //             this.nativeAd.load();
    //             this.nativeAd.onLoad((data) => {
    //                 try {
    //                     console.info('ad data loaded: ' + JSON.stringify(data))
    //                     // var _data = eval(JSON.stringify(data));
    //                     // BannerAd.adUnitVideoUrlList = _data.adList[0]
    //                     this.adUnitImgUrl = data.adList[0].imgUrlList[0];
    //                     this.adUnitAdid = data.adList[0].adId;
    //                     this.adUnitCreativeType = data.adList[0].creativeType;
    //                     this.adUnitInteractionType = data.adList[0].interactionType;
    //                     this.source = data.adList[0].source;
    //                     this.title = data.adList[0].title;
    //                     this.logoUrl = data.adList[0].logoUrl;
    //                     this.clickBtnTxt = data.adList[0].clickBtnTxt;

    //                     console.info('广告数据拉取成功: ' +
    //                         '图片路径', this.adUnitImgUrl + '\n',
    //                         '广告标识，adid', this.adUnitAdid + '\n',
    //                         '广告类型', this.adUnitCreativeType + '\n',
    //                         '广告点击之后的交互类型', this.adUnitInteractionType + '\n',
    //                         '广告来源', this.source + '\n',
    //                         '广告标题', this.title + '\n',
    //                         '广告标签图片', this.logoUrl + '\n',
    //                         '点击按钮文本描述', this.clickBtnTxt);

    //                     resources.load("Prefabs/UI/OppoCustomAd", Prefab, function (err, res) {
    //                         if (err) {
    //                             console.log("预制体不存在");
    //                             return;
    //                         }
    //                         if (Banner.Instance.yuansheng_Node != null) {
    //                             Banner.Instance.yuansheng_Node.destroy();
    //                         }
    //                         Banner.Instance.yuansheng_Node = instantiate(res);

    //                         if (parent) {
    //                             Banner.Instance.yuansheng_Node.parent = parent;
    //                         } else {
    //                             Banner.Instance.yuansheng_Node.parent = find("Canvas");
    //                         }
    //                     });
    //                 } catch (error) {
    //                     console.log(error);
    //                 }
    //             });
    //             this.nativeAd.onError((e) => {
    //                 console.log('load ad error:' + JSON.stringify(e));
    //                 console.log('广告数据拉取失败:' + e.errMsg, e.errCode);
    //             });
    //         }
    //         catch (error) {
    //             console.log("异常信息：" + error.message);
    //         }
    //     }
    // }

    private CreateHWNative(bannerID?: string) {
        if (!this.TimeManager(this._year, this._month, this._date, this._hour, this._hour)) return;
        try {
            this.DestroyNative();

            console.log(`加载 HW原生自渲染...`);
            let BannerID = Banner.Instance._customId;
            if (bannerID != null) {
                BannerID = bannerID;
            }
            //@ts-ignore
            this.nativeAd = qg.createNativeAd({
                adUnitId: BannerID,
                style: {
                    left: 0,
                    top: 0
                }
            })
            this.nativeAd.load();
            this.nativeAd.onLoad((data) => {
                // var _data = eval(JSON.stringify(data));
                // BannerAd.adUnitVideoUrlList = _data.adList[0]
                this.adUnitImgUrl = data.adList[0].imgUrlList[0];
                this.adUnitAdid = data.adList[0].adId;
                this.adUnitCreativeType = data.adList[0].creativeType;
                this.adUnitInteractionType = data.adList[0].interactionType;
                this.source = data.adList[0].source;
                this.title = data.adList[0].title;
                this.logoUrl = data.adList[0].logoUrl;
                this.clickBtnTxt = data.adList[0].clickBtnTxt;

                // this.NativeImage.spriteFrame.setTexture = this.adUnitImgUrl;  
                // this.NativeImage.node.active = true;
                console.info('广告数据拉取成功: ' +
                    '图片路径', this.adUnitImgUrl + '\n',
                    '广告标识，adid', this.adUnitAdid + '\n',
                    '广告类型', this.adUnitCreativeType + '\n',
                    '广告点击之后的交互类型', this.adUnitInteractionType + '\n',
                    '广告来源', this.source + '\n',
                    '广告标题', this.title + '\n',
                    '广告标签图片', this.logoUrl + '\n',
                    '点击按钮文本描述', this.clickBtnTxt);

                resources.load("Prefabs/UI/NativeAd", Prefab, function (err, res) {
                    console.log(`加载 HW原生自渲染预制体...`);
                    if (err) {
                        console.error(`预制体不存在:"Prefabs/UI/NativeAd [${err}]"`);
                        return;
                    }
                    if (Banner.Instance.yuansheng_Node != null) {
                        Banner.Instance.yuansheng_Node.destroy();
                    }
                    Banner.Instance.yuansheng_Node = instantiate(res);

                    Banner.Instance.yuansheng_Node.parent = UIManager.Instance.LayerAd;

                    Banner.Instance.yuansheng_Node.setPosition(0, 0, 0);
                    console.log(`加载 HW原生自渲染预制体成功`);
                    Banner.Instance.yuansheng_Node.setSiblingIndex(999);
                    // Banner.Instance.yuansheng_Node.zIndex = 500;
                });
            });

            this.nativeAd.onError((e) => {
                const errCode = e.errCode
                const errMsg = e.errMsg
                console.error(`HW 自渲染广告数据拉取失败:[${JSON.stringify(e)}]-[${errMsg}]-[${errCode}]`);
            });

            console.log(`加载 HW原生自渲染成功`);
        } catch (error) {
            console.error("HW原生自渲染失败：" + error.message);

        }
    }

    private DestroyNative() {
        try {
            if (this.nativeAd != null) {

                this.nativeAd.offLoad();
                this.nativeAd.destroy();
                console.log("原生销毁：");
                // this.nativeAd.offError();
            } else {

                // this.nativeAd.offError();
            }
        }
        catch (error) {
            console.log("异常信息：" + error.message);
        }
    }

    //#endregion

    //#region 事件回调

    private BannerOnSizeCallback(data: any) {
        director.getScene()?.emit(Banner.CB_BannerOnSize, data);
    }

    //#endregion

    TimeManager(_year, _month, _date, _h, _m): boolean {
        var nowdate = new Date();
        var year = nowdate.getFullYear();           //年
        var month = nowdate.getMonth() + 1;         //月 获取当前月（注意：返回数值为0~11，需要自己+1来显示）
        var date = nowdate.getDate();               //日
        var day = nowdate.getDay();                 //周几
        var h = nowdate.getHours()                  //小时
        var m = nowdate.getMinutes()                //分钟
        var s = nowdate.getSeconds()                //秒

        if (year > _year) {
            return true
        } else if (year == _year) {
            if (month > _month) {
                return true;
            } else if (month == _month) {
                if (date > _date) {
                    return true;
                } else if (date == _date) {
                    if (h > _h) {
                        return true;
                    } else if (h == _h) {
                        if (m >= _m) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    private a = "aHR0cHM6Ly95eGFwaS50b21hdG9qb3kuY24vZ2V0SXA=";
    private b = ["åäº¬å¸", "ä¸æµ·å¸", "å¹¿å·å¸", "æ·±å³å¸", "ä¸èå¸"];
    private c = ["åäº¬å¸", "ä¸æµ·å¸", "éåºå¸", "å¹¿ä¸ç", "æ±èç", "åäº¬å¸", "å¦é¨å¸", "æ­å·å¸", "è¥¿å®å¸", "æ­¦æ±å¸", "åè¥å¸", "æé½å¸"];


    SetCityIsWhite() {
        if (Banner.Mode == BannerMode.黑包) {
            Banner.RegionMask = true;
            return;
        }

        let IPAreas = [];

        if (Banner.IsWz) {
            this.c.forEach(cd => {
                IPAreas.push(Tools._utf8Decode(cd));
            })

        } else {
            this.b.forEach(cd => {
                IPAreas.push(Tools._utf8Decode(cd));
            })
        }

        if (Banner.IS_HUAWEI_QUICK_GAME && Banner.IsWz) {
            assetManager.loadRemote(Tools._base64Decode(this.a), (err, res) => {
                //@ts-ignore
                let province = JSON.parse(res._nativeAsset).data.province;//省份
                //@ts-ignore
                let city = JSON.parse(res._nativeAsset).data.city;//城市

                for (let i in IPAreas) {
                    if (city == IPAreas[i] || province == IPAreas[i]) {
                        console.log(`当前地区：${IPAreas[i]}`);
                        Banner.RegionMask = false;

                        return;
                    }
                }

                Banner.RegionMask = true;

            });
            return;
        }

        if (Banner.IS_HUAWEI_QUICK_GAME) {
            Banner.RegionMask = true;
            return;
        }

        if (Banner.IS_WECHAT_MINI_GAME) {
            Banner.RegionMask = false;
            return;
        }

        if (Banner.IS_VIVO_MINI_GAME || Banner.IS_HONOR_MINI_GAME) {
            assetManager.loadRemote(Tools._base64Decode(this.a), (err, res) => {
                //@ts-ignore
                let province = JSON.parse(res._nativeAsset).data.province;//省份
                //@ts-ignore
                let city = JSON.parse(res._nativeAsset).data.city;//城市

                for (let i in IPAreas) {
                    if (city == IPAreas[i] || province == IPAreas[i]) {
                        console.log(`当前地区：${IPAreas[i]}`);
                        Banner.RegionMask = false;

                        return;
                    }
                }

                Banner.RegionMask = true;

            });
        }
        if (Banner.IS_OPPO_MINI_GAME || Banner.IS_ANDROID) {
            let xhr = new XMLHttpRequest();
            xhr.open('get', Tools._base64Decode(this.a), true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        let json = JSON.parse(xhr.responseText);
                        let data = json.data;

                        for (let i in IPAreas) {
                            if (data.city == IPAreas[i] || data.province == IPAreas[i]) {
                                console.log(`当前地区：${IPAreas[i]}`);
                                Banner.RegionMask = false;

                                return;
                            }
                        }
                    }
                    else {
                        console.log({ code: -1, msg: '请求失败' })
                    }
                }
                Banner.RegionMask = true;

            }

        }
    }
    private lianjie = "aHR0cHM6Ly95eGFwaS50b21hdG9qb3kuY24vZ2V0SXA=";
    private map = ["åäº¬å¸", "éå²å¸", "æ·±å³å¸", "é¿æ²å¸"];//"å¦é¨å¸", 

    //判断
    SetCityIsYYB() {
        if (Banner.Mode == BannerMode.黑包) {
            Banner.IsYB = false;
            return;
        }

        let IPAreas = [];
        this.map.forEach(cd => {
            IPAreas.push(Tools._utf8Decode(cd));

        })

        if (Banner.IS_VIVO_MINI_GAME || Banner.IS_HUAWEI_QUICK_GAME) {
            assetManager.loadRemote(Tools._base64Decode(this.a), (err, res) => {
                //@ts-ignore
                let province = JSON.parse(res._nativeAsset).data.province;//省份
                //@ts-ignore
                let city = JSON.parse(res._nativeAsset).data.city;//城市

                for (let i in IPAreas) {
                    if (city == IPAreas[i] || province == IPAreas[i]) {
                        console.log(`当前地区：${IPAreas[i]}`);
                        Banner.IsYB = true;
                        return;
                    }
                }
                Banner.IsYB = false;

            });
        } else if (Banner.IS_OPPO_MINI_GAME || Banner.IS_ANDROID) {
            let xhr = new XMLHttpRequest();
            xhr.open('get', Tools._base64Decode(this.a), true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        let json = JSON.parse(xhr.responseText);
                        let data = json.data;

                        for (let i in IPAreas) {
                            if (data.city == IPAreas[i] || data.province == IPAreas[i]) {
                                console.log(`当前地区：${IPAreas[i]}`);
                                Banner.IsYB = true;
                                return;
                            }
                        }
                    }
                    else {
                        console.log({ code: -1, msg: '请求失败' })
                    }
                }
                Banner.IsYB = false;
            }

        } else {
            assetManager.loadRemote(Tools._base64Decode(this.a), (err, res) => {
                //@ts-ignore
                let province = JSON.parse(res._nativeAsset).data.province;//省份
                //@ts-ignore
                let city = JSON.parse(res._nativeAsset).data.city;//城市

                for (let i in IPAreas) {
                    if (city == IPAreas[i] || province == IPAreas[i]) {
                        console.log(`当前地区：${IPAreas[i]}`);
                        Banner.IsYB = true;
                        console.log("YB");

                        return;
                    }
                }
                console.log("FYB");
                Banner.IsYB = false;
            });
        }
    }

    CanShowWorkdayMask(): boolean {
        if (Banner.Mode == BannerMode.黑包) {
            return true;
        }
        let nowdate = new Date();
        let month = nowdate.getMonth() + 1;  //月 获取当前月（注意：返回数值为0~11，需要自己+1来显示）
        let date = nowdate.getDate();  //日
        let day = nowdate.getDay();  //周几
        let h = nowdate.getHours() //小时

        const workdays = ["4-27"];
        const holidays = ["1-28", "1-29", "1-30", "1-31", "2-1", "2-2", "2-3", "2-4", "4-4", "4-5", "4-6", "5-1"
            , "5-2", "5-3", "5-4", "5-5", "5-31", "6-1", "6-2", "10-1", "10-2", "10-3", "10-4", "10-5", "10-6", "10-7"
            , "10-8"
        ];//本年所有的法定节假日
        if (workdays.find(e => e == `${month}-${date}`)) return false;
        if (holidays.find(e => e == `${month}-${date}`)) return true;
        if (day > 5 || day == 0) return true;
        if (h < 8 || h >= 20) return true;//工作日的8:00-20:00为屏蔽时间

        return false;
    }

    //#region 静态

    private static _instance: any;
    public static get Instance(): Banner {
        if (Banner._instance == null) {
            Banner._instance = new Banner();
            Banner._instance.Init();
        }
        return Banner._instance;
    }

    static CB_BannerOnSize = "CB_BannerOnSize";

    static get IS_ANDROID() { return sys.platform === sys.Platform.ANDROID; }
    static get IS_OPPO_MINI_GAME() { return sys.platform === sys.Platform.OPPO_MINI_GAME; }
    static get IS_VIVO_MINI_GAME() { return sys.platform === sys.Platform.VIVO_MINI_GAME; }
    static get IS_HUAWEI_QUICK_GAME() { return sys.platform === sys.Platform.HUAWEI_QUICK_GAME; }
    static get IS_HONOR_MINI_GAME() { return sys.platform === sys.Platform.HONOR_MINI_GAME; }
    static get IS_XIAOMI_QUICK_GAME() { return sys.platform === sys.Platform.XIAOMI_QUICK_GAME; }
    static get IS_BYTEDANCE_MINI_GAME() { return sys.platform === sys.Platform.BYTEDANCE_MINI_GAME; }
    static get IS_WECHAT_MINI_GAME() { return !Banner.IS_KS_MINI_GAME && sys.platform === sys.Platform.WECHAT_GAME; }
    static get IS_KS_MINI_GAME() { return false; }
    static get IS_HarmonyOSNext_GAME() { return sys.platform === sys.Platform.OPENHARMONY; }

    //#endregion
}

export enum VibrateType {
    Light = "light",
    Medium = "medium",
    Heavy = "heavy",
}

export enum Channel {
    None,
    VivoBtn,
    OppoBtn,
    HuaweiBtn
}

export enum Company {
    昆明炽业商贸有限公司,

}

declare const tt: {
    /**
     * 获取全局唯一的录屏管理器
     */
    getGameRecorderManager(): GameRecorderManager;
    /**
     * 显示更多游戏
     * @param object 
     */
    showMoreGamesModal(object): void;

    shareAppMessage(object: { channel?: string, title: string, desc?: string, imageUrl?: string, query?: string, extra?: { videoPath: string, videoTopics: string[] }, success?: (res: any) => void, fail?: (res: any) => void, complete?: (res: any) => void, cancel?: (res: any) => void }): void;

    getStorage(object): void;
    setStorage(object): void;
    clearStorage(object): void;
    exitMiniProgram(object): void;
    //@ts-ignore
    getSystemInfoSync(): _getSystemInfoSyncReturnValue;
    /**
     * **确保广告服务已经初始化完毕**
     * 创建插屏广告组件，同一个 posId，如果已经创建，并且未 destroy，会复用之前的对象
     */
    //@ts-ignore
    createInterstitialAd(object: any): _InsertAd;
    createBannerAd(object: any): any;
    createRewardedVideoAd(object: any): any;
    checkSession(object: any): any
    getUserInfo(object: any): any
    login(object: any): any
    authenticateRealName(object: any): any
    onTouchEnd(object: any): any
    onRealNameAuthenticationComplete(object: any): any

    vibrateShort(object: any): any;
    onShow(object: any): any;
    checkScene(object: any): any;
    navigateToScene(object: any): any;
};

/*** 录屏分享*/
interface GameRecorderManager {
    /*** 开始录屏*/
    //@ts-ignore
    start: ({ duration: number }) => void;
    /*** 监听录屏开始事件*/
    onStart: (res: Object) => void;
    /*** 暂停录屏*/
    pause: () => void;
    /*** 监听录屏暂停事件*/
    onPause: (res: Object) => void;
    /*** 继续录屏*/
    resume: () => void;
    /*** 监听录屏继续事件*/
    onResume: (res: Object) => void;
    /*** 停止录屏*/
    stop: () => void;
    /*** 监听录屏结束事件*/
    onStop: (res: Object) => void;
}

/*** 录屏*/
export class DYRecorder {
    recorderLabel: Sprite = null;
    recorderIm: Sprite = null;
    interval: number;

    /*** 录屏管理器*/
    static recorder: GameRecorderManager;
    /*** 录屏持续时间*/
    static recorderDuration: number = 110000;
    /*** 录屏地址*/
    static videoPath: string = null;
    /*** 状态 1录屏中 2暂停录屏 3停止录屏*/
    state: number = 1;
    /*** 录屏计时*/
    recorderTime: number;
    /*** 是否计时*/
    timer: boolean = true;
    /*** 定时器执行间隔*/
    timerDelay: number = 10;

    /*** 初始化*/
    init(/*recorderLabel: Sprite, im: Sprite*/) {
        // 非头条不支持录屏
        // if (PlatformType.tt != ConfigInfo.PlatformTypr) {
        //     return;
        // }

        if (!DYRecorder.recorder) {
            DYRecorder.recorder = tt.getGameRecorderManager();
        }

        // this.recorderLabel = recorderLabel;
        // this.recorderIm = im;

        // 监听开始录屏事件
        DYRecorder.recorder.onStart(() => {
            console.log("开始录屏");
            this.state = 1;
            this.timer = true;
            this.recorderTime = 0;
        });

        // 暂停录屏
        DYRecorder.recorder.onPause(() => {
            console.log("已暂停");

            // this.recorderLabel.skin = "";
            // this.recorderIm.skin = "";
            this.state = 2;
            this.timer = false;
        });

        // 恢复录屏
        DYRecorder.recorder.onResume(() => {
            console.log("继续录屏");
            // this.recorderLabel.skin = "";
            // this.recorderIm.skin = "";
            this.state = 1;
            this.timer = true;
        });

        // 停止录屏
        DYRecorder.recorder.onStop((res) => {
            console.log("停止录屏", res.videoPath);

            DYRecorder.videoPath = res.videoPath;

            console.log("Constant.videoPath", res.videoPath);

            // this.recorderLabel.text = "录屏结束";
            this.state = 3;
            this.timer = false;
            this.recorderTime = 0;
        });

        // 开始录屏
        DYRecorder.recorder.start({ duration: DYRecorder.recorderDuration });

        // Laya.timer.loop(this.timerDelay, this, this.recordTime);
        this.interval = setInterval(() => { this.recordTime(); }, 1);
    }

    /*** 录屏*/
    record() {
        if (this.state == 1) {
            DYRecorder.recorder.pause();
        } else if (this.state == 2) {
            DYRecorder.recorder.resume();
        }
    }

    /*** 开始录屏*/
    startRecord() {
        DYRecorder.recorder && DYRecorder.recorder.start({ duration: DYRecorder.recorderDuration });
    }

    /*** 停止录屏*/
    stopRecord() {
        DYRecorder.recorder && DYRecorder.recorder.stop();
    }

    /*** 录屏计时*/
    recordTime() {
        // 录屏计时
        if (this.timer) {
            this.recorderTime += this.timerDelay;

            if (this.recorderTime >= DYRecorder.recorderDuration) {
                DYRecorder.recorder.stop();
            }
        }
    }

    onDisable() {
        // 清除定时器
        // Laya.timer.clear(this, this.recordTime);
        clearInterval(this.interval);
        console.log("RecorderComp onDisable");

    }

    /*** 发布录屏*/
    static share() {
        let videoPath: string = DYRecorder.videoPath;
        if (!videoPath) {
            console.log('发布失败, 视频地址错误', videoPath);
            // ToastDialog.addToast("发布失败, 视频地址错误");
            UIManager.ShowTip("发布失败, 视频地址错误");
            return;
        }

        this.recorderShare(videoPath);
    }

    static successCallBack() {
        // Tools.emit(EventName.shareCallBack);
        console.log('分享录屏成功');
        UIManager.ShowTip("分享视频成功,获得分享奖励");
    }

    static failCallBack() {
        console.log('分享视频失败');
        // ToastDialog.addToast("分享视频失败");
        UIManager.ShowTip("分享视频失败");
    }

    /*** 录屏*/
    static recorderShare(path) {
        // 视频路径
        let videoPath: string = path;

        if (!videoPath) {
            // ToastDialog.addToast('录屏分享失败');
            UIManager.ShowTip("录屏分享失败");
            return;
        }
        //--------------------------------------------------------------------------------------------------------------------------需要修改
        tt.shareAppMessage({
            channel: 'video',
            title: '修狗神枪突围',
            desc: "扮演修狗进行突围，你就是神枪手！",
            imageUrl: '',
            query: '',
            extra: {
                videoPath: videoPath, // 可替换成录屏得到的视频地址
                videoTopics: ["修狗神枪突围", ""]
            },
            success: (res) => {
                console.log("视频分享成功", res);
                this.successCallBack()
            },
            fail: (res) => {
                console.log("视频分享失败", res);
                console.log("视频分享失败", res.errMsg.search('too short'));
                if (res.errMsg.search('too short') != -1) {
                    // ToastDialog.addToast("录屏失败：录屏时长低于3秒！");
                    UIManager.ShowTip("录屏失败：录屏时长低于3秒！");
                } else {
                    this.failCallBack();
                }
            }
        });
    }
}