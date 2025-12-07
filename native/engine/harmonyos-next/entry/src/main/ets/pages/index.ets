/****************************************************************************
Copyright (c) 2022-2023 Xiamen Yaji Software Co., Ltd.

http://www.cocos.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated engine source code (the "Software"), a limited,
worldwide, royalty-free, non-assignable, revocable and non-exclusive license
to use Cocos Creator solely to develop games on your target platforms. You shall
not use Cocos Creator software for developing other software or tools that's
used for developing games. You are not granted to publish, distribute,
sublicense, and/or sell copies of Cocos Creator.

The software or tools in this License Agreement are licensed, not sold.
Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 ****************************************************************************/
import nativerender, { context } from 'libcocos.so';

import { WorkerManager } from '../cocos/WorkerManager';
import { ContextType } from '../common/Constants';
import { EditBoxDialog, EditboxShowInfo } from '../components/EditBoxDialog';
import { CocosWebView, WebViewInfo } from '../components/CocosWebView';
import { CocosVideoPlayer, VideoInfo } from '../components/CocosVideoPlayer';
import { MessageEvent } from '@ohos.worker';
import { PortProxy } from '../common/PortProxy';
import { common } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { initWordPort } from '../util/InteractionDemo';
import { loadInterstitialAds, loadRewardAds, setWorkPort } from '../interface/OHOSSDK';
import { BannerAdComponent } from '../kit/adskit/component/BannerAdComponent';
import { HwLogin } from '../kit/gameservicekit/HwLogin';
import { InterstitialAdStatusHandler } from '../kit/adskit/handler/InterstitialAdStatusHandler';
import { AdStatus } from '../kit/adskit/constant/AdStatus';
import Logger from '../common/Logger';
import router from '@ohos.router';
import { window } from '@kit.ArkUI';

// import { router } from '@kit.ArkUI';

const nativePageLifecycle: context = nativerender.getContext(ContextType.JSPAGE_LIFECYCLE);
const engineUtils: context = nativerender.getContext(ContextType.ENGINE_UTILS);
let log: Logger = new Logger(0x0002, "index");

function executeMethodAsync(nativeFunc: Function, funcData: string, funCb: Function): void {
  nativeFunc && nativeFunc(funcData, funCb);
}

function executeMethodSync(nativeFunc: Function, funcData: string): string | boolean | number {
  return nativeFunc && nativeFunc(funcData);
}

function Hide(param: string): string {
  console.log("调用隐私政策Hide() -- index");
  setTimeout(() => {
    router.pushUrl(
      { url: 'pages/WebPage', params: { data: 'privacy' } },
      router.RouterMode.Single)
      .then(() => {
        console.log("跳转成功");
      })
      .catch((err: BusinessError) => {
        // 关键：捕获跳转失败的错误信息
        console.error("跳转失败：", err.message, "错误码：", err.code);
      });
  }, 50); //
  return param;
}

function openVideo(): void {
  console.log("[Ad] 开始加载激励广告");

  new Index().loadAndHandleRewardAd();
}

export { Hide, openVideo }

engineUtils.registerFunction("executeMethodAsync", executeMethodAsync);
engineUtils.registerFunction("executeMethodSync", executeMethodSync);

interface WorkerMessage {
  type: string;
  data: data;
}

interface data {
  id: string,
  name: string,
  param: number | string | param
}

// ?表示 fullScreen 这个属性可以存在，也可以不存在
// 如果存在，它的数据类型必须是 boolean（布尔值）
// 如果不存在，不会报错
interface param {
  tag?: number,
  url?: string,
  contents?: string,
  mimeType?: string,
  encoding?: string,
  baseUrl?: string,
  jsContents?: string,
  x?: number,
  y?: number,
  w?: number,
  h?: number,
  visible?: boolean,
  resourceType?: number,
  time?: number,
  fullScreen?: boolean, // 是否启用全屏模式
  isShowBanner: boolean,
  bannerPosition: string
}

// 2. 定义广告结果类型（与OHOSSDK.ts中的接口对应）
interface InterstitialResp {
  isLoadSuccess: boolean;
  isClickAd: boolean;
}

