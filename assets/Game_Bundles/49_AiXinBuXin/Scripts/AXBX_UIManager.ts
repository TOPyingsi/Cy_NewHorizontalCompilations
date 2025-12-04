import { _decorator, Component, director, EventTouch, instantiate, Label, Node, Prefab, tween, v3 } from 'cc';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../Scripts/GameManager';
import { AXBX_SelectPanel } from './AXBX_SelectPanel';
import { AXBX_Constant } from './AXBX_Constant';
import { AXBX_GameManager } from './AXBX_GameManager';
import { AXBX_AudioBtn } from './AXBX_AudioBtn';
const { ccclass, property } = _decorator;

@ccclass('AXBX_UIManager')
export class AXBX_UIManager extends Component {
    @property(Prefab)
    AudioClickBtnPre: Prefab = null;
    private static _instance: AXBX_UIManager = null;
    public static get instance(): AXBX_UIManager {
        if (!AXBX_UIManager._instance) {
            AXBX_UIManager._instance = new AXBX_UIManager();
        }
        return AXBX_UIManager._instance;
    }
    protected onLoad(): void {
        AXBX_UIManager._instance = this;
    }
    protected onDestroy(): void {
        AXBX_UIManager._instance.destroy();
    }
    start() {
        director.getScene().on("爱信不信_游戏结束", this.Gameover, this);
    }


    OnButtomClick(btn: EventTouch) {
        switch (btn.target.name) {
            case "返回主页":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "爱信不信");
                    })
                });
                break;
            case "再来一次":
                director.loadScene("AXBX_Game");
                break;
            case "有":
                AXBX_GameManager.instance.Judge(true);
                this.node.getChildByName("判断框").active = false;
                break;
            case "没有":
                AXBX_GameManager.instance.Judge(false);
                this.node.getChildByName("判断框").active = false;
                break;
            case "关闭错误提示栏":
                this.node.getChildByName("错误提示框").active = false;
                AXBX_GameManager.instance.GameStart();
                break;
        }
    }




    //选择栏初始化
    SelectPanelInit() {
        //获取欺诈物品的对应状态
        let array = AXBX_Constant.getAudioDataByPropType(AXBX_GameManager.instance.Fraudulentgoods);
        let array2 = array.map(item => item.音效类型);
        this.node.getChildByName("选择栏").getComponent(AXBX_SelectPanel).Init(array2);
    }
    //展示选择栏
    ShowSelectPanel() {
        this.node.getChildByName("选择提示").active = true;
        this.node.getChildByName("选择栏").active = true;
    }
    //隐藏选择栏
    HideSelectPanel() {
        this.node.getChildByName("选择提示").active = false;
        this.node.getChildByName("选择栏").active = false;
    }

    ShowHP(PlayerHP: number, EnemyHP: number) {
        let nd = this.node.getChildByName("生命值");
        nd.getChildByName("我方").children.forEach((nd: Node, index: number) => {
            nd.children[0].active = PlayerHP > index;
        });
        nd.getChildByName("敌方").children.forEach((nd: Node, index: number) => {
            nd.children[0].active = EnemyHP > index;
        });
    }

    //游戏结束
    Gameover(isWinner: boolean) {
        this.scheduleOnce(() => {
            this.node.getChildByName("结算界面").active = true;
            if (isWinner) {
                this.node.getChildByPath("结算界面/胜利").active = true;
            } else {
                this.node.getChildByPath("结算界面/失败").active = true;
            }
        }, 3)
    }




    OpenText(Text: string, Time: number, callBack?: Function) {
        let nd = this.node.getChildByName("对话框");
        nd.getChildByName("Label").getComponent(Label).string = Text;
        tween(nd)
            .to(0.5, { scale: v3(-1, 1, 1) }, { easing: "backOut" })
            .delay(Time)
            .to(0.5, { scale: v3(0, 0, 0) }, { easing: "backIn" })
            .call(() => {
                if (callBack) callBack();
                this.node.getChildByName("质疑").getComponent(Label).string = "质疑:" + AXBX_GameManager.instance.Fraudulentgoods;
            })
            .start();
    }

    //打开测试界面
    ShowTestPanel() {
        let nd = this.node.getChildByName("错误提示框")
        this.node.getChildByPath("错误提示框/Label").getComponent(Label).string = "对手的实际物品为：" + AXBX_GameManager.instance.AIgoods;
        let Content = nd.getChildByName("Content");
        Content.removeAllChildren();
        //获取欺诈物品的对应状态
        let array = AXBX_Constant.getAudioDataByPropType(AXBX_GameManager.instance.AIgoods);
        let array2 = array.map(item => item.音效类型);
        array2.forEach((element, index) => {
            let btn = instantiate(this.AudioClickBtnPre);
            btn.parent = Content;
            btn.getComponent(AXBX_AudioBtn).Init(element);
        });
        nd.active = true;
        tween(nd)
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: "backOut" })
            .start();
    }

}


