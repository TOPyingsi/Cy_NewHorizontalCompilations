import { _decorator, Component, EventTouch, Label, Node, Slider, Sprite, SpriteFrame, tween } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_Constant, SJZGMMT_PropType } from '../SJZGMMT_Constant';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_Incident } from '../SJZGMMT_Incident';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_PropMessagePanel2')
export class SJZGMMT_PropMessagePanel2 extends PanelBase {
    private PropName: string = "";//道具名
    private PropNum: number = 0;//道具拥有数量
    private PropPrice: number = 0;//道具单价

    private _numericalvalueSprite: Sprite = null;//装备数值进度条
    private _numericalMaxvalue: number = 0;//装备数值进度条最大值


    protected onLoad(): void {

    }
    //参数0道具名
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.Init(args[0]);
    }


    //初始化
    Init(Name: string) {
        this.PropName = Name;
        let data = SJZGMMT_Constant.getPropDataByName(this.PropName);
        this.PropNum = SJZGMMT_GameData.Instance.getWarehouseNum(this.PropName);
        this.PropPrice = data.price;
        SJZGMMT_UIManager.Instance.GetPropSprite(this.PropName).then((sp: SpriteFrame) => {
            this.node.getChildByPath("框/小图框/小图").getComponent(Sprite).spriteFrame = sp;
        })
        let Quality = SJZGMMT_Constant.QuaLityList[data.quality];
        SJZGMMT_Incident.LoadSprite("Sprites/仓库/" + Quality).then((sp: SpriteFrame) => {
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
        if (data.type == SJZGMMT_PropType.回收物) {
            this.node.getChildByPath("框/进度值").active = false;
        } else {
            this.node.getChildByPath("框/进度值").active = true;
            if (data.type == SJZGMMT_PropType.武器) {
                this.node.getChildByPath("框/进度值/进度条顶/攻击").active = true;
                this.node.getChildByPath("框/进度值/图标/攻击图标").active = true;
                this._numericalvalueSprite = this.node.getChildByPath("框/进度值/进度条顶/攻击").getComponent(Sprite);
                this._numericalMaxvalue = SJZGMMT_Constant.Maxproperty[0];
            }
            if (data.type == SJZGMMT_PropType.防具) {
                this.node.getChildByPath("框/进度值/进度条顶/护甲").active = true;
                this.node.getChildByPath("框/进度值/图标/防御图标").active = true;
                this._numericalvalueSprite = this.node.getChildByPath("框/进度值/进度条顶/护甲").getComponent(Sprite);
                this._numericalMaxvalue = SJZGMMT_Constant.Maxproperty[2];
            }
            if (data.type == SJZGMMT_PropType.头盔) {
                this.node.getChildByPath("框/进度值/进度条顶/生命").active = true;
                this.node.getChildByPath("框/进度值/图标/生命图标").active = true;
                this._numericalvalueSprite = this.node.getChildByPath("框/进度值/进度条顶/生命").getComponent(Sprite);
                this._numericalMaxvalue = SJZGMMT_Constant.Maxproperty[1];
            }

        }

    }


    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.PropMessagePanel2);
                break;

        }
    }





}