interface RewardResp {
  isLoadSuccess: boolean;
  isReward: boolean;
  isClickAd: boolean;
}

const workPort: PortProxy = new PortProxy(WorkerManager.getInstance().getWorker());

function loadInterstitialAdsAsync(): void {
  console.log("调用插屏loadInterstitialAdsAsync() -- index");
  //HwAds.loadInterstitialAds(AdConfig.InterstitialAdId)
  // 调用OHOSSDK中封装的插屏广告接口
  loadInterstitialAds("", (retMsg: string) => {
    try {
      // 解析返回结果（与OHOSSDK.ts中的interstitialResp对应）
      const result: InterstitialResp = JSON.parse(retMsg) as InterstitialResp;
      console.log("[Ad] 插屏广告结果：", JSON.stringify(result));

      // 5. 将结果回传给Cocos（与原有通信逻辑一致）
      workPort.postMessage("interstitialAdResult", JSON.stringify(result));
      // 6. 根据结果处理本地逻辑
      if (result.isLoadSuccess) {
        console.log("[Ad] 插屏广告加载成功");
        // 广告加载成功后的操作（如记录日志）
      }
      if (result.isClickAd) {
        console.log("[Ad] 用户点击了插屏广告");
        // 处理点击事件（如跳转落地页统计）
      }
    } catch (err) {
      // ---------------------- 新增：解析异常的失败日志 ----------------------
      // 场景2：JSON解析失败（如retMsg格式错误、为空）
      const error = err as Error;
      console.error(`[Ad] 插屏广告加载失败（解析异常）：${error.message}，原始返回值：${retMsg}`);
      // 异常情况回传Cocos
      workPort.postMessage("interstitialAdResult", JSON.stringify({
        isLoadSuccess: false,
        isClickAd: false
      }));
    }
  });
}

//@State: 装饰的变量成为组件的内部状态，当变量的值发生变化时，会自动触发组件的重新渲染，更新UI
@Entry
@Component
struct Index {
  @State showInfo: EditboxShowInfo = new EditboxShowInfo;
  @State showMessage: string = ''
  @State webViewArray: WebViewInfo[] = [];
  @State videoArray: VideoInfo[] = [];
  @State private bannerVisibilityState: Visibility = Visibility.None;
  @State private bannerPosition: Alignment = Alignment.Bottom;
  private webViewIndexMap: Map<number, number> = new Map<number, number>();
  private videoIndexMap: Map<number, number> = new Map<number, number>();
  private workPort: PortProxy = new PortProxy(WorkerManager.getInstance().getWorker());
  dialogController: CustomDialogController = new CustomDialogController({
    builder: EditBoxDialog({
      showInfo: this.showInfo,
      onTextChange: (msg: string): void => {
        this.showInfo.defaultMessage = msg;
        this.workPort.postMessage('onTextInput', msg);
      },
      accept: (msg: string): void => {
        this.showInfo.defaultMessage = msg;
        this.workPort.postMessage('onComplete', msg);
      },
      confirm: (msg: string): void => {
        this.showInfo.defaultMessage = msg;
        this.workPort.postMessage('onConfirm', msg);
        this.workPort.postMessage('onComplete', msg);
      },
    }),
    cancel: (): void => {
      this.workPort.postMessage('onComplete', this.showInfo.defaultMessage);
    },
    autoCancel: true,
    alignment: DialogAlignment.Bottom,
    customStyle: true,
  })
  private hwLogin: HwLogin = new HwLogin();

