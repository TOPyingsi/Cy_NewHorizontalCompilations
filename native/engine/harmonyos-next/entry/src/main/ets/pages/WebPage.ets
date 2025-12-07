import Logger from '../common/Logger'
import { webview } from '@kit.ArkWeb';
import { router } from '@kit.ArkUI';
import { MetaDataConfig } from '../common/MetaDataConfig';

let log: Logger = new Logger(0x0002, "WebPage")

interface WebPageParam {
  data?: string;
}

/**
 * 用于隐私用户页的展示
 */
  // 标记一个组件为应用的入口组件（根组件），即应用启动时第一个渲染的组件。必须与 @Component 配合使用（
@Entry
  // 标记一个类为可复用的 UI 组件，是构建页面的基础单元。
@Component
struct WebPage {
  @State url: string | undefined = undefined; //设置为私有
  webController: webview.WebviewController = new webview.WebviewController();

  onPageShow() {
    let params = router.getParams();
    const param = (params as WebPageParam).data;
    log.info(`onPageShow with param %${param}`)
    if (param == "user") {
      this.url = MetaDataConfig.USER_AGREEMENT_URL;
    }else if(param == "privacy"){
      this.url = MetaDataConfig.PRIVACY_URL;
    }
    log.info(`Url地址是: ${this.url}`)
  }

  build() {
    Column(){
      if (this.url != undefined){
        Row(){
          Button({type: ButtonType.Normal}){//Normal：普通按钮（默认类型），样式简洁，通常用于常规操作。
            Image($r("app.media.web_btn_back"))
              .width('35vp')
              .height('35vp')
          }
          .margin({left:'12vp'})
          .backgroundColor('#434343')
          .onClick(() => router.back())
        }
        .height('35vp')
        .width('100%')
        .backgroundColor('#434343')
        .justifyContent(FlexAlign.SpaceBetween)//<-- 左间距为0 --> <-- 中间间距相等 --> <-- 右间距为0 -->

        Row(){
          Web({
            src: this.url,
            controller: this.webController
          }).domStorageAccess(true)
            .height('100%')
            .width('100%')
            .visibility(Visibility.Visible)
        }
        .width('100%')
        .height('95%')
        .justifyContent(FlexAlign.Center) // 主轴居中
        .alignItems(VerticalAlign.Top) //交叉轴:垂直方向顶部对齐
      }
    }
    .justifyContent(FlexAlign.SpaceBetween)
    .width('100%')
    .height('100%')
  }
}