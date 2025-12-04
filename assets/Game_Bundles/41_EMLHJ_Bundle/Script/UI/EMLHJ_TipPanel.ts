import { _decorator, Component, Label, Node } from 'cc';
import { EMLHJ_DataManager } from '../Manager/EMLHJ_DataManager';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_TipPanel')
export class EMLHJ_TipPanel extends Component {
    @property(Label)
    lblTip: Label = null;
 
    protected start(): void {
        // if(!this.isAddedEvent){
        //     this.registerEvents();
        //     this.isAddedEvent = true;
        // }
    }

    
    // 初始化UI
    initUI() {
        // if(!this.isAddedEvent){
        //     this.registerEvents();
        //     this.isAddedEvent = true;
        // }
        this.lblTip.string = EMLHJ_DataManager.Instance.Tip;
        this.scheduleOnce(() => {
            this.node.active = false;
        }, 2);
    }


    

    // 注册事件监听
    registerEvents() {
        // this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        // this.btnBackToMain.on(Node.EventType.TOUCH_END, this.onBtnBackToMainClick, this);
        // this.btnRestart.on(Node.EventType.TOUCH_END, this.onBtnRestartClick, this);
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
        // this.isAddedEvent = false;
    }

}


