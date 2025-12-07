import { MetaDataConfig } from "../common/MetaDataConfig";
import { AdStatus } from "../kit/adskit/constant/AdStatus";
import { HwAdsManager } from "../kit/adskit/HwAdsManager";
import { JSON } from "@kit.ArkTS";
import { PortProxy } from "../common/PortProxy";

let isRewardShowing: boolean = false

interface RewardResp {
  //广告是否加载成功
  isLoadSuccess: boolean,

  //是否获取激励成功
  isReward: boolean,

  //广告是否被点击过
  isClickAd: boolean,
}

interface interstitialResp {
  //广告是否加载成功
  isLoadSuccess: boolean,

  //广告是否被点击过
  isClickAd: boolean,
}

let workPort: PortProxy | null = null;

function setWorkPort(_workPort: PortProxy) {
  workPort = _workPort;
}

/**
 * 对Cocos暴露的接口，同步调用，该调用会阻塞游戏线程，但实现方案相对简单；也有异步调用获取激励的接口，可以在项目中搜索：loadRewardAdsAsync，不过方案会复杂一些
 * let ret = jsb.reflection.callStaticMethod(false, "entry/src/main/ets/interface/OHOSSDK", "entry/loadRewardAds", "");
 * 这样子使用，ret返回的是一个string值，需要用JSON.parse解析一下，用于表示是否获取奖励，可以根据需要自行修改接口
 * @param param
 * @param callback
 */
export function loadRewardAds(param: string, callback: Function) {
  console.log("loadRewardAds-展示激励广告");
  isRewardShowing = true;
  let ret: RewardResp = {
    isLoadSuccess: false,
    isReward: false,
    isClickAd: false
  }
  HwAdsManager.getInstance()
    .loadRewardAds(MetaDataConfig.AD_ID_REWARD!,
      (status: string, rewardData: Record<string, string | number> | undefined) => {
        console.log("激励广告: status is " + status)
        // 广告加载失败时返回AD_FAIL,此时可以进行toast
        if (status == AdStatus.AD_FAIL) {
          console.log("激励广告AD_FAIL");
          // workPort?.postMessage("IncentiveReward","");
          callback(JSON.stringify(ret)); //将 ret 转换为 JSON 格式的字符串
        }
        if (status == AdStatus.AD_OPEN) {
          console.log("激励广告加载成功")
          ret.isLoadSuccess = true;
        }
        if (status == AdStatus.AD_REWARDED) {
          console.log("激励广告下发奖励");
          ret.isReward = true;
          workPort?.postMessage("IncentiveReward", "");
        }
        if (status == AdStatus.AD_CLICKED) {
          console.log("激励广告被点击")
          ret.isClickAd = true;
        }

        //关闭广告时会回调这个状态
        if (status == AdStatus.AD_CLOSED) {
          console.log("关闭激励广告");
          callback(JSON.stringify(ret));
          isRewardShowing = false;
        }
      });
}

/**
 * 对Cocos暴露的接口，同步调用，该调用会阻塞游戏线程，但实现方案相对简单；也有异步调用获取插屏的接口，可以在项目中搜索：loadInterstitialAdsAsync，不过方案会复杂一些
 * let ret = jsb.reflection.callStaticMethod(false, "entry/src/main/ets/interface/OHOSSDK", "entry/loadInterstitialAds", "");
 * 这样子使用，ret返回的是一个string值，需要用JSON.parse解析一下，用于表示是否播放完成，可以根据需要自行修改接口
 * @param param
 * @param callback
 */
export function loadInterstitialAds(param: string, callback: Function) {
  let ret: interstitialResp = {
    isLoadSuccess: false,
    isClickAd: false
  }

  //激励播放的时候不弹出插屏,防止两个广告叠加在一起
  if (isRewardShowing) {
    callback(JSON.stringify(ret));
    return;
  }

  HwAdsManager.getInstance().loadInterstitialAds(MetaDataConfig.AD_ID_INTERSTITIAL!, (status: string) => {
    // 广告加载失败时返回AD_FAIL,此时可以进行toast
    if (status == AdStatus.AD_FAIL) {
      callback(JSON.stringify(ret));
    }

    if (status == AdStatus.AD_OPEN) {
      ret.isLoadSuccess = true;
    }

    if (status == AdStatus.AD_CLICKED) {
      ret.isClickAd = true;
    }

    if (status == AdStatus.AD_CLOSED) {
      callback(JSON.stringify(ret));
    }
  })

}

export {
  setWorkPort
}