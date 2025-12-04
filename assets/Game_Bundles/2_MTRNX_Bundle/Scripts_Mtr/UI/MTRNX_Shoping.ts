import { _decorator, Component, instantiate, Label, Node, Prefab, resources, Sprite, SpriteFrame } from 'cc';

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import Banner from '../../../../Scripts/Banner';
import { MTRNX_Constant } from '../Data/MTRNX_Constant';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';
import { MTRNX_GameDate } from '../MTRNX_GameDate';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_Shoping')
export class MTRNX_Shoping extends Component {
    public Names: string[] = ["木棍人", "奈氪鲨", "鹿人"];
    private Islogding: boolean = false;
    //初始化商店
    Show() {
        if (this.Islogding) {
            this.ShowData();
            return;
        }
        BundleManager.GetBundle("2_MTRNX_Bundle").load("Prefabs/商品", Prefab, (err, event) => {
            if (err) {
                console.log("没有找到商品预制体");
                return;
            }
            for (let i = 0; i < MTRNX_Constant.ShopiingUnit.length; i++) {
                let pre: Node = instantiate(event);
                pre.setParent(this.node.getChildByPath("滑动框/view/content"));
                BundleManager.GetBundle("2_MTRNX_Bundle").load("UI_Mtr/Icon/" + MTRNX_Constant.PlayerName[MTRNX_Constant.ShopiingUnit[i]] + "/spriteFrame", (err, sprite: SpriteFrame) => {
                    pre.getChildByName("图片").getComponent(Sprite).spriteFrame = sprite;
                })
                pre.getChildByName("价格文本").getComponent(Label).string = "价格：" + MTRNX_Constant.PlayerPrice[MTRNX_Constant.ShopiingUnit[i]];
                pre.getChildByName("购买按钮").on(Node.EventType.TOUCH_END, () => {
                    this.Buy_role(MTRNX_Constant.ShopiingUnit[i]);
                })
                pre.getChildByName("使用按钮").on(Node.EventType.TOUCH_END, () => {
                    this.Changge_role(MTRNX_Constant.ShopiingUnit[i]);
                })
                pre.getChildByName("升级按钮").on(Node.EventType.TOUCH_END, () => {
                    this.LevelUp(MTRNX_Constant.ShopiingUnit[i]);
                    pre.getChildByName("属性描述").getComponent(Label).string = MTRNX_Constant.GetPlayerUpText(MTRNX_Constant.ShopiingUnit[i], MTRNX_GameDate.Instance.PlayerDate[MTRNX_Constant.ShopiingUnit[i]]);
                })
                pre.getChildByName("Name").getComponent(Label).string = this.Names[i];
            }
            this.ShowData();
            this.ShowText_Shop();
            this.Islogding = true;
        })
    }

    //刷新商店
    ShowData() {
        this.node.getChildByPath("当前余额/文本").getComponent(Label).string = "科技点:" + MTRNX_GameDate.Instance.Money;
        let pre = this.node.getChildByPath("滑动框/view/content");
        for (let i = 0; i < MTRNX_Constant.ShopiingUnit.length; i++) {
            pre.children[i].getChildByName("价格文本").active = true;
            pre.children[i].getChildByName("购买按钮").active = false;
            pre.children[i].getChildByName("使用按钮").active = false;
            pre.children[i].getChildByName("当前使用").active = false;
            pre.children[i].getChildByName("升级按钮").active = false;
            if (MTRNX_GameDate.Instance.PlayerDate[MTRNX_Constant.ShopiingUnit[i]] > 0) {//解锁的
                pre.children[i].getChildByName("价格文本").getComponent(Label).string = "升级费用："
                    + MTRNX_Constant.GetPlayerPrice(MTRNX_Constant.ShopiingUnit[i], MTRNX_GameDate.Instance.PlayerDate[MTRNX_Constant.ShopiingUnit[i]]);
                pre.children[i].getChildByName("升级按钮").active = true;
                if (MTRNX_Constant.ShopiingUnit[i] == MTRNX_GameDate.Instance.CurrentSelect) {
                    pre.children[i].getChildByName("当前使用").active = true;
                } else {
                    pre.children[i].getChildByName("使用按钮").active = true;
                }
            } else {
                pre.children[i].getChildByName("购买按钮").active = true;
            }
        }
    }
    //刷新商店所有文本
    ShowText_Shop() {
        let pre = this.node.getChildByPath("滑动框/view/content");
        for (let i = 0; i < MTRNX_Constant.ShopiingUnit.length; i++) {
            pre.children[i].getChildByName("属性描述").getComponent(Label).string = MTRNX_Constant.GetPlayerUpText(MTRNX_Constant.ShopiingUnit[i], MTRNX_GameDate.Instance.PlayerDate[MTRNX_Constant.ShopiingUnit[i]]);
        }
    }

