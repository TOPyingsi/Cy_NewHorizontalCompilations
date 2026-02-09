import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZGMMT_Constant, SJZGMMT_PropType } from './SJZGMMT_Constant';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import Banner from '../../../Scripts/Banner';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_ShoppingBigBox')
export class SJZGMMT_ShoppingBigBox extends Component {
    public PropName: string = "";//道具名

    public PropState: number = 0;//购买形式（0货币1视频）
    public PropPrice: number = 0;//价格

    start() {

    }


    //初始化展示
    Init(Name: string, State: number = 0) {
        this.PropName = Name;
        this.PropState = State;
        let Propdata = SJZGMMT_Constant.getPropDataByName(Name);
        this.PropPrice = Propdata.price;
        this.node.getChildByName("名字").getComponent(Label).string = Name;
        this.node.getChildByPath("获得方式/钱/金额").getComponent(Label).string = SJZGMMT_Incident.GetMaxNum(this.PropPrice);
        if (State == 0) {
            this.node.getChildByPath("获得方式/钱").active = true;
        } else {
            this.node.getChildByPath("获得方式/视频").active = true;
        }
        let num = Propdata.property;
        switch (Propdata.type) {
            case SJZGMMT_PropType.武器:
                this.node.getChildByPath("属性区/攻击").active = true;
                this.node.getChildByPath("属性区/攻击/数值").getComponent(Label).string = `${num}`;
                break;
            case SJZGMMT_PropType.防具:
                this.node.getChildByPath("属性区/防御").active = true;
                this.node.getChildByPath("属性区/防御/数值").getComponent(Label).string = `${num}`;
                break;
            case SJZGMMT_PropType.头盔:
                this.node.getChildByPath("属性区/生命").active = true;
                this.node.getChildByPath("属性区/生命/数值").getComponent(Label).string = `${num}`;
                break;
        }
        SJZGMMT_UIManager.Instance.GetPropSprite(this.PropName).then((sp: SpriteFrame) => {
            this.node.getChildByName("图").getComponent(Sprite).spriteFrame = sp;
        })

    }
    //点击事件
    OnClick() {
        SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.黑市购买点击);
        if (this.PropState == 0) {//金钱购买
            if (SJZGMMT_GameData.Instance.Money >= this.PropPrice) {
                SJZGMMT_GameData.Instance.ChanggeMoney(-this.PropPrice);
                SJZGMMT_GameData.Instance.pushWarehouseData(this.PropName, 1);
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.ReceiveAwardPanel, [[{ Name: this.PropName, Num: 1 }]]);
            } else {
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.GetCashPanel);
            }
        }
        if (this.PropState == 1) {
            Banner.Instance.ShowVideoAd(() => {
                SJZGMMT_GameData.Instance.pushWarehouseData(this.PropName, 1);
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.ReceiveAwardPanel, [[{ Name: this.PropName, Num: 1 }]]);
            })
        }

    }
}


