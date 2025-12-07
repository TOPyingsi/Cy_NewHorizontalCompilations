import { BusinessError, commonEventManager } from '@kit.BasicServicesKit';
import Logger from '../../../common/Logger';
import { AdStatus } from '../constant/AdStatus';

let log: Logger = new Logger(0x0002, "InterstitialAdStatusHandler");
const KEY_INTERSTITIAL_STATUS: string = 'interstitial_ad_status';

/**
 * 插屏广告的处理类
 */
export class InterstitialAdStatusHandler {
  // Used to save the created subscriber object for subsequent subscription and unsubscription.
  private subscriber: commonEventManager.CommonEventSubscriber | null = null;

  /**
   * 插屏广告的注册接口，在广告播放的每一个阶段：打开，关闭，点击等等都会将状态回调
   * @param callback
   */
  registerPPSReceiver(callback: (status: string) => void): void {
    if (this.subscriber) {
      this.unRegisterPPSReceiver();
    }
    const subscribeInfo: commonEventManager.CommonEventSubscribeInfo = {
      events: ['com.huawei.hms.pps.action.PPS_INTERSTITIAL_STATUS_CHANGED'],
      publisherBundleName: 'com.huawei.hms.adsservice'
    };
    commonEventManager.createSubscriber(subscribeInfo,
      (err: BusinessError, commonEventSubscriber: commonEventManager.CommonEventSubscriber) => {
        if (err) {
          log.error(`Failed to create subscriber. Code is ${err.code}, message is ${err.message}`);
          callback(AdStatus.AD_FAIL);
          return;
        }
        log.info('Succeeded in creating subscriber');
        this.subscriber = commonEventSubscriber;
        if (!this.subscriber) {
          log.warn('Need to create subscriber');
          callback(AdStatus.AD_FAIL);
          return;
        }
        commonEventManager.subscribe(this.subscriber,
          (err: BusinessError, commonEventData: commonEventManager.CommonEventData) => {
            if (err) {
              log.error(`Failed to subscribe. Code is ${err.code}, message is ${err.message}`);
              callback(AdStatus.AD_FAIL);
            } else {
              log.info('Succeeded in subscribing data');
              const status: string = commonEventData?.parameters?.[KEY_INTERSTITIAL_STATUS];
              switch (status) {
                case AdStatus.AD_OPEN:
                  log.info('Status is onAdOpen');
                  callback(AdStatus.AD_OPEN);
                  break;
                case AdStatus.AD_CLICKED:
                  log.info('Status is onAdClick');
                  callback(AdStatus.AD_CLICKED);
                  break;
                case AdStatus.AD_CLOSED:
                  log.info('Status is onAdClose');
                  this.unRegisterPPSReceiver();
                  callback(AdStatus.AD_CLOSED);
                  break;
                case AdStatus.VIDEO_PLAY_BEGIN:
                  log.info('Status is onVideoPlayBegin');
                  callback(AdStatus.VIDEO_PLAY_BEGIN);
                  break;
                case AdStatus.VIDEO_PLAY_END:
                  log.info('Status is onVideoPlayEnd');
                  callback(AdStatus.VIDEO_PLAY_END);
                  break;
              }
            }
          });
      });
  }

  unRegisterPPSReceiver(): void {
    commonEventManager.unsubscribe(this.subscriber, (err: BusinessError) => {
      if (err) {
        log.error(`Failed to unsubscribe. Code is ${err.code}, message is ${err.message}`);
      } else {
        log.info('Succeeded in unsubscribing');
        this.subscriber = null;
      }
    });
  }
}