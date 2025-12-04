import { _decorator, Component, Sprite, Label, Vec3, SpriteFrame, v3 } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { GameManager } from '../../../../Scripts/GameManager';
import Banner from '../../../../Scripts/Banner';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTW_ItemData, XGTW_头盔, XGTW_防弹衣, XGTW_手枪, XGTW_突击步枪, XGTW_冲锋枪, XGTW_射手步枪, XGTW_栓动步枪, XGTW_轻机枪, XGTW_霰弹枪, XGTW_投掷物, XGTW_子弹, XGTW_药品 } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';

@ccclass('XGTW_SkinItem')
export default class XGTW_SkinItem extends Component {
    Icon: Sprite | null = null;
    Name: Label | null = null;
    data: XGTW_ItemData;
    protected onLoad(): void {
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Name = NodeUtil.GetComponent("Name", this.node, Label);
    }
    Init(data) {
        this.Name.string = `${data.Name}`;
        this.Icon.node.setScale(Vec3.ONE);
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });
    }
    头盔(data: XGTW_头盔) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(v3(0.7, 0.7));
    }
    防弹衣(data: XGTW_防弹衣) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(v3(0.8, 0.8));
    }
    手枪(data: XGTW_手枪) {
        this.data = data;
        this.Init(data);
    }
    突击步枪(data: XGTW_突击步枪) {
        this.data = data;
        this.Init(data);
    }
    冲锋枪(data: XGTW_冲锋枪) {
        this.data = data;
        this.Init(data);
    }
    射手步枪(data: XGTW_射手步枪) {
        this.data = data;
        this.Init(data);
    }
    栓动步枪(data: XGTW_栓动步枪) {
        this.data = data;
        this.Init(data);
    }
    轻机枪(data: XGTW_轻机枪) {
        this.data = data;
        this.Init(data);
    }
    霰弹枪(data: XGTW_霰弹枪) {
        this.data = data;
        this.Init(data);
    }
    投掷物(data: XGTW_投掷物) {
        this.data = data;
        this.Init(data);
    }
    子弹(data: XGTW_子弹) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(v3(0.8, 0.8));
    }
    药品(data: XGTW_药品) {
        this.data = data;
        this.Init(data);
        this.Icon.node.setScale(XGTW_ItemData.GetScale(data.Type));
    }
    OnButtonClick() {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        Banner.Instance.ShowVideoAd(() => {
            XGTW_DataManager.AddPlayerItem(Tools.Clone(this.data));
            XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.RewardPanel, [this.data])
        });
    }
}