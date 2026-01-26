import { _decorator, Component, EventTouch, instantiate, Node, Prefab, tween, Widget } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_Incident } from '../SJZXD_Incident';
import { SJZXD_ShoppingBigBox } from '../SJZXD_ShoppingBigBox';
import { SJZXD_ShoppingBox } from '../SJZXD_ShoppingBox';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_BazaarPanel')
export class SJZXD_BazaarPanel extends PanelBase {
    public BazaarData: string[][] = [
        ["神·霓虹战斧", "神·青龙", "神·猩红射手", "神·启灵流星锤", "神·未来之光", "神·王者之耀"],
        ["科技之刃", "迷彩MP7", "AK47", "QBZ", "狙击步枪", "蓝调", "腐蚀丛林", "异星科技", "未来", "蝰蛇", "毒龙", "大黄蜂", "鎏金M4", "玩具"
            , "电路", "霓虹", "水枪", "极客", "次元战士", "起源", "AWM"
        ],
        ["户外耳机帽", "轻型头盔", "防弹头盔", "MC防弹头盔", "战术头盔", "SAS战术头盔", "MF防爆头盔", "精锐头盔", "AEGIS装甲头盔"],
        ["轻型战术背心", "通用战术背心", "快拆防弹衣", "MC轻型防弹衣", "作战防弹衣", "Gen4作战防弹衣", "MF重型防弹衣", "重型突击防弹衣", "AEGIS防弹装甲"]
    ];//对应index
    public BazaarSmallBox: string[] = ["炫彩框", "普通框", "普通框", "普通框"];
    public BazaarPrice: number[][] = [//售价状态，0为货币1为视屏
        [1, 1, 1, 0, 0, 0, 0],
        [],
        [],
        []
    ];

    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));

    }
    protected start(): void {
        //初始化神话武器
        SJZXD_Incident.Loadprefab("Prefabs/UI/神话武器框").then((data: Prefab) => {
            this.BazaarData[0].forEach((element, index) => {
                let nd = instantiate(data);
                nd.setParent(this.node.getChildByPath("框/神话武器框/Mask/Content"));
                nd.getComponent(SJZXD_ShoppingBigBox).Init(element, this.BazaarPrice[0][index]);
            });
        })
        //初始化其他框
        SJZXD_Incident.Loadprefab("Prefabs/UI/普通商店武器框").then((data: Prefab) => {
            this.BazaarData[1].forEach((element, index) => {
                let nd = instantiate(data);
                nd.setParent(this.node.getChildByPath("框/武器框/Mask/Content"));
                nd.getComponent(SJZXD_ShoppingBox).Init(element, this.BazaarPrice[1][index]);
            });
            this.BazaarData[2].forEach((element, index) => {
                let nd = instantiate(data);
                nd.setParent(this.node.getChildByPath("框/头盔框/Mask/Content"));
                nd.getComponent(SJZXD_ShoppingBox).Init(element, this.BazaarPrice[2][index]);
            });
            this.BazaarData[3].forEach((element, index) => {
                let nd = instantiate(data);
                nd.setParent(this.node.getChildByPath("框/防具框/Mask/Content"));
                nd.getComponent(SJZXD_ShoppingBox).Init(element, this.BazaarPrice[3][index]);
            });
        })
    }
    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.BazaarPanel);
                break;
            case "神话武器":
                this.ChanggeIndex("神话武器框");
                this.TweenPage("神话武器");
                break;
            case "武器":
                this.ChanggeIndex("武器框");
                this.TweenPage("武器");
                break;
            case "头盔":
                this.ChanggeIndex("头盔框");
                this.TweenPage("头盔");
                break;
            case "防具":
                this.ChanggeIndex("防具框");
                this.TweenPage("防具");
                break;

        }
    }

    //切换到对应界面
    ChanggeIndex(Name: string) {
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.黑市切换栏位, Name);
        this.node.getChildByPath("框/神话武器框").active = Name == "神话武器框";
        this.node.getChildByPath("框/武器框").active = Name == "武器框";
        this.node.getChildByPath("框/头盔框").active = Name == "头盔框";
        this.node.getChildByPath("框/防具框").active = Name == "防具框";
    }
    //页签tween
    TweenPage(Name: string) {
        tween(this.node.getChildByPath("框/左栏/选择区/页签选中"))
            .to(0.5, { y: this.node.getChildByPath("框/左栏/选择区/" + Name).y }, { easing: "backOut" })
            .start();
    }
}


