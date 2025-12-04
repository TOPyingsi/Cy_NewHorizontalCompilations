import { _decorator, Component, Label, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { HXTJB_GameEvents } from '../Common/HXTJB_GameEvents';
import { HXTJB_DataManager } from '../Manager/HXTJB_DataManager';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_TipPanel')
export class HXTJB_TipPanel extends Component {
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
        this.lblTip.string = HXTJB_DataManager.Instance.Tip;
        this.scheduleOnce(() => {
            this.node.active = false;
        }, 1);
        if(HXTJB_DataManager.Instance.Tip == '余额不足'){

            let ishasSpecialCoins = HXTJB_DataManager.Instance.hasSpecialCoins();

            if(!ishasSpecialCoins &&HXTJB_DataManager.Instance.currentCoins == 0 && 
            HXTJB_DataManager.Instance.currentMoney < HXTJB_DataManager.Instance.roundData[HXTJB_DataManager.Instance.currentRound].MoneyMix &&
            HXTJB_DataManager.Instance.currentScore < HXTJB_DataManager.Instance.roundData[HXTJB_DataManager.Instance.currentRound].tagetScore 
              ){
                this.scheduleOnce(() => {
                    HXTJB_DataManager.Instance.isFail = true;
                    EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_END_PANEL);
                }, 1);
            }
        }
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


