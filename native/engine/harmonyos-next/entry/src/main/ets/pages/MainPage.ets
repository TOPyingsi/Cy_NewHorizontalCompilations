import Logger from '../common/Logger'
import { display, PromptAction, router } from '@kit.ArkUI';
import { TimeOutHandler } from '../common/TimeOutHandler';
import { PrePrivacyComponent } from '../components/PrePrivacyComponent';
import { Constants } from '../common/Constants';

let log: Logger = new Logger(0x0002, "MainPage");

/**
 * 首页,展示适龄提示 健康忠告 隐私用户协议等
 */
@Entry
export struct MainPage {
  private promptAction: PromptAction | undefined = undefined;
  private timeoutHandler: TimeOutHandler | undefined = undefined;
  private orientation: display.Orientation = display.Orientation.PORTRAIT;
  @State private isAgree: boolean = false;

  aboutToAppear() { //组件的生命周期回调方法，用于在组件即将显示（渲染）到界面之前执行一些初始化操作
    this.promptAction = this.getUIContext().getPromptAction();
    this.orientation = display.getDefaultDisplaySync().orientation;
  }

  onPageShow(): void { //当页面被展示到用户面前时触发
    this.resetTimeOut();
  }

  onPageHide(): void {
    if (this.isAgree) {
      this.timeoutHandler?.clear();
    }
  }

  showAgeRate(): void {
    this.timeoutHandler?.clear();
    this.promptAction!.showDialog({
      title: '适龄提醒',
      message: $r('app.string.age_rate'),
      buttons: [
        {
          text: '关闭',
          color: '#000000'
        }
      ]
    }, (err, data) => {
      if (err) {
        console.error('showDialog err: ' + err)
      }
      console.info('showDialog success callback,click button: ' + data.index);
      this.resetTimeOut();
    })
  }

  onClickUserLink() {
    router.pushUrl({ url: 'page/WebPage', params: { data: 'user' } }, router.RouterMode.Single);
  }

  onClickPrivacyLink() {
    router.pushUrl({ url: 'page/WebPage', params: { data: 'privacy' } }, router.RouterMode.Single);
  }

  resetTimeOut() {
    // 用户同意了之后,暂停2秒,然后跳转到下一页
    if (this.isAgree) {
      this.timeoutHandler = new TimeOutHandler(() => {
        this.getUIContext().getRouter().replaceUrl({//pushUrl:保留当前page  replaceUrl:跳转并销毁
          url: "kit/adskit/page/SplashAdPage"
        }, router.RouterMode.Standard, (err) => {
          if (err) {
            log.error(`Invoke replaceUrl failed, code is ${err.code}, message is ${err.message}`);
          }
          log.info(`replace Url: kit/adskit/page/SplashAdPage success`)
        })
      }, 2000)
    }
  }

  build() {
    Stack() {
      Stack({ alignContent: Alignment.TopStart }) {
        Image($r("app.media.privacy_background"))
          .objectFit(ImageFit.Cover)

        GridRow({ columns: 8 }) {
          GridCol({ span: 1 }) {
            Button({ type: ButtonType.Normal }) {
              Image($r(Constants.HEALTHADVICE))
                .width('50vp')
            }
            .backgroundColor(Color.Transparent)
            .margin({ left: '12vp', top: '12vp' })
            .onClick(() => this.showAgeRate())
          }.height("25%")

          GridCol({ span: 7 }) {
          }

          GridCol({ span: 6, offset: 1 }) {
            Text('健康游戏忠告').fontWeight(FontWeight.Bold).fontSize(20).fontColor($r("app.color.loading_font"))
              .textAlign(TextAlign.Center)
          }.height("10%")

          // GridCol({ span: 2 }) {
          // }

          GridCol({ span: 9, offset: 1 }) {
            Column({ space: '12vp' }) {
              Text('抵制不良游戏，拒绝盗版游戏。').fontWeight(FontWeight.Bold).fontColor($r("app.color.loading_font"))
              Text('注意自我保护，谨防受骗上当。').fontWeight(FontWeight.Bold).fontColor($r("app.color.loading_font"))
              Text('适度游戏益脑，沉迷游戏伤身。').fontWeight(FontWeight.Bold).fontColor($r("app.color.loading_font"))
              Text('合理安排时间，享受健康生活。').fontWeight(FontWeight.Bold).fontColor($r("app.color.loading_font"))
            }
          }.height("25%")

          GridCol({ span: 1 }) {
          }

          GridCol({ span: 8, offset: 1 }) {
            Column() {
              Text() {
                // Span('《用户协议》').fontWeight(FontWeight.Bold).fontColor(Color.Blue).onClick((e) => {
                //   log.info("Click 用户协议");
                //   this.onClickUserLink();
                // })
                // Span('和').fontWeight(FontWeight.Bold).fontColor($r("app.color.loading_font"))
                // Span('《隐私政策》').fontWeight(FontWeight.Bold).fontColor(Color.Blue).onClick((e) => {
                //   log.info("Click 隐私政策");
                //   this.onClickPrivacyLink();
                // })
              }

              if (this.orientation == display.Orientation.PORTRAIT ||
                this.orientation == display.Orientation.PORTRAIT_INVERTED) {
                Row() {
                  Text('著作权人：').fontWeight(FontWeight.Bold).fontColor($r("app.color.loading_font"))
                  Text($r('app.string.copyright_owner'))
                    .fontWeight(FontWeight.Bold)
                    .fontColor($r("app.color.loading_font"))
                }

                Row() {
                  Text('软著认证号：').fontWeight(FontWeight.Bold).fontColor($r("app.color.loading_font"))
                  Text($r('app.string.softCopyright_registration_numer'))
                    .fontWeight(FontWeight.Bold)
                    .fontColor($r("app.color.loading_font"))
                }
              } else {
                Row() {
                  Text('著作权人：').fontWeight(FontWeight.Bold).fontColor($r("app.color.loading_font"))
                  Text($r('app.string.copyright_owner'))
                    .fontWeight(FontWeight.Bold)
                    .fontColor($r("app.color.loading_font"))
                  Text(' 软著认证号：').fontWeight(FontWeight.Bold).fontColor($r("app.color.loading_font"))
                  Text($r('app.string.softCopyright_registration_numer'))
                    .fontWeight(FontWeight.Bold)
                    .fontColor($r("app.color.loading_font"))
                }.margin({ top: '10vp' })
              }
            }
          }
          .margin({ top: '60vp' })

        }.width('100%')
        .height('100%')
      }
      // 隐私协议指引Dialog
      PrePrivacyComponent({
        isAgree: this.isAgree, agreeCallback: () => {
          this.resetTimeOut();
        }
      })

    }
  }
}

