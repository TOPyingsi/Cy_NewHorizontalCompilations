import { _decorator, Color, Component, Label, Node, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { SJZXD_Constant, SJZXD_PropDataItem, SJZXD_Quality } from './SJZXD_Constant';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import { SJZXD_EventManager } from './SJZXD_EventManager';
import { SJZXD_GameData } from './SJZXD_GameData';
import { SJZXD_GameManager } from './SJZXD_GameManager';
import { SJZXD_PoolManager } from './SJZXD_PoolManager';
import { SJZXD_AudioManager } from './SJZXD_AudioManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_EnhanceBox')
export class SJZXD_EnhanceBox extends Component {
    public Name: string = "";
    public Price: number = 0;//价格

    start() {

    }

    Show(Name: string, Price: number, spirteId: number, description: string) {
        this.Name = Name;
        this.Price = Price;
        this.node.getChildByName("名称").getComponent(Label).string = Name;
        this.node.getChildByName("描述").getComponent(Label).string = description;
        SJZXD_Incident.LoadSprite("Sprites/增强界面/针剂" + spirteId).then((sp: SpriteFrame) => {
            this.node.getChildByName("针剂").getComponent(Sprite).spriteFrame = sp;
        })
        if (Price == 0) {
            this.node.getChildByName("免费获得").active = true;
        } else {
            this.node.getChildByPath("付费获得/价格").getComponent(Label).string = SJZXD_Incident.GetMaxNum(Price);
            this.node.getChildByName("付费获得").active = true;
        }
    }

    OnFreeGet() {
        Banner.Instance.ShowVideoAd(() => {
            SJZXD_GameData.Instance.Enhance = this.Name;
            SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.使用增强针, this.Name);
            SJZXD_UIManager.Instance.ShowText("获得增强效果！");
        })

    }
    OnBuyGet() {
        if (SJZXD_GameData.Instance.Money >= this.Price) {
            SJZXD_GameData.Instance.ChanggeMoney(-this.Price);
            SJZXD_GameData.Instance.Enhance = this.Name;
            SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.使用增强针, this.Name);
            SJZXD_UIManager.Instance.ShowText("获得增强效果！");
        } else {
            SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.GetCashPanel);
        }

    }


}


