import { _decorator, Component, director, Node, PhysicsSystem, tween, UIOpacity, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { TKJWL_GameEvents } from '../Common/TKJWL_GameEvents';
import { TKJWL_DataManager } from '../Manager/TKJWL_DataManager';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_EndPanel')
export class TKJWL_EndPanel extends Component {
//   @property(Node)
//     btnBack: Node = null;

    @property(Node)
    bgFail: Node = null;

    @property(Node)
    bgSuccess: Node = null;


    @property(Node)
    btnBackToMain: Node = null;
    @property(Node)
    btnBackToMai2: Node = null;

    @property(Node)
    btnRestart: Node = null;
    @property(Node)
    btnRestart2: Node = null;
    @property(Node)
    btnShowSuccessTip: Node = null;

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

        if(TKJWL_DataManager.Instance.isFail){
            let opacityCom = this.bgFail.getComponent(UIOpacity);
            opacityCom.opacity = 0;
            tween(opacityCom)
            .to(1, { opacity: 255 })
            .start();
            this.bgFail.active = true;
            this.bgSuccess.active = false;
        }else{
            let opacityCom = this.bgSuccess.getComponent(UIOpacity);
            opacityCom.opacity = 0;
            tween(opacityCom)
            .to(1, { opacity: 255 })
            .start();
            this.bgFail.active = false;
            this.bgSuccess.active = true;
        }
    }

    onBtnBackToMainClick(){
        TKJWL_DataManager.Instance.isFail = false;
        PhysicsSystem.instance.gravity = new Vec3(0, -80, 0);

        // this.node.active = false;
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                // LBL_DataManager.Instance.destroyInstance();
                ProjectEventManager.emit(ProjectEvent.返回主页, "他看见我了");
            })
        });
     
    }

    onBtnRestartClick(){
        director.loadScene("TKJWL_Start");
    }

    onBtnBackClick(){
        this.node.active = false;
    }

    onBtnShowSuccessTipClick(){
        Banner.Instance.ShowVideoAd(() => {
            EventManager.Scene.emit(TKJWL_GameEvents.UI_SHOW_SUCCESS_TIP_PANEL);
        });
    }

    

    // 注册事件监听
    registerEvents() {
        // this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        this.btnBackToMain.on(Node.EventType.TOUCH_END, this.onBtnBackToMainClick, this);
        this.btnRestart.on(Node.EventType.TOUCH_END, this.onBtnRestartClick, this);
        this.btnBackToMai2.on(Node.EventType.TOUCH_END, this.onBtnBackToMainClick, this);
        this.btnRestart2.on(Node.EventType.TOUCH_END, this.onBtnRestartClick, this);
        this.btnShowSuccessTip.on(Node.EventType.TOUCH_END, this.onBtnShowSuccessTipClick, this);
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


