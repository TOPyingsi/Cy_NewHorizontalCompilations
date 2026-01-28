import { _decorator, Component, EventTouch, instantiate, Label, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_SkinBox } from '../SJZXD_SkinBox';
import { SJZXD_Incident } from '../SJZXD_Incident';
import { SJZXD_GameData } from '../SJZXD_GameData';
import Banner from '../../../../Scripts/Banner';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_SkinPanel')
export class SJZXD_SkinPanel extends PanelBase {
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
        for (let i = 0; i < SJZXD_Constant.SkinData.length; i++) {
            let SkinBox = instantiate(this.SkinboxPre);
            SkinBox.parent = this.SkinContent;
            SkinBox.getComponent(SJZXD_SkinBox).Init(SJZXD_Constant.SkinData[i].Name, this.node);
        }
        //默认选中第一个皮肤
        this.OnSelectclick(SJZXD_Constant.SkinData[0].Name);
        this.SkinContent.emit("皮肤_选中", SJZXD_Constant.SkinData[0].Name);
    }


    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.SkinPanel);
                break;
            case "钞票购买":
                this.Buy(false);
                break;
            case "激励购买":
                this.Buy(true);
                break;
            case "使用":
                SJZXD_GameData.Instance.Skin = this.SelectSkin;
                SJZXD_UIManager.Instance.ShowText("使用皮肤成功！");
                this.OnSelectclick(this.SelectSkin);
                break;
        }
    }
    //皮肤小框选中后
    OnSelectclick(SkinName: string) {
        let SkinData = SJZXD_Constant.getSkinDataByName(SkinName);
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
        if (SJZXD_GameData.Instance.SkinData.includes(SkinName)) {
            this.node.getChildByPath("框/获得").active = false;
            if (SJZXD_GameData.Instance.Skin == SkinName) {
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
        this.node.getChildByPath("框/获得/钞票购买/数量").getComponent(Label).string = `${SJZXD_Incident.GetMaxNum(SkinData.Price)}`;
    }

    //购买
    Buy(IsVideo: boolean = false) {
        const getSkin = () => {
            SJZXD_GameData.Instance.SkinData.push(this.SelectSkin);
            SJZXD_UIManager.Instance.ShowText("解锁皮肤成功！");
            this.OnSelectclick(this.SelectSkin);
        }
        if (IsVideo) {
            Banner.Instance.ShowVideoAd(() => {
                getSkin();
            })
        } else {
            if (SJZXD_GameData.Instance.Money >= this.SelectSkinPrice) {
                SJZXD_GameData.Instance.ChanggeMoney(-this.SelectSkinPrice);
                getSkin();
            } else {
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.GetCashPanel);
            }
        }

    }


}


