import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_RewardPanel')
export class EMLHJ_RewardPanel extends Component {
  @property(Node)
    btnBack: Node = null;

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
    }


    onBtnBackClick(){
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


