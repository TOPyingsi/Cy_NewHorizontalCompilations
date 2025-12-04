import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_GoodsItem from "./XGTW_GoodsItem";
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import PrefsManager from '../../../../Scripts/Framework/Managers/PrefsManager';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_SeasonData, XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

@ccclass('XGTW_SeasonItem')
export default class XGTW_SeasonItem extends Component {
    TitleLabel: Label | null = null;
    Content_0: Node | null = null;
    Content_1: Node | null = null;
    TitleBG: Node | null = null;
    Content: Node | null = null;
    data: XGTW_SeasonData;
    goodsItem_1: XGTW_GoodsItem = null;
    goodsItem_2: XGTW_GoodsItem = null;
    index: number = 0;
    protected onLoad(): void {
        this.TitleLabel = NodeUtil.GetComponent("TitleLabel", this.node, Label);
        this.Content_0 = NodeUtil.GetNode("Content_0", this.node);
        this.Content_1 = NodeUtil.GetNode("Content_1", this.node);
        this.TitleBG = NodeUtil.GetNode("TitleBG", this.node);
        this.Content = NodeUtil.GetNode("Content", this.node);
    }
    Init(index: number, data: XGTW_SeasonData) {
        this.index = index;
        this.data = data;
        this.TitleLabel.string = `${index}`;

        if (this.goodsItem_1) PoolManager.PutNode(this.goodsItem_1.node);
        if (this.goodsItem_2) PoolManager.PutNode(this.goodsItem_2.node);

        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/GoodsItem", this.Content_0).then((node) => {
            let goods = node.getComponent(XGTW_GoodsItem);
            goods.Init(this.data.ItemData_1, this.GoodsItemCallback.bind(this));
            goods.Get.active = XGTW_DataManager.GetSeasonItemGot(this.index, 1);
            goods.Locked.active = XGTW_DataManager.SeasonLv < this.index;
            this.goodsItem_1 = goods;
        });
        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/GoodsItem", this.Content_1).then((node) => {
            let goods = node.getComponent(XGTW_GoodsItem);
            goods.Init(this.data.ItemData_2, this.GoodsItemCallback.bind(this));
            goods.Get.active = XGTW_DataManager.GetSeasonItemGot(this.index, 2);
            if (PrefsManager.GetBool(XGTW_Constant.Key.UnlockSeason)) {
                goods.Locked.active = XGTW_DataManager.SeasonLv < this.index;
            } else {
                goods.Locked.active = true;
            }
            this.goodsItem_2 = goods;
        });

        this.TitleBG.getComponent(Sprite).color = XGTW_DataManager.SeasonLv < this.index ? Color.BLACK : Color.WHITE;
        this.Content.getComponent(Sprite).color = XGTW_DataManager.SeasonLv < this.index ? Color.BLACK : Color.WHITE;
    }
    GoodsItemCallback(data: XGTW_ItemData) {
        let goodsIndex = 1;
        if (data == this.data.ItemData_1) goodsIndex = 1;
        if (data == this.data.ItemData_2) goodsIndex = 2;
        XGTW_DataManager.SetSeasonItemGot(this.index, goodsIndex)
        XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.RewardPanel, [data])
        this.Refresh();

        if (data.Type == XGTW_ItemType[XGTW_ItemType.金钱]) {
            XGTW_DataManager.Money += data.Count;
        } else {
            XGTW_DataManager.AddPlayerItem(data);
        }
    }
    Refresh() {
        if (this.goodsItem_1) {
            this.goodsItem_1.Get.active = XGTW_DataManager.GetSeasonItemGot(this.index, 1);
            this.goodsItem_1.Locked.active = XGTW_DataManager.SeasonLv < this.index;
        };

        if (this.goodsItem_2) {
            this.goodsItem_2.Get.active = XGTW_DataManager.GetSeasonItemGot(this.index, 2);
            if (PrefsManager.GetBool(XGTW_Constant.Key.UnlockSeason)) {
                this.goodsItem_2.Locked.active = XGTW_DataManager.SeasonLv < this.index;
            } else {
                this.goodsItem_2.Locked.active = true;
            }
        };

        this.TitleBG.getComponent(Sprite).color = XGTW_DataManager.SeasonLv < this.index ? Color.BLACK : Color.WHITE;
        this.Content.getComponent(Sprite).color = XGTW_DataManager.SeasonLv < this.index ? Color.BLACK : Color.WHITE;
    }
}