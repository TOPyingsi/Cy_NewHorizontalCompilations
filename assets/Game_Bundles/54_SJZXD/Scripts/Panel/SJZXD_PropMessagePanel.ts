import { _decorator, Component, EventTouch, Label, Node, Slider, Sprite, SpriteFrame, tween } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_Constant, SJZXD_PropType } from '../SJZXD_Constant';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_GameData } from '../SJZXD_GameData';
import { SJZXD_Incident } from '../SJZXD_Incident';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_PropMessagePanel')
export class SJZXD_PropMessagePanel extends PanelBase {
    private PropName: string = "";//道具名
    private PropNum: number = 0;//道具拥有数量
    private _SelectPropNum: number = 0;//选中道具数量
    private PropPrice: number = 0;//道具单价

    private _numericalvalueSprite: Sprite = null;//装备数值进度条
    private _numericalMaxvalue: number = 0;//装备数值进度条最大值

    private slider: Slider = null;
    protected onLoad(): void {
        this.slider = this.node.getChildByPath("框/Content/出售区/Slider").getComponent(Slider);
    }
    //参数0道具名
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.Init(args[0]);
        this._SelectPropNum = 1;
        this.ChanggeSelectNum();
    }


    //初始化
    Init(Name: string) {
        this.PropName = Name;
        let data = SJZXD_Constant.getPropDataByName(this.PropName);
        this.PropNum = SJZXD_GameData.Instance.getWarehouseNum(this.PropName);
        this.PropPrice = data.price;
        SJZXD_UIManager.Instance.GetPropSprite(this.PropName).then((sp: SpriteFrame) => {
            this.node.getChildByPath("框/小图框/小图").getComponent(Sprite).spriteFrame = sp;
        })
        let Quality = SJZXD_Constant.QuaLityList[data.quality];
        SJZXD_Incident.LoadSprite("Sprites/仓库/" + Quality).then((sp: SpriteFrame) => {
            this.node.getChildByPath("框/小图框").getComponent(Sprite).spriteFrame = sp;
        })
        this.node.getChildByPath("框/小图框/数量").getComponent(Label).string = `x${this.PropNum}`;
        this.node.getChildByPath("框/描述").getComponent(Label).string = data.description;
        this.node.getChildByPath("框/名称").getComponent(Label).string = data.Name;
        //隐藏进度条和图标
        this.node.getChildByPath("框/进度值/进度条顶").children.forEach(element => {
            element.active = false;
        });
        this.node.getChildByPath("框/进度值/图标").children.forEach(element => {
            element.active = false;
        });
        if (data.type == SJZXD_PropType.回收物) {
            this.node.getChildByPath("框/Content/装备").active = false;
            this.node.getChildByPath("框/进度值").active = false;
        } else {
            this.node.getChildByPath("框/Content/装备").active = true;
            this.node.getChildByPath("框/进度值").active = true;
            if (data.type == SJZXD_PropType.武器) {
                this.node.getChildByPath("框/进度值/进度条顶/攻击").active = true;
                this.node.getChildByPath("框/进度值/图标/攻击图标").active = true;
                this._numericalvalueSprite = this.node.getChildByPath("框/进度值/进度条顶/攻击").getComponent(Sprite);
                this._numericalMaxvalue = SJZXD_Constant.Maxproperty[0];
            }
            if (data.type == SJZXD_PropType.防具) {
                this.node.getChildByPath("框/进度值/进度条顶/护甲").active = true;
                this.node.getChildByPath("框/进度值/图标/防御图标").active = true;
                this._numericalvalueSprite = this.node.getChildByPath("框/进度值/进度条顶/护甲").getComponent(Sprite);
                this._numericalMaxvalue = SJZXD_Constant.Maxproperty[2];
            }
            if (data.type == SJZXD_PropType.头盔) {
                this.node.getChildByPath("框/进度值/进度条顶/生命").active = true;
                this.node.getChildByPath("框/进度值/图标/生命图标").active = true;
                this._numericalvalueSprite = this.node.getChildByPath("框/进度值/进度条顶/生命").getComponent(Sprite);
                this._numericalMaxvalue = SJZXD_Constant.Maxproperty[1];
            }
            this.numericalrefresh();
        }

    }


    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.PropMessagePanel);
                break;
            case "加":
                this._SelectPropNum++;
                this.ChanggeSelectNum();
                break;
            case "减":
                this._SelectPropNum--;
                this.ChanggeSelectNum();
                break;
            case "出售":
                this.sell();
                break;
            case "装备":
                this.equipment();
                break;
        }
    }

    //调整选中数值
    ChanggeSelectNum() {
        if (this._SelectPropNum < 1) this._SelectPropNum = 1;
        if (this._SelectPropNum > this.PropNum) this._SelectPropNum = this.PropNum;
        this.node.getChildByPath("框/Content/出售区/数量").getComponent(Label).string = `数量:${this._SelectPropNum}`;
        this.node.getChildByPath("框/Content/出售区/数量进度条底/进度条").getComponent(Sprite).fillRange = this._SelectPropNum / this.PropNum;
        this.slider.progress = this._SelectPropNum / this.PropNum;
    }
    //数值进度条刷新
    numericalrefresh() {
        let num = SJZXD_Constant.getPropDataByName(this.PropName).property;
        tween(this._numericalvalueSprite)
            .to(0.6, { fillRange: num / this._numericalMaxvalue }, { easing: "backOut" })
            .start();
        this.node.getChildByPath("框/进度值/数值").getComponent(Label).string = `${num}`;
    }

    //滑动条滑动
    OnSlider(slider: Slider) {
        this._SelectPropNum = Math.floor(slider.progress * this.PropNum);
        this.ChanggeSelectNum();
    }
    sell() {
        if (SJZXD_GameData.Instance.SubWarehouseData(this.PropName, this._SelectPropNum)) {
            SJZXD_GameData.Instance.ChanggeMoney(this.PropPrice * this._SelectPropNum);
        }
        SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.PropMessagePanel);
    }
    equipment() {
        if (SJZXD_GameData.Instance.SubWarehouseData(this.PropName, 1)) {
            SJZXD_GameData.Instance.ChanggeEquip(this.PropName);
        }
        SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.PropMessagePanel);
    }
}


