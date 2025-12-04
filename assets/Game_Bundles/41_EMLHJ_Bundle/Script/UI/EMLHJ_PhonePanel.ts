import { _decorator, Component, Label, Node } from 'cc';
import { EMLHJ_DataManager } from '../Manager/EMLHJ_DataManager';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_PhonePanel')
export class EMLHJ_PhonePanel extends Component {
  @property(Node)
    btnBack: Node = null;

    @property(Label)
    lblDesc: Label = null;

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

        this.lblDesc.string = EMLHJ_DataManager.Instance.debtsData[EMLHJ_DataManager.Instance.currentDebtNum].endDec;
    }


    onBtnBackClick(){
        EMLHJ_DataManager.Instance.setNewDebt();
        this.node.active = false;
    }

    // 注册事件监听
    registerEvents() {
        this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
    }

    // 注销事件监听
    unregisterEvents() {
        // this.btnBack.off(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
    }

    // 注销事件监听
    onDestroy() {
        this.unregisterEvents();
        this.isAddedEvent = false;
    }

}


