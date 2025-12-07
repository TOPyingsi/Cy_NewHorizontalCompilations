import Logger from '../../common/Logger'
import { common } from '@kit.AbilityKit';
import { gamePlayer } from '@kit.GameServiceKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { JSON } from '@kit.ArkTS';

let log: Logger = new Logger(0x0002, "HuaweiLogin");

export class HwLogin {
  private isLogin: boolean = false;
  private isInit: boolean = false;

  login(context: common.UIAbilityContext): Promise<void> {
    return new Promise((resolve) => {
      if (this.isLogin) {
        log.debug('hw login already login (已经登录)');
        resolve();
        return;
      }

      this.initGamePlayer(context)
        .then(() => {
          let request: gamePlayer.UnionLoginParam = {
            showLoginDialog: false,
            thirdAccountInfos: []
          }
          return gamePlayer.unionLogin(context, request);
        })
        .then((loginResult: gamePlayer.UnionLoginResult) => {
          log.debug(`hw login unionLogin success, LoginResult: ${JSON.stringify(loginResult)}`);
          // 如果需要获取玩家的ID,则可以使用teamPlayerID或者gamePlayerID
          // thirdOpenid为官方账号 , 没有的话就传空
          let request: gamePlayer.ThirdUserInfo = {
            thirdOpenId: ""
          }

          // 调用该接口做未成年人检验
          return gamePlayer.verifyLocalPlayer(context, request);
        })
        .then(() => {
          log.debug('hw login verifyLocalPlayer success (未成年人检测完成)');
          this.isLogin = true;
          resolve();
        })
        .catch((err: BusinessError) => {
          log.error(`hw login failed, the errorCode is ${err.code}, the errorMsg is ${err.message}`)
          // 登录失败后弹框重试登录
          AlertDialog.show({
            title: '登陆失败', // 弹窗标题
            message: '请检查网络后尝试重新登陆', // 弹窗内容
            autoCancel: true, // 点击遮罩层时,是否关闭弹窗
            alignment: DialogAlignment.Center, // 弹窗位置
            gridCount: 6, // 弹窗容器宽度所占栅格数
            offset: { dx: 0, dy: 0 }, //弹唱相对alignment所在位置的偏移量
            onWillDismiss: (() => {
              // 拦截侧滑关闭弹窗
            }),
            primaryButton: {
              //主按钮的文本内容 文本色 按钮背景色和点击回调
              value: '退出游戏', //按钮文字
              action: () => { //按钮回调
                (getContext(this) as common.UIAbilityContext)?.terminateSelf(); //?.  如果前面的上下文对象为 null 或 undefined，则不会执行后面的代码，避免报错。
              },
            },
            secondaryButton: {
              // 副按钮的文字内容 文本色 按钮背景色和点击回调
              value: '重新登陆', // 按钮文字
              action: () => {
                this.login(context).then(() => {
                  resolve();
                });
              },
            }
          })
        })

    })
  }

  private initGamePlayer(context: common.UIAbilityContext): Promise<void> {
    //通过 Promise 机制，判断操作是否已初始化，如果已完成则直接通知成功，避免重复执行初始化逻辑
    return new Promise((resolve, reject) => {
      if (this.isInit) {
        log.debug('hw login already init (已完成初始化)')
        resolve(); //调用它会将 Promise 状态改为「成功」（fulfilled），通知外部操作已完成。
        return;
      }

      //then()指定当前异步操作成功完成后要执行的后续逻辑。
      gamePlayer.init(context).then(() => {
        log.debug('hw login init success (初始化成功)')
        this.isInit = true;
        resolve();
      }).catch((err: BusinessError) => {
        reject(err);
        log.debug(`hw login init failed (初始化失败) err is ${err}`)
      })
    })
  }
}