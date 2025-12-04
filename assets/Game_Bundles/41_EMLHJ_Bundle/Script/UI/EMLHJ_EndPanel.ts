import { _decorator, Component, Node } from 'cc';
import { EMLHJ_DataManager } from '../Manager/EMLHJ_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { EMLHJ_GameEvents } from '../Common/EMLHJ_GameEvents';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_EndPanel')
export class EMLHJ_EndPanel extends Component {
  @property(Node)
    btnBack: Node = null;

    @property(Node)
    bgFail: Node = null;

    @property(Node)
    bgSuccess: Node = null;

    @property(Node)
    btnBackToMain: Node = null;

    @property(Node)
    btnRestart: Node = null;

    isAddedEvent: boolean = false;

    protected start(): void {
        if(!this.isAddedEvent){
            this.registerEvents();
            this.isAddedEvent = true;
        }
    }

    
    // 初始化UI
    initUI() {
        if(!this.isAddedEvent){
            this.registerEvents();
            this.isAddedEvent = true;
        }

        if(EMLHJ_DataManager.Instance.isFail){
            this.bgFail.active = true;
            this.bgSuccess.active = false;
        }else{
            this.bgFail.active = false;
            this.bgSuccess.active = true;
        }
    }

    onBtnBackToMainClick(){
        EMLHJ_DataManager.Instance.isFail = false;
        // this.node.active = false;
        EMLHJ_DataManager.Instance.init();
        EMLHJ_DataManager.Instance.setNewDebt();
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        // LBL_DataManager.Instance.destroyInstance();
                        ProjectEventManager.emit(ProjectEvent.返回主页, "恶魔老虎机");
                    })
                });
     
    }

    onBtnRestartClick(){
        EMLHJ_DataManager.Instance.isFail = false;
        this.node.active = false;
        EMLHJ_DataManager.Instance.init();
        EMLHJ_DataManager.Instance.setNewDebt();
        EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_GAMEUI);
        EventManager.Scene.emit(EMLHJ_GameEvents.UI_HIDE_ALL_SCREENS);
        // EventManager.Scene.emit(EMLHJ_GameEvents.UI_HIDE_ALL_SCREENS);
    }

    onBtnBackClick(){
        this.node.active = false;
    }

    // 注册事件监听
    registerEvents() {
        this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        this.btnBackToMain.on(Node.EventType.TOUCH_END, this.onBtnBackToMainClick, this);
        this.btnRestart.on(Node.EventType.TOUCH_END, this.onBtnRestartClick, this);
    }

    // 注销事件监听
    unregisterEvents() {
        // this.btnBack.off(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        // this.btnBackToMain.off(Node.EventType.TOUCH_END, this.onBtnBackToMainClick, this);
        // this.btnRestart.off(Node.EventType.TOUCH_END, this.onBtnRestartClick, this);
    }

    // 注销事件监听
    onDestroy() {
        this.unregisterEvents();
        this.isAddedEvent = false;
    }

}


