import { _decorator, Component, Label, Node, tween, UIOpacity } from 'cc';
import { TKJWL_DataManager } from '../Manager/TKJWL_DataManager';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_TipPanel')
export class TKJWL_TipPanel extends Component {
    @property(Label)
    lblTip: Label = null;
    @property(Label)
    lblTip2: Label = null;

    @property(Node)
    taskTip: Node = null;
 
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
        this.lblTip.string = TKJWL_DataManager.Instance.Tip;
        this.lblTip2.string = TKJWL_DataManager.Instance.Tip;
        this.lblTip.color = TKJWL_DataManager.Instance.tipColor;
        this.lblTip2.color = TKJWL_DataManager.Instance.tipColor;

        let opacity = this.taskTip.getComponent(UIOpacity);
        opacity.opacity = 0;
        this.taskTip.active = true;
        tween(opacity)
            .to(0.2, { opacity: 255 })
            .call(()=>{
            })
            .delay(2)
            .to(0.2, { opacity: 0 })
            .start();
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


