import { _decorator, Component, Label, Node, tween, UIOpacity } from 'cc';
import { TKJWL_DataManager } from '../Manager/TKJWL_DataManager';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_SuccessTipPanel')
export class TKJWL_SuccessTipPanel extends Component {
    @property(Node)
    btnBack: Node = null;
    protected start(): void {
        // if(!this.isAddedEvent){
        //     this.registerEvents();
        //     this.isAddedEvent = true;
        // }
        this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
    }

    onBtnBackClick(){
        this.node.active = false;
    }

    
    // 初始化UI
    initUI() {
        // if(!this.isAddedEvent){
        //     this.registerEvents();
        //     this.isAddedEvent = true;

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


