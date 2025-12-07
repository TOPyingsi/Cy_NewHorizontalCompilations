import Logger from '../../../common/Logger'
import { AdComponent, advertising } from '@kit.AdsKit';
import { display, router } from '@kit.ArkUI';
import { HwAdsManager } from '../HwAdsManager';
import { AdStatus } from '../constant/AdStatus';

let log: Logger = new Logger(0x0002, "SplashAdPage");

/**
 * 开屏广告页
 */
@Entry
@Component
export struct SplashAdPage {
  @State ad: advertising.Advertisement | undefined = undefined;
  private adDisplayOptions: advertising.AdDisplayOptions | undefined = undefined;

  aboutToAppear() {
    // 横屏不展示开屏广告,横屏游戏展示广告会有显示问题,会被审核驳回
    // let orientation = display.getDefaultDisplaySync().orientation;
    // if (orientation == display.Orientation.LANDSCAPE || orientation == display.Orientation.LANDSCAPE_INVERTED) {
    //   this.routerToNextPage();
    //   return;
    // }

    this.adDisplayOptions = HwAdsManager.getInstance().getAdDisplayOptions();
    HwAdsManager.getInstance().loadSplashAds(() => {
      this.routerToNextPage();
    }).then((adsLoaded: Array<advertising.Advertisement> | undefined) => {
      if (adsLoaded) {
        this.ad = adsLoaded[0];
      }
    })
  }

  routerToNextPage() {
    this.getUIContext().getRouter().replaceUrl({
      url: "pages/index"
    }, router.RouterMode.Standard, (err) => {
      if (err) {
        log.error(`Invoke replaceUrl failed,code is ${err.code},message is ${err.message}`);
      }

      log.info(`replace Url: pages/index success`)
    })
  }

  build() {
    RelativeContainer() {
      if (this.ad) {
        AdComponent({
          ads: [this.ad],
          displayOptions: this.adDisplayOptions,
          interactionListener: {
            onStatusChanged: (status: string, ad: advertising.Advertisement, data: string) => {
              switch (status) {
                case AdStatus.AD_OPEN:
                  log.info('Status is onAdOpen');
                  break;
                case AdStatus.AD_CLICKED:
                  log.info('Status is onAdClick');
                  break;
                case AdStatus.AD_CLOSED:
                  log.info('Status is onAdClose');
                  //广告关闭了之后跳转到下一页
                  this.routerToNextPage();
                  break;
              }
            }
          }
        })
          .zIndex(1)
          .width('100%')
          .height('100%')
      }
    }
    .width('100%')
    .height('100%')
  }
}