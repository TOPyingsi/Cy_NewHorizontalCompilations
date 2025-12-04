import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { HXTJB_GameEvents } from '../Common/HXTJB_GameEvents';
import { HXTJB_DataManager } from '../Manager/HXTJB_DataManager';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_EndPanel')
export class HXTJB_EndPanel extends Component {
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

        if(HXTJB_DataManager.Instance.isFail){
            this.bgFail.active = true;
            this.bgSuccess.active = false;
        }else{
            this.bgFail.active = false;
            this.bgSuccess.active = true;
        }
    }

    onBtnBackToMainClick(){
        // HXTJB_DataManager.Instance.isFail = false;
        // this.node.active = false;
        EventManager.Scene.emit(HXTJB_GameEvents.RESTART_GAME); 
        HXTJB_DataManager.Instance.isEndTutorial = false;
        // HXTJB_DataManager.Instance.setNewRound();
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        // LBL_DataManager.Instance.destroyInstance();
                        ProjectEventManager.emit(ProjectEvent.返回主页, "狼伴侣");
                    })
                });
     
    }

    onBtnRestartClick(){
        // HXTJB_DataManager.Instance.isFail = false;
        this.node.active = false;
        EventManager.Scene.emit(HXTJB_GameEvents.RESTART_GAME); 

        EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_GAMEUI);
        EventManager.Scene.emit(HXTJB_GameEvents.UI_HIDE_ALL_SCREENS);
    }

    // onBtnBackClick(){
    //     this.node.active = false;
    // }

    // 注册事件监听
    registerEvents() {
        // this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
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


