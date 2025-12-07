import Logger from '../../common/Logger'
import { abilityAccessCtrl, common, Context, PermissionRequestResult } from '@kit.AbilityKit';
import { AdType } from './constant/AdType';
import { advertising, identifier } from '@kit.AdsKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { RewardAdStatusHandler } from './handler/RewardAdStatusHandler';
import call from '@ohos.telephony.call';
import { AdStatus } from './constant/AdStatus';
import { InterstitialAdStatusHandler } from './handler/InterstitialAdStatusHandler';
import { MetaDataConfig } from '../../common/MetaDataConfig';
import { TimeOutHandler } from '../../common/TimeOutHandler';

let log: Logger = new Logger(0x0002, "HuaweiAdsKit");

/**
 * 封装广告的内部接口
 */
export class HwAds {
  // 以下是对应的广告参数,需要自行调整
  private adDisplayOptions: advertising.AdDisplayOptions = {
    mute: true,
    // 设置轮播时间为30s
    refreshTime: 30000
  };
  private oaid: string | undefined = undefined;
  private context: common.UIAbilityContext;
  //配置广告
  private adOptions: advertising.AdOptions = {
    // 根据COPPA法规 , 是否希望您的广告内容被视为面向儿童的内容
    tagForChildProtection: -1,
    //最高广告内容评级
    adContentClassification: 'A',
    //是否请求非个性化广告
    nonPersonalizedAd: 0,
    //是否允许通过移动数据下载广告资源
    allowMobileTraffic: 0,
    //是否希望以适合欧洲经济区(EEA)中未达到打定同意年轻的用户的方式处理广告请求
    tagForUnderAgeOfPromise: -1
  };

  constructor(context: common.UIAbilityContext) {
    this.context = context;
    // 在构造时会去请求OAID，这个OAID是必须要请求的
    // 获取OAID还需要配置权限，在module.json5文件中
    this.requestOAID(context).then((oaid: string | undefined) => {
      this.oaid = oaid;
    })
  }

  /**
   * 加载激励广告
   * @param adId
   * @param callback
   */
  loadRewardAds(adId: string,
    callback: (status: string, rewardData: Record<string, string | number> | undefined) => void) {
    let adRequestParams: advertising.AdRequestParams = {
      adId: adId,
      adType: AdType.REWARD,
      oaid: this.oaid
    }

    this.loadAds(adRequestParams).then((ads: Array<advertising.Advertisement>) => {
      // 注册激励广告的状态监听器，用于监控广告的播放状态
      new RewardAdStatusHandler().registerPPSReceiver(callback);
      advertising.showAd(ads[0], this.adDisplayOptions, this.context);
    }).catch((errcode: number) => {
      callback(AdStatus.AD_FAIL, undefined);
      log.error(`激励广告展示失败: Failed to load reward ads. Code is ${errcode}`);
    })

  }

  /**
   * 加载插屏广告
   * @param adId
   * @param callback
   */
  loadInterstitialAds(adId: string, callback: (status: string) => void) {
    let adRequestParams: advertising.AdRequestParams = {
      adId: adId,
      adType: AdType.INTERSTITIAL,
      oaid: this.oaid
    }
    this.loadAds(adRequestParams).then((ads: Array<advertising.Advertisement>) => {
      //注册激励广告的状态监听器，用于监控广告的播放状态
      new InterstitialAdStatusHandler().registerPPSReceiver(callback);
      advertising.showAd(ads[0], this.adDisplayOptions, this.context);
    }).catch((errcode: number) => {
      callback(AdStatus.AD_FAIL);
      log.error(`插屏广告展示失败: Failed to load reward ads. Code is ${errcode}`)
      log.error(`插屏广告参数: ${adRequestParams.adId} , oaid is ${adRequestParams.oaid}` )
    })
  }

  /**
   * 加载开屏广告,这里只是请求广告,显示广告需要再page上显示
   * @param timeoutCallback
   * @returns
   */
  loadSplashAds(timeoutCallback: () => void): Promise<Array<advertising.Advertisement> | undefined> {
    let adRequestParams: advertising.AdRequestParams = {
      adId: MetaDataConfig.AD_ID_SPLASH!, //此处无需空校验
      adType: AdType.SPLASH,
      adCount: 1,
      oaid: this.oaid
    };
    let timeOutHandler = new TimeOutHandler(timeoutCallback, 1000);
    return new Promise((resolve, reject) => {
      this.loadAds(adRequestParams).then((ads: Array<advertising.Advertisement>) => {
        timeOutHandler.clear();
        resolve(ads);
      }).catch((errCode: number) => {
        resolve(undefined);
      })
    })
  }

  /**
   * 获取Banner相关的请求参数
   * @returns
   */
  getBannerRequest(): advertising.AdRequestParams{
    return{
      adId:MetaDataConfig.AD_ID_BANNER!,//此处无需空校验
      adType: AdType.BANNER,
      adWidth:360,
      adHeight:57,
      oaid: this.oaid
    };
  }

  getAdDisplayOptions(): advertising.AdDisplayOptions {
    return this.adDisplayOptions;
  }

  getAdOptions(): advertising.AdOptions {
    return this.adOptions;
  }

  private requestOAID(context: Context): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      let isPermissionGranted: boolean = false;
      const atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
      atManager.requestPermissionsFromUser(context, ['ohos.permission.APP_TRACKING_CONSENT'])
        .then((result: PermissionRequestResult) => {
          isPermissionGranted = result.authResults[0] === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED;
          if (isPermissionGranted) {
            log.info('Succeeded in requesting permission');
            return identifier.getOAID();
          } else {
            log.error('Failed to request permission. User rejected')
            return undefined;
          }
        })
        .then((oaid: string | undefined) => {
          log.info(`Succeeded in getting OAID: ${oaid}`);
          resolve(oaid);
        })//在完成权限请求并尝试获取 OAID 后，记录结果并将获取到的 OAID（或 undefined）作为整个异步操作的最终结果返回。
        .catch((err: BusinessError) => {
          log.error(`Failed to request oaid. Code is ${err.code}, message is ${err.message}`);
          resolve(undefined);
        })
    })
  }

  private loadAds(adRequestParms: advertising.AdRequestParams): Promise<Array<advertising.Advertisement>> {
    return new Promise((resolve, reject) => {
      const adLoadListener: advertising.AdLoadListener = {
        onAdLoadFailure: (errorCode: number, errorMsg: string) => {
          log.error(`Failed to load ad. Code is ${errorCode},message is ${errorMsg}`);
          reject(errorCode);
        },
        onAdLoadSuccess: (ads: Array<advertising.Advertisement>) => {
          log.info('Succeeded in loading ad');
          resolve(ads);
        }
      };
      const adLoader: advertising.AdLoader = new advertising.AdLoader(this.context);
      adLoader.loadAd(adRequestParms, this.adOptions, adLoadListener);
    })
  }
}