    ShowShopTip(isbuy: boolean, desc: string, cb: Function) {
        let panel = this.node.getChildByPath("TipPanel/Panel");
        if (isbuy) {
            panel.getChildByName("DescLb").getComponent(Label).string = "是否" + desc + "此单位";
            panel.getChildByPath("确定/video").active = false;
        }
        else {
            panel.getChildByName("DescLb").getComponent(Label).string = "科技点不足（通关杀戮模式可获得）观看视频可立即获得1000科技点";
            panel.getChildByPath("确定/video").active = true;
        }
        panel.parent.active = true;
        panel.getChildByName("确定").once(Node.EventType.TOUCH_END, () => {
            if (panel.getChildByPath("确定/video").active) {
                Banner.Instance.ShowVideoAd(() => {
                    MTRNX_GameDate.Instance.Money += 1000;
                    this.ShowData();
                    panel.parent.active = false;
                })
            }
            else {
                cb && cb();
                panel.parent.active = false;
            }
        })

        panel.getChildByName("取消").once(Node.EventType.TOUCH_END, () => {
            panel.parent.active = false;
        })
        if (Banner.RegionMask) {
            Banner.Instance.ShowCustomAd();
        }

    }
    //切换角色
    Changge_role(id: number) {
        console.log("切换角色" + id);
        MTRNX_GameDate.Instance.CurrentSelect = id;
        MTRNX_GameDate.DateSave();
        this.ShowData();
    }
    //升级角色
    LevelUp(id: number) {
        if (MTRNX_GameDate.Instance.PlayerDate[id] > 9) {
            MTRNX_UIManager.HopHint("该角色已经满级！");
            return;
        }
        let price = MTRNX_Constant.GetPlayerPrice(id, MTRNX_GameDate.Instance.PlayerDate[id]);
        if (MTRNX_GameDate.Instance.Money < price) {
            // UIManager.HopHint("科技点数不足！无法升级");
            this.ShowShopTip(false, "升级", null)
        }
        else {
            this.ShowShopTip(true, "升级", () => {
                MTRNX_GameDate.Instance.Money -= price;
                MTRNX_GameDate.Instance.PlayerDate[id]++;
                MTRNX_UIManager.HopHint("升级成功！");
                MTRNX_GameDate.DateSave();
                this.ShowData();
                this.ShowText_Shop();
            })
        }
    }
    //购买角色
    Buy_role(id: number) {
        if (MTRNX_GameDate.Instance.Money < MTRNX_Constant.PlayerPrice[id]) {
            // UIManager.HopHint("科技点数不足！无法购买");
            this.ShowShopTip(false, "购买", null)
        }
        else {
            this.ShowShopTip(true, "购买", () => {
                MTRNX_GameDate.Instance.Money -= MTRNX_Constant.PlayerPrice[id];
                MTRNX_GameDate.Instance.PlayerDate[id] = 1;
                MTRNX_UIManager.HopHint("购买成功");
                MTRNX_GameDate.DateSave();
                this.ShowData();
            })
        }
    }
    //关闭商店
    Exit_Shop() {
        MTRNX_UIManager.Instance.HidePanel(MTRNX_Panel.Shopping);
    }
}


