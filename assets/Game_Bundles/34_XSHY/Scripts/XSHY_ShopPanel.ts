import { _decorator, Animation, Component, EventTouch, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { XSHY_Constant } from './XSHY_Constant';
import { XSHY_incident } from './XSHY_incident';
import { XSHY_Unit } from './XSHY_Unit';
import { XSHY_GameData } from './XSHY_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XSHY_AudioManager } from './XSHY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_ShopPanel')
export class XSHY_ShopPanel extends Component {
    private SelectId: number = 0;
    private ShopData: string[] = ["鼬", "四代目", "佐助", "纲手", "宇智波斑", "弥彦", "空条承太郎", "川尻浩作"];

    private Xzk: Node = null;
    start() {
        this.Xzk = this.node.getChildByName("选中框");
        this.Show();
    }

    OnSelectClick(btn: EventTouch) {
        XSHY_AudioManager.globalAudioPlay("按钮点击");
        this.SelectId = Number(btn.target.name);
        this.Show();
    }
    OnbuttomClick(btn: EventTouch) {
        XSHY_AudioManager.globalAudioPlay("按钮点击");
        switch (btn.target.name) {
            case "返回": this.node.active = false; break;
            case "购买":
                if (XSHY_GameData.Instance.Money >= 288) {
                    XSHY_GameData.Instance.Money -= 288;
                    XSHY_GameData.Instance.UnLook.push(this.ShopData[this.SelectId]);
                    UIManager.ShowTip("购买成功！");
                    this.Show();
                } else {
                    UIManager.ShowTip("钻石不足");
                }
                break;
        }
    }

    Show() {
        if (XSHY_GameData.Instance.UnLook.indexOf(this.ShopData[this.SelectId]) != -1) {
            this.node.getChildByName("购买").active = false;
        } else {
            this.node.getChildByName("购买").active = true;
        }
        this.Xzk.setParent(this.node.getChildByName("选择Content").children[this.SelectId]);
        this.Xzk.position = v3(0, 0, 0);
        let data = XSHY_Constant.GetUnitDataByName(this.ShopData[this.SelectId]);
        this.node.getChildByName("名字").getComponent(Label).string = data.Name;
        this.node.getChildByName("生命值").getComponent(Label).string = data.HP.toString();
        this.node.getChildByName("攻击力").getComponent(Label).string = data.Attack.toString();
        this.node.getChildByName("速度").getComponent(Label).string = data.Speed.toString();
        tween(this.node.getChildByName("生命条").getComponent(Sprite))
            .to(0.5, { fillRange: data.HP / 1000 }, { easing: "backOut" }).start();
        tween(this.node.getChildByName("攻击条").getComponent(Sprite))
            .to(0.5, { fillRange: data.Attack / 20 }, { easing: "backOut" }).start();
        tween(this.node.getChildByName("速度条").getComponent(Sprite))
            .to(0.5, { fillRange: data.Speed / 30 }, { easing: "backOut" }).start();
        XSHY_incident.Loadprefab("PreFab/角色/" + data.Name).then((prefab: Prefab) => {
            this.node.getChildByName("角色Mask").removeAllChildren();
            let node = instantiate(prefab);
            node.setParent(this.node.getChildByName("角色Mask"));
            node.position = v3(0, -150, 0);
        })
        for (let index = 0; index < 3; index++) {
            XSHY_incident.LoadSprite(`Sprite/技能图片/${data.Name}/${index}`).then((sp: SpriteFrame) => {
                this.node.getChildByName(`技能${index}`).getComponent(Sprite).spriteFrame = sp;
            })
        }
    }
}


