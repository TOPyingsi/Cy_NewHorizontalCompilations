import { _decorator, Color, Component, Label, Node, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { SJZGMMT_Constant, SJZGMMT_PropDataItem, SJZGMMT_Quality } from './SJZGMMT_Constant';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_GameManager } from './SJZGMMT_GameManager';
import { SJZGMMT_PoolManager } from './SJZGMMT_PoolManager';
import { SJZGMMT_AudioManager } from './SJZGMMT_AudioManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_EnhanceBox')
export class SJZGMMT_EnhanceBox extends Component {
    public Name: string = "";
    public Price: number = 0;//价格

    start() {

    }

    Show(Name: string, Price: number, spirteId: number, description: string) {
        this.Name = Name;
        this.Price = Price;
        this.node.getChildByName("名称").getComponent(Label).string = Name;
        this.node.getChildByName("描述").getComponent(Label).string = description;
        SJZGMMT_Incident.LoadSprite("Sprites/增强界面/针剂" + spirteId).then((sp: SpriteFrame) => {
            this.node.getChildByName("针剂").getComponent(Sprite).spriteFrame = sp;
        })
        if (Price == 0) {
            this.node.getChildByName("免费获得").active = true;
        } else {
            this.node.getChildByPath("付费获得/价格").getComponent(Label).string = SJZGMMT_Incident.GetMaxNum(Price);
            this.node.getChildByName("付费获得").active = true;
        }
    }
    OnFreeGet() {
        Banner.Instance.ShowVideoAd(() => {
            SJZGMMT_GameData.Instance.Enhance = this.Name;
            SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.使用增强针, this.Name);
            SJZGMMT_UIManager.Instance.ShowText("获得增强效果！");
        })
    }
    OnBuyGet() {
        if (SJZGMMT_GameData.Instance.Money >= this.Price) {
            SJZGMMT_GameData.Instance.ChanggeMoney(-this.Price);
            SJZGMMT_GameData.Instance.Enhance = this.Name;
            SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.使用增强针, this.Name);
            SJZGMMT_UIManager.Instance.ShowText("获得增强效果！");
        } else {
            SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.GetCashPanel);
        }
    }
}


