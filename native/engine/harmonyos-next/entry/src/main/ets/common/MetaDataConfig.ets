import Logger from "./Logger";
import { bundleManager } from "@kit.AbilityKit";


let log: Logger = new Logger(0x0002, "MetaDataConfig");

/**
 * 配置项读取类,可以从module.json5中读取到metadata中配置的配置项
 */
export class MetaDataConfig {
  // 广告奖励的ID，类型为字符串或undefined，初始值为undefined
  static AD_ID_REWARD: string | undefined = undefined;
  static AD_ID_INTERSTITIAL: string | undefined = undefined;
  static AD_ID_SPLASH: string | undefined = undefined;
  static AD_ID_BANNER: string | undefined = undefined;
  static USER_AGREEMENT_URL: string | undefined = undefined;
  static PRIVACY_URL: string | undefined = undefined;

  static async init(){
    try {
      // 获取当前应用的bundle信息，包含应用和元数据
      let bundleInfo =
        await bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION |
        bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_METADATA);
      // 从bundle信息中获取元数据数组
      let metadataArr = bundleInfo.appInfo.metadataArray;
      for (let i = 0; i < metadataArr.length; i++) {
        if (metadataArr[i].moduleName != "entry") { // 如果当前元数据的模块名称不是"entry"，则跳过当前循环
          continue;
        }
        for (let j = 0; j < metadataArr[i].metadata.length; j++) {
          if (metadataArr[i].metadata[j].name == "ad_id_reward") {
            MetaDataConfig.AD_ID_REWARD = metadataArr[i].metadata[j].value;
            log.debug(`set MetaDataConfig.AD_ID_REWARD: ${MetaDataConfig.AD_ID_REWARD}`);
          } else if (metadataArr[i].metadata[j].name == "ad_id_interstitial") {
            MetaDataConfig.AD_ID_INTERSTITIAL = metadataArr[i].metadata[j].value;
            log.debug(`set MetaDataConfig.AD_ID_INTERSTITIAL: ${MetaDataConfig.AD_ID_INTERSTITIAL}`);
          } else if (metadataArr[i].metadata[j].name == "ad_id_splash") {
            MetaDataConfig.AD_ID_SPLASH = metadataArr[i].metadata[j].value;
            log.debug(`set MetaDataConfig.AD_ID_SPLASH: ${MetaDataConfig.AD_ID_SPLASH}`);
          } else if (metadataArr[i].metadata[j].name == "ad_id_banner") {
            MetaDataConfig.AD_ID_BANNER = metadataArr[i].metadata[j].value;
            log.debug(`set MetaDataConfig.AD_ID_BANNER: ${MetaDataConfig.AD_ID_BANNER}`);
          } else if (metadataArr[i].metadata[j].name == "privacy_url") {
            MetaDataConfig.PRIVACY_URL = metadataArr[i].metadata[j].value;
            log.debug(`set MetaDataConfig.PRIVACY_URL: ${MetaDataConfig.PRIVACY_URL}`);
          } else if (metadataArr[i].metadata[j].name == "user_agreement_url") {
            MetaDataConfig.USER_AGREEMENT_URL = metadataArr[i].metadata[j].value;
            log.debug(`set MetaDataConfig.USER_AGREEMENT_URL: ${MetaDataConfig.USER_AGREEMENT_URL}`);
          }
        }
      }
      log.debug("MetaDataConfig init");
      log.debug(`-> MetaDataConfig.AD_ID_REWARD: ${MetaDataConfig.AD_ID_REWARD}`);
      log.debug(`-> MetaDataConfig.AD_ID_INTERSTITIAL: ${MetaDataConfig.AD_ID_INTERSTITIAL}`);
      log.debug(`-> MetaDataConfig.AD_ID_SPLASH: ${MetaDataConfig.AD_ID_SPLASH}`);
      log.debug(`-> MetaDataConfig.AD_ID_BANNER: ${MetaDataConfig.AD_ID_BANNER}`);
      log.debug(`-> MetaDataConfig.USER_AGREEMENT_URL: ${MetaDataConfig.USER_AGREEMENT_URL}`);
      log.debug(`-> MetaDataConfig.PRIVACY_URL: ${MetaDataConfig.PRIVACY_URL}`);
    }catch (err){
      log.error('Failed to read config file: ',err)
    }
    
  }

}