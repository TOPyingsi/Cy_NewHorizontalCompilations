import { _decorator, Component, director, EventTouch, Label, Node } from 'cc';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_Constant } from './SJZGMMT_Constant';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_GamePanel')
export class SJZGMMT_GamePanel extends Component {

    start() {
        this.leaveTimeText = this.node.getChildByPath("撤离/时间").getComponent(Label);
        director.getScene().on(SJZGMMT_EventManager.攻击模式切换, this.ChanggeAttackMode, this);
        director.getScene().on(SJZGMMT_EventManager.进入撤离点, this.ShowLeaveMessage, this);
        director.getScene().on(SJZGMMT_EventManager.离开撤离点, this.HideLeaveMessage, this);
        if (SJZGMMT_GameData.Instance.GameData[4] == 0) {
            this.node.getChildByName("无敌说明").active = true;
        }
        this.node.active = false;
        director.getScene().on(SJZGMMT_EventManager.主角准备就绪, () => {
            this.node.active = true;
            if (SJZGMMT_GameData.Instance.GameData[4] == 0) {
                SJZGMMT_GameData.Instance.GameData[4] = 1;
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.CoursePanel);
            }
        });
        director.getScene().on(SJZGMMT_EventManager.背包扩容, () => { this.node.getChildByPath("扩充背包").active = false });
    }

    OnButtonClick(event: EventTouch) {
        switch (event.target.name) {
            case "背包":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.KnapsackPanel);
                break;
            case "地图":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.SmallMapPanel);
                break;
            case "返回":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.AdvanceEvacuatePanel);
                break;
            case "撤离卡":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.EvacuatePanel);
                break;
            case "扩充背包":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.AddknapsackCapacityPanel);
                break;
        }
    }


    //改变攻击模式
    ChanggeAttackMode(state: number) {
        this.node.getChildByName("普通攻击键").active = state == 0;
        this.node.getChildByName("摇杆攻击").active = state == 1;
    }
    protected update(dt: number): void {
        if (this.leaveState) {
            this.leaveTime -= dt;
            this.updateLeaveTime();
        }
    }


    //#region 撤离UI相关
    private leaveTime: number = 10;//撤离时间
    private leaveState: boolean = false;//是否在撤离点
    private leaveTimeText: Label = null;//文本
    //显示撤离消息板块
    ShowLeaveMessage() {
        this.leaveState = true;
        this.leaveTime = 10;
        this.node.getChildByName("撤离").active = true;
    }

    //隐藏撤离消息板块
    HideLeaveMessage() {
        this.leaveState = false;
        this.node.getChildByName("撤离").active = false;
    }

    //刷新显示时间以及判断是否撤离
    updateLeaveTime() {
        if (this.leaveTime <= 0) {
            director.getScene().emit(SJZGMMT_EventManager.撤离点时间耗尽);
        } else {
            this.leaveTimeText.string = `${SJZGMMT_Incident.FormatTime(this.leaveTime * 60)}`;
        }
    }
    //#endregion
}


