import { _decorator, Component, Node, Sprite, RichText, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { XGTW_AchievementData, XGTW_AchievementType } from '../Framework/Managers/XGTW_AchievementManager';

@ccclass('XGTW_AchievementItem')
export default class XGTW_AchievementItem extends Component {
    Achievement_0: Node | null = null;
    Achievement_1: Node | null = null;
    Achievement_2: Node | null = null;
    Icon: Sprite | null = null;
    TitleLb: RichText | null = null;
    DescLb: RichText | null = null;
    StateLb: RichText | null = null;
    common: string[] = ["#ffffff", "#6b696b"];
    rare: string[] = ["#c6c3c6", "#6b6d6b"];
    epic: string[] = ["#ffd300", "#846510"];
    red: string[] = ["#c62008", "#730c08"];
    data: XGTW_AchievementData = null;
    protected onLoad(): void {
        this.Achievement_0 = NodeUtil.GetNode("Achievement_0", this.node);
        this.Achievement_1 = NodeUtil.GetNode("Achievement_1", this.node);
        this.Achievement_2 = NodeUtil.GetNode("Achievement_2", this.node);

        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.TitleLb = NodeUtil.GetComponent("TitleLb", this.node, RichText);
        this.DescLb = NodeUtil.GetComponent("DescLb", this.node, RichText);
        this.StateLb = NodeUtil.GetComponent("StateLb", this.node, RichText);
    }
    Init(data: XGTW_AchievementData) {
        this.TitleLb.node.active = true;
        this.DescLb.node.active = true;
        this.StateLb.node.active = true;
        this.data = data;
        this.Refresh();
    }
    InitTip(data: XGTW_AchievementData) {
        this.data = data;
        this.Refresh();
        this.TitleLb.node.active = true;
        this.DescLb.node.active = false;
        this.StateLb.node.active = false;
    }
    Refresh() {
        let strColors: string[] = ["#ffffff", "#6b696b"];
        if (this.data.Type == XGTW_AchievementType.Common) strColors = this.common;
        if (this.data.Type == XGTW_AchievementType.Rare) strColors = this.rare;
        if (this.data.Type == XGTW_AchievementType.Epic) strColors = this.epic;

        this.StateLb.node.active = !this.data.Done;

        this.Achievement_0.active = this.data.Type == XGTW_AchievementType.Common;
        this.Achievement_1.active = this.data.Type == XGTW_AchievementType.Rare;
        this.Achievement_2.active = this.data.Type == XGTW_AchievementType.Epic;

        this.TitleLb.string = `<b><size=45><outline color=${strColors[1]} width = 4 ><color=${strColors[0]}>${this.data.Name}</color></outline></size></b>`;
        this.DescLb.string = `<b><size=35><outline color=${strColors[1]} width = 4 ><color=${strColors[0]}>${this.data.Desc}</color></outline></size></b>`;
        this.StateLb.string = `<b><size=40><outline color=${this.red[1]} width = 4 ><color=${this.red[0]}>未完成</color></outline></size></b>`;

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Achievement/${this.data.Name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });
    }
}