  // 4. 单独封装：调用插屏广告并处理结果
  private loadAndHandleInterstitialAd() {
    console.log("[Ad] 开始加载插屏广告");

    // 调用OHOSSDK中封装的插屏广告接口
    loadInterstitialAds("testb4znbuh3n2", (retMsg: string) => {
      try {
        // 解析返回结果（与OHOSSDK.ts中的interstitialResp对应）
        const result: InterstitialResp = JSON.parse(retMsg) as InterstitialResp;
        console.log("[Ad] 插屏广告结果：", JSON.stringify(result));

        // 5. 将结果回传给Cocos（与原有通信逻辑一致）
        this.workPort.postMessage("interstitialAdResult", JSON.stringify(result));

        // 6. 根据结果处理本地逻辑
        if (result.isLoadSuccess) {
          console.log("[Ad] 插屏广告加载成功");
          // 广告加载成功后的操作（如记录日志）
        }
        if (result.isClickAd) {
          console.log("[Ad] 用户点击了插屏广告");
          // 处理点击事件（如跳转落地页统计）
        }
      } catch (err) {
        // ---------------------- 新增：解析异常的失败日志 ----------------------
        // 场景2：JSON解析失败（如retMsg格式错误、为空）
        const error = err as Error;
        console.error(`[Ad] 插屏广告加载失败（解析异常）：${error.message}，原始返回值：${retMsg}`);
        // 异常情况回传Cocos
        this.workPort.postMessage("interstitialAdResult", JSON.stringify({
          isLoadSuccess: false,
          isClickAd: false
        }));
      }
    });
  }

  // 5. 单独封装：调用激励广告并处理结果（如需使用）
  loadAndHandleRewardAd() {
    console.log("[Ad] 开始加载激励广告");

    // 调用OHOSSDK中封装的激励广告接口
    loadRewardAds("testx9dtjwj8hp", (retMsg: string) => {
      try {
        const result: RewardResp = JSON.parse(retMsg) as RewardResp;
        console.log("[Ad] 激励广告结果：", JSON.stringify(result));

        // 回传给Cocos
        this.workPort.postMessage("rewardAdResult", JSON.stringify(result));

        // 处理激励逻辑（如发放奖励）
        if (result.isReward) {
          console.log("[Ad] 用户获得激励，发放奖励");
          // 调用发放奖励的方法（如更新金币、解锁关卡）
          this.grantRewardToUser();
        }
      } catch (err) {
        console.error("[Ad] 解析激励广告结果失败：", (err as Error).message);
        this.workPort.postMessage("rewardAdResult", JSON.stringify({
          isLoadSuccess: false,
          isReward: false,
          isClickAd: false
        }));
      }
    });
  }

  // 发放奖励的示例方法（激励广告专用）
  private grantRewardToUser() {
    // 实际项目中调用发放奖励的逻辑
    this.workPort.postMessage("loadRewardAdsAsyncCallback", "");
  }

  // 跳转到隐私页面
  public static Hide(): void {
    log.info("隐私: Hide()");
    setTimeout(() => {
      router.pushUrl(
        { url: 'pages/WebPage', params: { data: 'privacy' } },
        router.RouterMode.Single)
        .then(() => {
          console.log("跳转成功");
        })
        .catch((err: BusinessError) => {
          // 关键：捕获跳转失败的错误信息
          console.error("跳转失败：", err.message, "错误码：", err.code);
        });
    }, 1000);
  }

