import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { MTRNX_Water_GameDate } from '../MTRNX_Water_GameDate';
import { MTRNX_Water_Shop } from '../Wunit/MTRNX_Water_Shop';
import { MTRNX_Water_EventManager, MTRNX_Water_MyEvent } from '../MTRNX_Water_EventManager';
import { MTRNX_Water_Panel, MTRNX_Water_UIManager } from '../MTRNX_Water_UIManager';
import { MTRNX_Water_Include } from '../MTRNX_Water_Include';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_limitPanel')
export class MTRNX_Water_limitPanel extends Component {
    @property(Node)
    Content: Node = null;

    Show() {
        this.Content.children.forEach((cd) => {
            if (MTRNX_Water_GameDate.Instance.PlayerDate[cd.getComponent(MTRNX_Water_Shop).id] == 1) {
                cd.getChildByName("已拥有").active = true;
            }
        })
        MTRNX_Water_EventManager.on(MTRNX_Water_MyEvent.ChanggeMoney, this.ChanggeMoney, this);
        MTRNX_Water_EventManager.on(MTRNX_Water_MyEvent.ChanggeDebris, this.ChanggeDebris, this);
    }
    protected onDisable(): void {
        MTRNX_Water_EventManager.off(MTRNX_Water_MyEvent.ChanggeMoney);
        MTRNX_Water_EventManager.off(MTRNX_Water_MyEvent.ChanggeDebris);
    }
    protected onEnable(): void {
        this.ChanggeMoney();
        this.ChanggeDebris();
    }
    //金钱被修改
    ChanggeMoney() {
        this.node.getChildByName("科技点").getComponent(Label).string = "科技点：" + MTRNX_Water_GameDate.Instance.Money;
    }
    //碎片
    ChanggeDebris() {
        this.node.getChildByPath("角色碎片/Label").getComponent(Label).string = "X" + MTRNX_Water_GameDate.Instance.Debris;
    }

    OnbuttonClick(btn: EventTouch) {
        switch (btn.target.name) {
            case "抽奖":
                this.ChouJiang(btn.target.parent.getComponent(MTRNX_Water_Shop));
                break;
            case "切换":
                this.Changge(btn.target.parent.getComponent(MTRNX_Water_Shop));
                break;
        }

    }
    ChouJiang(shopdata: MTRNX_Water_Shop) {
        if (MTRNX_Water_GameDate.Instance.PlayerDate[shopdata.id] == 1) {
            MTRNX_Water_UIManager.HopHint("你已经拥有改角色，无法再次获取！");
            return;
        }
        if (MTRNX_Water_GameDate.Instance.Debris >= shopdata.Debris_price) {
            MTRNX_Water_Include.AddDebris(-shopdata.Debris_price, false);
            let num = Math.random() * 100;
            if (num < 10) {
                MTRNX_Water_GameDate.Instance.PlayerDate[shopdata.id] = 1;
                MTRNX_Water_GameDate.DateSave();
                MTRNX_Water_UIManager.HopHint("成功解锁角色!");
            } else {
                MTRNX_Water_UIManager.HopHint("很遗憾!你没有抽中该角色!");
            }
        } else {
            MTRNX_Water_UIManager.HopHint("抽奖需要角色碎片*" + shopdata.Debris_price);
            MTRNX_Water_UIManager.Instance.ShowPanel(MTRNX_Water_Panel.acquireDebrisPanel);
        }
    }
    //点击切换
    Changge(shopdata: MTRNX_Water_Shop) {
        if (MTRNX_Water_GameDate.Instance.PlayerDate[shopdata.id] == 0) {
            MTRNX_Water_UIManager.HopHint("你还没有该角色！");
        } else {
            MTRNX_Water_GameDate.Instance.CurrentSelect = shopdata.id;
            MTRNX_Water_GameDate.DateSave();
            MTRNX_Water_UIManager.HopHint("角色切换成功！");
        }

    }
    //返回
    OnExitClick() {
        MTRNX_Water_UIManager.Instance.HidePanel(MTRNX_Water_Panel.limitPanel);
    }
}


