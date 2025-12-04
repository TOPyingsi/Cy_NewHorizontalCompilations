import { _decorator, Component, Label, Node, random } from 'cc';
import { MTRNX_EventManager, MTRNX_MyEvent } from '../MTRNX_EventManager';
import { MTRNX_GameDate } from '../MTRNX_GameDate';
import { MTRNX_Include } from '../MTRNX_Include';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_LotteryPanel')
export class MTRNX_LotteryPanel extends Component {
    public Maxweight: number = 0;
    public static Data: { Name: string, weight: number }[] = [
        { Name: "科技点*300", weight: 100 },
        { Name: "科技点*500", weight: 60 },
        { Name: "科技点*800", weight: 40 },
        { Name: "科技点*1200", weight: 20 },
        { Name: "角色碎片*20", weight: 100 },
        { Name: "角色碎片*40", weight: 60 },
        { Name: "角色碎片*60", weight: 20 },
        { Name: "三体泰坦", weight: 2 },
        { Name: "地狱泰坦投影人", weight: 2 },
        { Name: "泰坦电脑人战损版", weight: 2 },
        { Name: "地狱泰坦投影人", weight: 2 },
        { Name: "泰坦电钻人", weight: 2 },
        { Name: "泰坦投影人", weight: 2 },
        { Name: "红莲泰坦", weight: 2 },
        { Name: "泰坦火箭人", weight: 2 },
        { Name: "究极泰坦电视人", weight: 1 },
        { Name: "究极泰坦监控人", weight: 1 },
        { Name: "究极泰坦音响人", weight: 1 },
        { Name: "炎刃泰坦音响人", weight: 1 },
    ];
    protected start(): void {
        this.Maxweight = MTRNX_LotteryPanel.Data.reduce((a, b) => { return { Name: "", weight: a.weight + b.weight } }).weight;
    }

    Show() {
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

    //按下抽奖按钮
    OnlotteryClick() {
        if (MTRNX_Include.GetPointIsCan(1000)) {
            MTRNX_Include.AddPoint(-1000, false);
            this.lottery();
        }
    }

    //摇奖
    lottery() {
        let num = Math.random() * this.Maxweight;
        let nownum: number = 0;
        let award: string = MTRNX_LotteryPanel.Data[0].Name;
        for (let i = 0; i < MTRNX_LotteryPanel.Data.length; i++) {
            nownum += MTRNX_LotteryPanel.Data[i].weight;
            if (nownum > num) {
                award = MTRNX_LotteryPanel.Data[i].Name;
                break;
            }
        }
        switch (award) {
            case "科技点*300": MTRNX_Include.AddPoint(300); break;
            case "科技点*500": MTRNX_Include.AddPoint(500); break;
            case "科技点*800": MTRNX_Include.AddPoint(800); break;
            case "科技点*1200": MTRNX_Include.AddPoint(1200); break;
            case "角色碎片*20": MTRNX_Include.AddDebris(20); break;
            case "角色碎片*40": MTRNX_Include.AddDebris(40); break;
            case "角色碎片*60": MTRNX_Include.AddDebris(60); break;
            default: MTRNX_Include.UnlookPlayer(award); break;
        }
    }


    //关闭
    OnExitClick() {
        MTRNX_UIManager.Instance.HidePanel(MTRNX_Panel.LotteryPanel);
    }
}


