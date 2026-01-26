import { _decorator, Animation, Component, EventTouch, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { XSHZ_Constant } from './XSHZ_Constant';
import { XSHZ_incident } from './XSHZ_incident';
import { XSHZ_Unit } from './XSHZ_Unit';
import { XSHZ_GameData } from './XSHZ_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XSHZ_AudioManager } from './XSHZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_ShopPanel')
export class XSHZ_ShopPanel extends Component {
    private SelectId: number = 0;
    private ShopData: string[] = ["鼬", "山治", "艾斯", "纲手", "宇智波斑", "索隆", "空条承太郎", "路飞"];

    private Xzk: Node = null;
    start() {
        this.Xzk = this.node.getChildByName("选中框");
        this.Show();
    }

    OnSelectClick(btn: EventTouch) {
        XSHZ_AudioManager.globalAudioPlay("按钮点击");
        this.SelectId = Number(btn.target.name);
        this.Show();
    }
    OnbuttomClick(btn: EventTouch) {
        XSHZ_AudioManager.globalAudioPlay("按钮点击");
        switch (btn.target.name) {
            case "返回": this.node.active = false; break;
            case "购买":
                if (XSHZ_GameData.Instance.Money >= 288) {
                    XSHZ_GameData.Instance.Money -= 288;
                    XSHZ_GameData.Instance.UnLook.push(this.ShopData[this.SelectId]);
                    UIManager.ShowTip("购买成功！");
                    this.Show();
                } else {
                    UIManager.ShowTip("钻石不足");
                }
                break;
        }
    }

    Show() {
        if (XSHZ_GameData.Instance.UnLook.indexOf(this.ShopData[this.SelectId]) != -1) {
            this.node.getChildByName("购买").active = false;
        } else {
            this.node.getChildByName("购买").active = true;
        }
        this.Xzk.setParent(this.node.getChildByName("选择Content").children[this.SelectId]);
        this.Xzk.position = v3(0, 0, 0);
        let data = XSHZ_Constant.GetUnitDataByName(this.ShopData[this.SelectId]);
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
        XSHZ_incident.Loadprefab("PreFab/角色/" + data.Name).then((prefab: Prefab) => {
            this.node.getChildByName("角色Mask").removeAllChildren();
            let node = instantiate(prefab);
            node.setParent(this.node.getChildByName("角色Mask"));
            node.position = v3(0, -150, 0);
        })
        for (let index = 0; index < 3; index++) {
            XSHZ_incident.LoadSprite(`Sprite/技能图片/${data.Name}/${index}`).then((sp: SpriteFrame) => {
                this.node.getChildByName(`技能${index}`).getComponent(Sprite).spriteFrame = sp;
            })
        }
    }
}


