import { _decorator, Component, Sprite, Label, Tween, v3, tween, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { GameManager } from '../../../../Scripts/GameManager';
import Banner from '../../../../Scripts/Banner';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_SpecialSkinDetailPanel')
export default class XGTW_SpecialSkinDetailPanel extends Component {
    Item: Sprite | null = null;
    Mask: Sprite | null = null;
    Name: Label | null = null;
    data: XGTW_ItemData = null;
    protected onLoad(): void {
        this.Item = NodeUtil.GetComponent("Item", this.node, Sprite);
        this.Mask = NodeUtil.GetComponent("Mask", this.node, Sprite);
        this.Name = NodeUtil.GetComponent("Name", this.node, Label);
    }
    Show(data: XGTW_ItemData) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.data = data;
        this.Name.string = `${data.Name}`;
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/GunBG_${data.Name}`).then((sf: SpriteFrame) => {
            this.Mask.spriteFrame = sf;
        });

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
            this.Item.spriteFrame = sf;
        });

        Tween.stopAllByTarget(this.Item.node);

        let scale = 6;
        if (data.Name == `G18C-矩形几何`) scale = 4;

        this.Item.node.setScale(v3(scale, scale));

        tween(this.Item.node).to(1, { scale: v3(scale + 1, scale + 1) }).to(1, { scale: v3(scale, scale) }).union().repeatForever().start();
        tween(this.Item.node).to(1, { angle: 6 }).to(1, { angle: -6 }).union().repeatForever().start();
    }
    OnBuyButtonClick() {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        Banner.Instance.ShowVideoAd(() => {
            XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.SpecialSkinDetailPanel);
            XGTW_DataManager.AddPlayerItem(Tools.Clone(this.data));
            XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.RewardPanel, [this.data])
        });
    }
    OnReturnButtonClick() {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.SpecialSkinDetailPanel);
    }
}