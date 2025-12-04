import { _decorator, Component, Label, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { EMLHJ_GameEvents } from '../Common/EMLHJ_GameEvents';
import { EMLHJ_DataManager } from '../Manager/EMLHJ_DataManager';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_IconPanel')
export class EMLHJ_IconPanel extends Component {

    @property(Node)
    iconLayout: Node = null;

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
        this.updateIconPanel();
    }

    

    updateIconPanel(){
        if(this.iconLayout){
            for(let i = 0; i < this.iconLayout.children.length; i++){
                let icon = this.iconLayout.children[i];
                let lblProbability = icon.getChildByName('lblProbability').getComponent(Label);
                if(lblProbability){
                     // 修改为百分比显示并保留1位小数
                     lblProbability.string = (EMLHJ_DataManager.Instance.ICONS[i+1].probability ).toFixed(1) + "%";
                }
            }
        }
    }

    onBtnBackClick(){
        this.node.active = false;
    }

    // 注册事件监听
    registerEvents() {
        EventManager.on(EMLHJ_GameEvents.UPDATE_REMAINING, this.updateIconPanel, this);
        this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
    }

    // 注销事件监听
    unregisterEvents() {
        EventManager.off(EMLHJ_GameEvents.UPDATE_REMAINING, this.updateIconPanel, this);
        // this.btnBack.off(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
    }

    


    // 注销事件监听
    onDestroy() {
        this.unregisterEvents();
        this.isAddedEvent = false;
    }

}


