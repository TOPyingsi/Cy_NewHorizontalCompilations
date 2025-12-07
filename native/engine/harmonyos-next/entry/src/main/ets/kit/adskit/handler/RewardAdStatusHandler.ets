import Logger from '../../../common/Logger'
import { BusinessError, commonEventManager } from '@kit.BasicServicesKit';
import { AdStatus } from '../constant/AdStatus';
import { window } from '@kit.ArkUI';

let log: Logger = new Logger(0x0002, "RewardAdStatusHandler");
const KEY_REWARD_DATA: string = 'reward_ad_data';
const KEY_REWARD_STATUS: string = 'reward_ad_status';

/**
 * 激励广告的处理类
 */
export class RewardAdStatusHandler {
  // 用于保存已创建的订阅者对象，以便后续进行订阅和取消订阅操作。
  private subscriber: commonEventManager.CommonEventSubscriber | null = null;

  /**
   * 激励广告的注册接口 , 在广告播放的每一个阶段: 打开,关闭,点击等等都会将状态回调
   * 如果成功获取到了激励还会返回后台配置的rewardData, 不过一般rewardData可能用不到
   * @parm callback
   */
  registerPPSReceiver(callback: (status: string,
    rewardDta: Record<string, string | number> | undefined) => void): void {
    if (this.subscriber) {
      this.unRegisterPPSReceiver();
    }
    const subscribeInfo: commonEventManager.CommonEventSubscribeInfo = {
      events: ['com.huawei.hms.pps.action.PPS_REWARD_STATUS_CHANGED'],
      publisherBundleName: 'com.huawei.hms.adsservice'
    };
    commonEventManager.createSubscriber(subscribeInfo, (err: BusinessError, commonEventSubscriber:
      commonEventManager.CommonEventSubscriber) => {
      if (err) {
        log.error(`Failed to create subscriber. Code is ${err.code}, message is ${err.message}`);
        callback(AdStatus.AD_FAIL, undefined)
        return;
      }
      log.info('Succeeded in creating subscriber');
      this.subscriber = commonEventSubscriber;
      if (!this.subscriber) {
        log.warn('Need create subscriber')
        callback(AdStatus.AD_FAIL, undefined)
        return;
      }
      commonEventManager.subscribe(this.subscriber, (err: BusinessError, commonEventSubscriber:
        commonEventManager.CommonEventData) => {
        if (err) {
          log.error(`Failed to subscribe. Code is ${err.code}, message is ${err.message}`);
          callback(AdStatus.AD_FAIL, undefined);
        } else {
          log.info('Succeeded in subscribing data');
          //?.在访问嵌套对象的属性时，如果中间某个对象可能为 null 或 undefined，
          // ?. 会提前终止访问并返回 undefined，而不会抛出「无法访问 null/undefined 的属性」之类的错误。
          const status: string = commonEventSubscriber?.parameters?.[KEY_REWARD_STATUS]; // 从订阅的数据中获取激励广告的状态信息
          switch (status) {
            case AdStatus.AD_OPEN:
              log.info('Status is onAdOpen');
              callback(AdStatus.AD_OPEN, undefined);
              break;
            case AdStatus.AD_CLICKED:
              log.info('Status is onAdClick');
              callback(AdStatus.AD_CLICKED, undefined);
              break;
            case AdStatus.AD_CLOSED:
              log.info('Status is onAdClose');
              this.unRegisterPPSReceiver();
              callback(AdStatus.AD_CLOSED, undefined);
              break;
            case AdStatus.AD_REWARDED:
              const rewardData: Record<string, string | number> = commonEventSubscriber?.parameters?.[KEY_REWARD_DATA];
              const rewardType: string = rewardData?.rewardType as string;
              const rewardAmount: number = rewardData?.rewardAmount as number;
              log.info(`下发奖励: Status is onAdReward. Type is ${rewardType}, Amount is ${rewardAmount}`);
              callback(AdStatus.AD_REWARDED, rewardData);

              break;
            case AdStatus.VIDEO_PLAY_BEGIN:
              log.info('Status is onVideoPlayBegin');
              callback(AdStatus.VIDEO_PLAY_BEGIN, undefined);
              break;
            case AdStatus.VIDEO_PLAY_END:
              log.info('Status is onVideoPlayEnd');
              callback(AdStatus.VIDEO_PLAY_END, undefined);
              break;
          }
        }
      })
    })
  }

  unRegisterPPSReceiver() {
    commonEventManager.unsubscribe(this.subscriber, (err: BusinessError) => {
      if (err) {
        log.error(`Failed to unsubscribe. Code is ${err.code}, message is ${err.message}`);
      } else {
        log.info('Succeeded in unsubscribing');
        this.subscriber = null;
      }
    })
  }
}