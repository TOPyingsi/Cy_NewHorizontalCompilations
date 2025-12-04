import { _decorator, Component, Label, Node, Slider, Sprite, Event } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_Item from "./XGTW_Item";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_WeaponInfoPanel')
export default class XGTW_WeaponInfoPanel extends Component {
    NameLabel: Label | null = null;
    PriceLabel: Label | null = null;
    SliderCountLabel: Label | null = null;
    SliderMaxCountLabel: Label | null = null;
    WeightLabel: Label | null = null;
    Durable: Node | null = null;
    DurableLabel: Label | null = null;
    Slider: Slider | null = null;
    SliderBar: Sprite | null = null;
    Item: Node | null = null;
    count: number = 1;
    maxCount: number = 999;
    data: XGTW_ItemData = null;
    item: XGTW_Item = null;
    protected onLoad(): void {
        this.NameLabel = NodeUtil.GetComponent("NameLabel", this.node, Label);
        this.PriceLabel = NodeUtil.GetComponent("PriceLabel", this.node, Label);
        this.SliderCountLabel = NodeUtil.GetComponent("SliderCountLabel", this.node, Label);
        this.SliderMaxCountLabel = NodeUtil.GetComponent("SliderMaxCountLabel", this.node, Label);
        this.WeightLabel = NodeUtil.GetComponent("WeightLabel", this.node, Label);
        this.DurableLabel = NodeUtil.GetComponent("DurableLabel", this.node, Label);
        this.Slider = NodeUtil.GetComponent("Slider", this.node, Slider);
        this.SliderBar = NodeUtil.GetComponent("SliderBar", this.node, Sprite);
        this.Item = NodeUtil.GetNode("Item", this.node);
        this.Durable = NodeUtil.GetNode("Durable", this.node);
    }
    Show(data: XGTW_ItemData) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        if (!this.node.active) this.node.active = true;
        this.data = data;
        this.count = 1;
        this.NameLabel.string = `${this.data.Name}`;

        if (this.item) {
            this.item.InitSimple(data);
        } else {
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/Item", this.Item).then(e => {
                this.item = e.getComponent(XGTW_Item);
                this.item.InitSimple(data);
            })
        }

        this.DurableLabel.string = `${data.Durable}/${data.Durable}`;
        this.Durable.active = data.Durable != -1;
        this.Slider.node.active = XGTW_ItemData.IsConsumables(XGTW_ItemType[data.Type]);

        this.RefreshSlider();
        this.RefreshPriceAndWeight();
    }
    Hide() {
        if (this.node.active) this.node.active = false;
    }
    RefreshMoney() {
    }
    RefreshPriceAndWeight() {
        this.WeightLabel.string = `${(this.count * this.data.Weight).toFixed(1)}`;
        this.PriceLabel.string = `${this.count * this.data.Price}`;
    }
    SliderCallback(slider, customEventData) {
        this.count = Math.floor(slider.progress * this.maxCount);
        this.RefreshSlider();
    }
    RefreshSlider() {
        this.count = Tools.Clamp(this.count, 1, this.maxCount);
        let progress = this.count / this.maxCount;
        this.Slider.progress = progress;
        this.SliderBar.fillRange = progress;
        this.SliderCountLabel.string = `${this.count}`;
        this.RefreshPriceAndWeight();
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "AddButton":
                this.count++;
                this.RefreshSlider();
                break;
            case "ReduceButton":
                this.count--;
                this.RefreshSlider();
                break;
            case "ConfirmButton":

                break;
        }
    }
}