  aboutToAppear(): void {
    setWorkPort(this.workPort);
    console.log('[LIFECYCLE-Index] cocos aboutToAppear');
    this.hwLogin.login(getContext() as common.UIAbilityContext).then(() => {
      console.log("hw login success")
      // 登陆成功后会调用这里，如果想通知到cocos脚本中可以在这里添加逻辑
      // 3. 调用插屏广告（示例：登录后加载插屏广告）
      this.loadAndHandleInterstitialAd();

      // 如需调用激励广告，类似写法：this.loadAndHandleRewardAd();
      // this.loadAndHandleRewardAd();

      // 跳转到隐私政策页面(延迟50ms执行跳转，等待页面初始化完成)
      // this.Hide();

    })
    initWordPort(this.workPort) //回调Cocos
    this.workPort._messageHandle = async (e: MessageEvent<WorkerMessage>): Promise<void> => {
      let data: WorkerMessage = e.data;
      let msg = data.data;
      let result: boolean | string | number | null = null;
      console.log('鸿蒙 : msg.name is ' + msg.name)
      switch (msg.name) {
        // EditBox
        case "showEditBox": {
          this.showMessage = msg.param as string;
          this.dialogController.open();
          break;
        }
        case "hideEditBox": {
          this.showInfo.defaultMessage = '';
          this.dialogController.close();
          break;
        }
        // WebView
        case "createWebView": {
          this.webViewArray.push(new WebViewInfo(0, 0, 0, 0, msg.param as number));
          this.webViewIndexMap.set(msg.param as number, this.webViewArray.length - 1);
          break;
        }
        case "removeWebView": {
          if (this.webViewArray.length > 0) {
            this.webViewArray.splice(this.webViewIndexMap.get(msg?.param as number) as number, 1);
          }
          break;
        }
        case "loadUrl": {
          let web = msg.param as param;
          let index = this.webViewIndexMap.get(web?.tag as number) as number;
          this.webViewArray[index].url = web?.url as string;
          this.webViewArray[index].controller.loadUrl(web?.url as string);
          break;
        }
        case "loadHTMLString": {
          let web = msg.param as param;
          let index = this.webViewIndexMap.get(web?.tag as number) as number;
          this.webViewArray[index].controller.loadData(
            web?.contents as string,
            "text/html",
            "UTF-8",
            web?.baseUrl
          );
          break;
        }
        case "loadData": {
          let web = msg.param as param;
          let index = this.webViewIndexMap.get(web?.tag as number) as number;
          this.webViewArray[index].controller.loadData(
            web?.contents as string,
            web?.mimeType as string,
            web?.encoding as string,
            web?.baseUrl as string
          );
          break;
        }
        case "evaluateJS": {
          let web = msg.param as param;
          let index = this.webViewIndexMap.get(web?.tag as number) as number;
          this.webViewArray[index].controller.runJavaScript(web?.jsContents as string);
          break;
        }
        case "reload": {
          let index = this.webViewIndexMap.get(msg.param as number) as number;
          this.webViewArray[index].controller.refresh();
          break;
        }
        case "stopLoading": {
          let index = this.webViewIndexMap.get(msg.param as number) as number;
          this.webViewArray[index].controller.stop();
          break;
        }
        case "canGoForward": {
          let index = this.webViewIndexMap.get(msg.param as number) as number;
          result = this.webViewArray[index].controller.accessForward();
          break;
        }
        case "canGoBack": {
          let index = this.webViewIndexMap.get(msg.param as number) as number;
          result = this.webViewArray[index].controller.accessBackward();
          break;
        }
        case "goForward": {
          let index = this.webViewIndexMap.get(msg.param as number) as number;
          this.webViewArray[index].controller.forward();
          break;
        }
        case "goBack": {
          let index = this.webViewIndexMap.get(msg.param as number) as number;
          this.webViewArray[index].controller.backward();
          break;
        }
        case "setWebViewRect": {
          let web = msg.param as param
          let index = this.webViewIndexMap.get(web?.tag as number) as number;
          this.webViewArray[index].x = px2vp(web?.x as number) as number;
          this.webViewArray[index].y = px2vp(web?.y as number) as number;
          this.webViewArray[index].w = px2vp(web?.w as number) as number;
          this.webViewArray[index].h = px2vp(web?.h as number) as number;
          break;
        }
        case "setVisible": {
          let web = msg.param as param;
          let index = this.webViewIndexMap.get(web?.tag as number) as number;
          this.webViewArray[index].visible = web?.visible as boolean;
          break;
        }
        // video
        case "createVideo": {
          this.videoArray.push(new VideoInfo(0, 0, 0, 0, msg.param as number));
          this.videoIndexMap.set(msg.param as number, this.videoArray.length - 1);
          break;
        }
        case "removeVideo": {
          if (this.videoArray.length > 0) {
            this.videoArray.splice(this.videoIndexMap.get(msg.param as number) as number, 1);
          }
          break;
        }
        case "setVideoUrl":
          let video = msg.param as param;
          let index = this.videoIndexMap.get(video?.tag as number) as number;
          let resourceType = video.resourceType;
          if (resourceType == 1) {
            video.url = 'Resources/' + video.url;
            this.videoArray[index].url = $rawfile(video.url as string);
          } else {
            this.videoArray[index].url = video.url as string;
          }
          break;
        case "setVideoRect": {
          let video = msg.param as param;
          let index = this.videoIndexMap.get(video?.tag as number) as number;
          this.videoArray[index].x = px2vp(video?.x as number) as number;
          this.videoArray[index].y = px2vp(video?.y as number) as number;
          this.videoArray[index].w = px2vp(video?.w as number) as number;
          this.videoArray[index].h = px2vp(video?.h as number) as number;
          break;
        }
        case "startVideo": {
          let index = this.videoIndexMap.get(msg.param as number) as number;
          if (this.videoArray[index].duration) {
            this.videoArray[index].controller.start();
          } else {
            this.videoArray[index].isPreparedStart = true;
          }
          break;
        }
        case "pauseVideo": {
          let index = this.videoIndexMap.get(msg.param as number) as number;
          this.videoArray[index].controller.pause();
          break;
        }
        case "stopVideo": {
          let index = this.videoIndexMap.get(msg.param as number) as number;
          this.videoArray[index].controller.stop();
          break;
        }
        case "resumeVideo": {
          let index = this.videoIndexMap.get(msg.param as number) as number;
          this.videoArray[index].controller.start();
          break;
        }
        case "getVideoDuration": {
          let index = this.videoIndexMap.get(msg.param as number) as number;
          result = this.videoArray[index].duration;
          break;
        }
        case "seekVideoTo": {
          let video = msg.param as param;
          let index = this.videoIndexMap.get(video?.tag as number) as number;
          this.videoArray[index].controller.setCurrentTime(video?.time as number, SeekMode.Accurate);
          break;
        }
        case "setVideoVisible": {
          let video = msg.param as param;
          let index = this.videoIndexMap.get(video?.tag as number) as number;
          this.videoArray[index].visible = video.visible as boolean;
          break;
        }
        case "setFullScreenEnabled": {
          let video = msg.param as param;
          let index = this.videoIndexMap.get(video?.tag as number) as number;
          this.videoArray[index].isFullScreen = video.fullScreen as boolean;
          break;
        }
        case "currentTime": {
          let index = this.videoIndexMap.get(msg.param as number) as number;
          result = this.videoArray[index].currentTime;
          break;
        }
        case "exitGame": {
          this.terminateSelf();
          break;
        }
        case "showBanner": {
          // banner的显示接口
          // 可以通过window.on.postMessage("showBanner", {isShowBanner: true, bannerPositionL 'bottom'}); 来控制banner的显示位置
          let banner = msg.param as param;
          if (banner.isShowBanner != undefined) {
            this.bannerVisibilityState = banner.isShowBanner ? Visibility.Visible : Visibility.None;
          }
          if (banner.bannerPosition) {
            this.bannerPosition = banner.bannerPosition.toLowerCase() == 'top' ? Alignment.Top : Alignment.Bottom;
          }
          break;
        }
        case "loadRewardAdsAsync": {
          /**
           * 异步调用激励广告接口
           * 可以通过window.on.postMessage("loadRewardAdsAsync","");来调用
           * 广告的结果需要通过这种方式来接受,retObject返回的是一个对象
           *  window.loadRewardAdsAsyncCallback = (retObject) => {
           *    console.log(`loadRewardAdsAsyncCallback: ${JSON.stringify(retObject)}`);
           * }
           */
          log.info("Harmony_展示激励广告");
          loadRewardAds(msg.param as string, (retMsg: string) => {
            // 结果发到worker线程,使用cocos.evalstring来返回给cocos脚本
            this.workPort.postMessage("loadRewardAdsAsyncCallback", retMsg);
          })
          break;
        }
        case "loadInterstitialAdsAsync": {
          /**
           * 异步调用插屏接口
           * 可以通过window.oh.postMessage("loadInterstitialAdsAsync","");来调用
           * 广告的结果需要通过这种方式来接受,retObject返回的是一个对象
           * window.loadInterstitialAdsAsyncCallback = (retObject) =>{
           *  console.log(`loadInterstitialAdsAsyncCallback: ${JSON.stringify(retObject)}`);
           * }
           */
          loadInterstitialAds(msg.param as string, (retMsg: string) => {
            // 结果发到worker线程，使用cocos.evalstring来返回给cocos脚本
            this.workPort.postMessage("loadInterstitialAdsAsyncCallback", retMsg);
          })

          break;
        }
        case "Hide": {
          log.info("调用隐私政策");
          this.workPort.postMessage("Hide", "");
          router.pushUrl({ url: 'page/WebPage', params: { data: 'privacy' } }, router.RouterMode.Single);
        }
        case "workerToUiTest": {
          console.log("cocos demo enter ui thread")
          break;
        }
        default: {

        }
      }
      if (result != null || result != undefined) {
        this.workPort.postReturnMessage(data, result);
      }

    }
  }

