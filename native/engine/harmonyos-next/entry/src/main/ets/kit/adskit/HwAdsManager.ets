import { common } from "@kit.AbilityKit";
import { HwAds } from "./HwAds";

/**
 * 对外封装的广告接口 , 可以统一访问
 */
export class HwAdsManager {
  private static hwAds: HwAds | undefined = undefined;

  public static init(context: common.UIAbilityContext){
    if (HwAdsManager.hwAds) {
      return;
    }

    HwAdsManager.hwAds = new HwAds(context);
  }

  public static getInstance(): HwAds{
    if (HwAdsManager.hwAds) {
      return HwAdsManager.hwAds;
    }

    HwAdsManager.hwAds = new HwAds(getContext() as common.UIAbilityContext);
    return HwAdsManager.hwAds;
  }
}