import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { MTRNX_Shop } from '../Wunit/MTRNX_Shop';
import { MTRNX_GameDate } from '../MTRNX_GameDate';
import { MTRNX_EventManager, MTRNX_MyEvent } from '../MTRNX_EventManager';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';
import { MTRNX_Include } from '../MTRNX_Include';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_SuperShop')
export class MTRNX_SuperShop extends Component {
    @property(Node)
    Content: Node = null;
    protected start(): void {

    }
    Show() {
        this.Content.children.forEach((cd) => {
            if (MTRNX_GameDate.Instance.PlayerDate[cd.getComponent(MTRNX_Shop).id] == 1) {
                cd.getChildByName("已拥有").active = true;
            }
        })
        MTRNX_EventManager.on(MTRNX_MyEvent.ChanggeMoney, this.ChanggeMoney, this);
        MTRNX_EventManager.on(MTRNX_MyEvent.ChanggeDebris, this.ChanggeDebris, this);
    }
    protected onDisable(): void {
        MTRNX_EventManager.off(MTRNX_MyEvent.ChanggeMoney);
        MTRNX_EventManager.off(MTRNX_MyEvent.ChanggeDebris);
    }
    protected onEnable(): void {
        this.ChanggeMoney();
        this.ChanggeDebris();
    }
    //金钱被修改
    ChanggeMoney() {
        this.node.getChildByName("科技点").getComponent(Label).string = "科技点：" + MTRNX_GameDate.Instance.Money;
    }
    //碎片
    ChanggeDebris() {
        this.node.getChildByPath("角色碎片/Label").getComponent(Label).string = "X" + MTRNX_GameDate.Instance.Debris;
    }
    //返回
    OnExitClick() {
        MTRNX_UIManager.Instance.HidePanel(MTRNX_Panel.SuperShop);
    }

    OnbuttonClick(btn: EventTouch) {
        switch (btn.target.name) {
            case "购买":
                this.Buy(btn.target.parent.getComponent(MTRNX_Shop));
                break;
            case "切换":
                this.Changge(btn.target.parent.getComponent(MTRNX_Shop));
                break;
            case "碎片解锁":
                this.Buy_Debris(btn.target.parent.getComponent(MTRNX_Shop));
                break;
        }

    }


    //点击购买
    Buy(shopdata: MTRNX_Shop) {
        if (MTRNX_GameDate.Instance.PlayerDate[shopdata.id] == 0) {
            if (MTRNX_GameDate.Instance.Money >= shopdata.Point_price) {
                MTRNX_GameDate.Instance.PlayerDate[shopdata.id] = 1;
                MTRNX_Include.AddPoint(-shopdata.Point_price, false);
                this.Show();
            } else {
                MTRNX_UIManager.HopHint("科技点数不足！需要科技点*" + shopdata.Point_price);
            }
        } else {
            MTRNX_UIManager.HopHint("你已经拥有改单位了！");
        }
    }
    //点击切换
    Changge(shopdata: MTRNX_Shop) {
        if (MTRNX_GameDate.Instance.PlayerDate[shopdata.id] == 0) {
            MTRNX_UIManager.HopHint("你还没有该角色！");
        } else {
            MTRNX_GameDate.Instance.CurrentSelect = shopdata.id;
            MTRNX_GameDate.DateSave();
            MTRNX_UIManager.HopHint("角色切换成功！");
        }

    }
    //碎片解锁
    Buy_Debris(shopdata: MTRNX_Shop) {
        if (MTRNX_GameDate.Instance.PlayerDate[shopdata.id] == 0) {
            if (MTRNX_GameDate.Instance.Debris >= shopdata.Debris_price) {
                MTRNX_GameDate.Instance.PlayerDate[shopdata.id] = 1;
                MTRNX_Include.AddDebris(-shopdata.Debris_price, false);
                this.Show();
            } else {
                MTRNX_UIManager.HopHint("角色碎片不足！需要角色碎片*" + shopdata.Debris_price);
            }
        } else {
            MTRNX_UIManager.HopHint("你已经拥有改单位了！");
        }
    }
}