  aboutToDisappear(): void {
    console.log('[LIFECYCLE-Index] cocos aboutToDisappear');
    //  this.cocosWorker.postMessage({type: "JSPageLifecycle", data: "aboutToAppear"});
    //  nativePageLifecycle.aboutToDisappear();
  }

  onPageShow(): void {
    console.log('[LIFECYCLE-Page] cocos onPageShow');
    nativePageLifecycle.onPageShow();
  }

  onPageHide(): void {
    console.log('[LIFECYCLE-Page] cocos onPageHide');
    nativePageLifecycle.onPageHide();
  }

  onBackPress() {
    // 拦截侧滑,进行弹窗二次确认
    console.log("[LIFECYCLE-Page] cocos onBackPress");
    this.workPort.postMessage("backPress", "");
    AlertDialog.show({
      title: '提示', //弹窗标题
      message: '确定要退出游戏吗?', //弹窗内容
      autoCancel: true, //点击遮障层时,是否关闭弹窗
      alignment: DialogAlignment.Center, //弹窗位置
      offset: { dx: 0, dy: 0 }, //弹窗相对alignment所在位置的偏移量
      primaryButton: {
        //主按钮的文本内容 文本色 按钮背景色和点击回调
        value: '确认', //按钮文字
        action: () => { //按钮回调
          (getContext(this) as common.UIAbilityContext)?.terminateSelf(); //退出当前页面
        },
      },
      secondaryButton: {
        //副按钮的文本内容 文本色 按钮背景色和点击回调
        value: '取消', // 按钮文字
        action: () => { //按钮回调

        },
      },
    });
    // If disable system exit needed, remove comment "return true"
    return true;
  }

