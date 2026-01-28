import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZXD_Constant, SJZXD_PropType } from './SJZXD_Constant';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import Banner from '../../../Scripts/Banner';
import { SJZXD_GameData } from './SJZXD_GameData';
import { SJZXD_EventManager } from './SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_ShoppingBox')
export class SJZXD_ShoppingBox extends Component {
    public PropName: string = "";//道具名

    public PropState: number = 0;//购买形式（0货币1视频）
    public PropPrice: number = 0;//价格

    start() {

    }

    private kuanSpriteName: string[] = ["商城底白", "商城底绿", "商城底蓝", "商城底紫", "商城底橙", "商城底红", "商城底炫彩"];
    //初始化展示
    Init(Name: string, State: number = 0) {
        this.PropName = Name;
        this.PropState = State;
        let Propdata = SJZXD_Constant.getPropDataByName(Name);
        this.PropPrice = Propdata.price;
        this.node.getChildByName("名字").getComponent(Label).string = Name;
        this.node.getChildByPath("获得方式/钱/金额").getComponent(Label).string = SJZXD_Incident.GetMaxNum(this.PropPrice);
        if (State == 0) {
            this.node.getChildByPath("获得方式/钱").active = true;
        } else {
            this.node.getChildByPath("获得方式/视频").active = true;
        }
        let num = Propdata.property;
        switch (Propdata.type) {
            case SJZXD_PropType.武器:
                this.node.getChildByPath("属性区/攻击").active = true;
                this.node.getChildByPath("属性区/攻击/数值").getComponent(Label).string = `${num}`;
                break;
            case SJZXD_PropType.防具:
                this.node.getChildByPath("属性区/防御").active = true;
                this.node.getChildByPath("属性区/防御/数值").getComponent(Label).string = `${num}`;
                break;
            case SJZXD_PropType.头盔:
                this.node.getChildByPath("属性区/生命").active = true;
                this.node.getChildByPath("属性区/生命/数值").getComponent(Label).string = `${num}`;
                break;
        }
        SJZXD_UIManager.Instance.GetPropSprite(this.PropName).then((sp: SpriteFrame) => {
            this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
        })
        SJZXD_Incident.LoadSprite(`Sprites/黑市/${this.kuanSpriteName[Propdata.quality]}`).then((sp: SpriteFrame) => {
            this.node.getChildByName("框").getComponent(Sprite).spriteFrame = sp;
        })

    }
    //点击事件
    OnClick() {
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.黑市购买点击);
        if (this.PropState == 0) {
            if (SJZXD_GameData.Instance.Money >= this.PropPrice) {
                SJZXD_GameData.Instance.ChanggeMoney(-this.PropPrice);
                SJZXD_GameData.Instance.pushWarehouseData(this.PropName, 1);
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.ReceiveAwardPanel, [[{ Name: this.PropName, Num: 1 }]]);
            } else {
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.GetCashPanel);
            }
        }
        if (this.PropState == 1) {
            Banner.Instance.ShowVideoAd(() => {
                SJZXD_GameData.Instance.pushWarehouseData(this.PropName, 1);
            })
        }

    }
}


