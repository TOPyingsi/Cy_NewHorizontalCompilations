import Logger from '../../../common/Logger'
import { display } from '@kit.ArkUI';
import { advertising, AutoAdComponent } from '@kit.AdsKit';
import { HwAdsManager } from '../HwAdsManager';
import { AdStatus } from '../constant/AdStatus';

let log: Logger = new Logger(0x0002, "BannerAdComponent");

/**
 * 横幅Banner组件
 */
@Component
  //标记此类为可复用的 UI 组件
export struct BannerAdComponent {
  // banner默认先不展示出来 , 等加载到了之后再显示出来
  @Link public visibilityState: Visibility; //支持双向修改同步
  private ratio: number = -1;
  private orientation: display.Orientation = display.Orientation.PORTRAIT;
  private adRequestParams: advertising.AdRequestParams | undefined = undefined;
  private adOptions: advertising.AdOptions | undefined = undefined;
  private adDisplayOptions: advertising.AdDisplayOptions | undefined = undefined;
  // private adDisplayOptions: advertising.AdDisplayOptions = {
  //   // 广告轮播的时间间隔，单位ms，取值范围[30000, 120000]
  //   refreshTime: 30000
  // };

  aboutToAppear(): void {
    // 根据横竖屏来确定banner的显示效果,竖屏的话就撑满整个宽度
    this.orientation = display.getDefaultDisplaySync().orientation;
    this.adRequestParams = HwAdsManager.getInstance().getBannerRequest();
    this.adOptions = HwAdsManager.getInstance().getAdOptions();
    this.adDisplayOptions = HwAdsManager.getInstance().getAdDisplayOptions();
    if (this.adRequestParams.adWidth && this.adRequestParams.adHeight) {
      this.ratio = this.adRequestParams.adWidth / this.adRequestParams.adHeight;
    }
  }

  build() {
    AutoAdComponent({
      adParam: this.adRequestParams,
      adOptions: this.adOptions,
      displayOptions: this.adDisplayOptions,
      interactionListener: {
        onStatusChanged: (status: string, ad: advertising.Advertisement, data: string) => {
          switch (status) {
            case AdStatus.AD_OPEN:
              log.info('Status is onAdOpen');
              this.visibilityState = Visibility.Visible;
              break;
            case AdStatus.AD_CLICKED:
              log.info('Status is onAdClick');
              break;
            case AdStatus.AD_CLOSED:
              log.info('Status is onAdClose');
              this.visibilityState = Visibility.None;
              break;
            case AdStatus.AD_LOAD:
              log.info('Status is onAdLoad');
              break;
            case AdStatus.AD_FAIL:
              log.error('Status is onAdFail');
              this.visibilityState = Visibility.None;
              break;
          }
        }
      }
    })
    //当屏幕是竖屏（PORTRAIT 正竖屏 或 PORTRAIT_INVERTED 倒竖屏）时，宽度设为 '100%'
    //否则为横屏,宽度使用 this.adRequestParms?.adWidth（从广告请求参数中获取的宽度，?. 确保参数不存在时不报错）
      .width((this.orientation == display.Orientation.PORTRAIT ||
        this.orientation == display.Orientation.PORTRAIT_INVERTED) ? '100%' : this.adRequestParams?.adWidth)
      .aspectRatio(this.ratio)
      // .visualEffect(this.visibilityState)
      .visibility(this.visibilityState)
  }
}