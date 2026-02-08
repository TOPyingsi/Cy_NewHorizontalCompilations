import { _decorator, Component, EventTouch, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_SkinBox } from '../SJZGMMT_SkinBox';
import { SJZGMMT_Incident } from '../SJZGMMT_Incident';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import Banner from '../../../../Scripts/Banner';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_SkinPanel')
export class SJZGMMT_SkinPanel extends PanelBase {
    @property(Prefab)
    SkinboxPre: Prefab = null;
    @property(Node)
    SkinContent: Node = null;
    private SelectSkin: string = "";//选中皮肤名字
    private SelectSkinPrice: number = 0;//选中皮肤价格
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }
    protected start(): void {
        this.Init();
        this.node.on("皮肤_选中", this.OnSelectclick, this)
    }
    //初始化
    Init() {
        for (let i = 0; i < SJZGMMT_Constant.SkinData.length; i++) {
            let SkinBox = instantiate(this.SkinboxPre);
            SkinBox.parent = this.SkinContent;
            SkinBox.getComponent(SJZGMMT_SkinBox).Init(SJZGMMT_Constant.SkinData[i].Name, this.node);
        }
        //默认选中第一个皮肤
        this.OnSelectclick(SJZGMMT_Constant.SkinData[0].Name);
        this.SkinContent.emit("皮肤_选中", SJZGMMT_Constant.SkinData[0].Name);
    }


    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.SkinPanel);
                break;
            case "钞票购买":
                this.Buy(false);
                break;
            case "激励购买":
                this.Buy(true);
                break;
            case "使用":
                SJZGMMT_GameData.Instance.Skin = this.SelectSkin;
                SJZGMMT_UIManager.Instance.ShowText("使用皮肤成功！");
                this.OnSelectclick(this.SelectSkin);
                break;
        }
    }
    //皮肤小框选中后
    OnSelectclick(SkinName: string) {
        let SkinData = SJZGMMT_Constant.getSkinDataByName(SkinName);
        this.node.getChildByPath("框/名字/文本").getComponent(Label).string = SkinData.Name;
        this.node.getChildByPath("框/生命加成/文本").getComponent(Label).string = `${SkinData.AddHP}`;
        this.SelectSkin = SkinName;
        this.SelectSkinPrice = SkinData.Price;
        if (this.SelectSkinPrice == 0) {
            this.node.getChildByPath("框/获得/钞票购买").active = false;
            this.node.getChildByPath("框/获得/激励购买").active = true;
        } else {
            this.node.getChildByPath("框/获得/钞票购买").active = true;
            this.node.getChildByPath("框/获得/激励购买").active = false;
        }
        if (SJZGMMT_GameData.Instance.SkinData.includes(SkinName)) {
            this.node.getChildByPath("框/获得").active = false;
            if (SJZGMMT_GameData.Instance.Skin == SkinName) {
                this.node.getChildByPath("框/使用中").active = true;
                this.node.getChildByPath("框/使用").active = false;
            } else {
                this.node.getChildByPath("框/使用").active = true;
                this.node.getChildByPath("框/使用中").active = false;
            }
        } else {
            this.node.getChildByPath("框/获得").active = true;
            this.node.getChildByPath("框/使用").active = false;
            this.node.getChildByPath("框/使用中").active = false;
        }
        this.node.getChildByPath("框/获得/钞票购买/数量").getComponent(Label).string = `${SJZGMMT_Incident.GetMaxNum(SkinData.Price)}`;
    }

    //购买
    Buy(IsVideo: boolean = false) {
        const getSkin = () => {
            SJZGMMT_GameData.Instance.SkinData.push(this.SelectSkin);
            SJZGMMT_UIManager.Instance.ShowText("解锁皮肤成功！");
            this.OnSelectclick(this.SelectSkin);
        }
        if (IsVideo) {
            Banner.Instance.ShowVideoAd(() => {
                getSkin();
            })
        } else {
            if (SJZGMMT_GameData.Instance.Money >= this.SelectSkinPrice) {
                SJZGMMT_GameData.Instance.ChanggeMoney(-this.SelectSkinPrice);
                getSkin();
            } else {
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.GetCashPanel);
            }
        }

    }


}


