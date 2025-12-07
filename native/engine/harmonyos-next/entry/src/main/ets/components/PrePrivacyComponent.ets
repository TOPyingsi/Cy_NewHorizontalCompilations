import Logger from '../common/Logger'
import { preferences } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';
import { router } from '@kit.ArkUI';

let log: Logger = new Logger(0x0002, "PrePrivacyComponent");

/**
 * 隐私弹窗组件,只有第一次登陆的时候会弹出,后续同意了就不会弹出
 */
@Component
export struct PrePrivacyComponent {
  // public agreeCallback: Function | undefined;
  public agreeCallback: Function = () => {};
  @Link public isAgree: boolean;
  private dataPreferences: preferences.Preferences | undefined = undefined;
  private readonly textHead: string = '隐私保护指引';

  aboutToAppear(): void {
    //通过getPreferencesSync来获取保存的数据
    let options: preferences.Options = { name: 'myStore' };
    this.dataPreferences = preferences.getPreferencesSync(getContext() as common.UIAbilityContext, options);
    this.isAgree = this.dataPreferences?.getSync("isAgree", false) as boolean;
    log.info(`get isAgree: ${this.isAgree}`)
  }

  onClickUserLink() {
    //跳转用户协议链接
    router.pushUrl({ url: 'pages/WebPage', params: { data: 'user' } }, router.RouterMode.Single);
  }

  onClickPrivacyLink() {
    //跳转隐私协议链接
    router.pushUrl({ url: 'pages/WebPage', params: { data: 'privacy' } }, router.RouterMode.Single);
  }

  onClickAgree() {
    log.info('click agree')
    this.dataPreferences?.putSync("isAgree", true);
    this.dataPreferences?.flush((err) => {
      if (err) {
        log.error(`Failed to flush. Code:${err.code},message:${err.message}`);
        return;
      }
      log.info('Succeeded in flushing isAgree to true');
      this.isAgree = true;
      if (this.agreeCallback) {
        this.agreeCallback();
      }
    })
  }

  onClickReject() {
    log.info('click reject');
    (getContext() as common.UIAbilityContext)?.terminateSelf(); //于主动终止当前 UIAbility 组件的运行
  }

  build() {
    if (!this.isAgree) {
      GridRow({
        //网格布局
        columns: {
          xs: 12, //超小屏幕（如手机竖屏）下，总列数为 12 列
          sm: 12, //小屏幕下，总列数为 12 列
          md: 18, //中等屏幕（如平板竖屏）下，总列数为 18 列
          lg: 24, //大屏幕（如平板横屏）下，总列数为 24 列
          xl: 28, //超大屏幕下，总列数为 28 列
          xxl: 32//特大屏幕（如桌面设备）下，总列数为 32 列
        }
      }) {
        GridCol({
          span: 10, //表示当前列占据的列数
          offset: {
            //offset用于设置当前列左侧的偏移列数
            xs: 1,
            sm: 1,
            md: 4,
            lg: 7,
            xl: 9,
            xxl: 11
          }
        }) {
          Column() {
            Text(this.textHead)
              .margin({ top: '15vp' })
              .fontColor(Color.Black)
              .fontSize(18)
            Text() {
              Span('为了更好地保障您的个人权益,再使用前,请您阅读和理解我们的《')
              // Span('用户协议').fontColor(Color.Red).onClick((e) => {
              //   log.info("Click 用户协议");
              //   this.onClickUserLink();
              // })
              // Span('》、《')
              Span('隐私政策').fontColor(Color.Red).onClick((e) => {
                log.info("Click 隐私政策");
                this.onClickPrivacyLink();
              })
              Span('》。如您已详细阅读并同意此协议。请点击"同意"开始游戏。如您拒绝，将无法进入游戏。')
            }
            .margin({
              top: '12vp',
              bottom: '12vp',
              left: '6vp',
              right: '6vp'
            })
            .backgroundColor(Color.White)
            .fontColor(Color.Black)
            .padding('5vp')
            .fontSize(16)

            Row() {
              Column() {
                Button('拒绝', { type: ButtonType.Normal })
                  .width('100vp')
                  .backgroundColor('#737373')
                  .fontColor(Color.White)
                  .fontSize(18)
                  .onClick(() => this.onClickReject())
              }.width('50%')

              Column() {
                Button('同意', { type: ButtonType.Normal })
                  .width('100vp')
                  .backgroundColor('#dd2025')
                  .fontColor(Color.White)
                  .fontSize(18)
                  .onClick(() => this.onClickAgree())
              }.width('50%')
            }
            .margin({ bottom: '15vp' })
          }
          .width('100%')
          .backgroundColor('#ebebeb')
          .justifyContent(FlexAlign.SpaceBetween)
        }
      }
    }
  }

  onBackPress() {
    return false;
  }
}