  terminateSelf() {
    try {
      (getContext(this) as common.UIAbilityContext).terminateSelf((err: BusinessError) => {
        if (err.code) {
          console.error(`terminateSelf failed, code is ${err.code}, message is ${err.message}`);
          return;
        }
        console.info('terminateSelf succeed');
      });
    } catch (err) {
      let code = (err as BusinessError).code;
      let message = (err as BusinessError).message;
      console.error(`terminateSelf failed, code is ${code}, message is ${message}`);
    }
  }

  build() {
    // 通过stack布局来加载横幅广告
    Stack({ alignContent: this.bannerPosition }) { //堆叠布局:依次堆叠在同一位置
      Flex({
        //弹性布局:子组件会在一条直线（水平或垂直）上按比例分配空间，可自动适应容器大小。
        direction: FlexDirection.Column, //定义 Flex 容器的 主轴方向 为 垂直方向（从上到下）
        alignItems: ItemAlign.Center, //定义子组件在 交叉轴（与主轴垂直的方向）上的对齐方式
        justifyContent: FlexAlign.Center//定义子组件在 主轴 上的对齐方式
      } as FlexOptions) {
        XComponent({ id: 'xcompontId', type: 'surface', libraryname: 'cocos' })
          .onLoad((context) => {
            this.workPort.postMessage("onXCLoad", "XComponent");
          })
          .onDestroy(() => {
            console.log('cocos onDestroy')
          })

        ForEach(this.webViewArray, (item: WebViewInfo) => {
          CocosWebView({ viewInfo: item, workPort: this.workPort })
        }, (item: WebViewInfo): string => item.viewTag.toString())

        ForEach(this.videoArray, (item: VideoInfo) => {
          CocosVideoPlayer({ videoInfo: item, workPort: this.workPort })
        }, (item: VideoInfo): string => item.viewTag.toString())
      }
      .width('100%')
      .height('100%')

      //使用参数来传递状态,用于控制banner的显示与隐藏
      // BannerAdComponent({ visibilityState: this.bannerVisibilityState })
      //   .height(48)

    }
  }
}
