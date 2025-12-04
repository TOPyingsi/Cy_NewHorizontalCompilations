import { _decorator, Color, Component, EventTouch, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, tween, v3, Widget } from 'cc';
import { NBSYS_Incident } from './NBSYS_Incident';
import { NBSYS_EquipmentBtn } from './NBSYS_EquipmentBtn';
import { NBSYS_GameData } from './NBSYS_GameData';
import { NBSYS_TemplateBtn } from './NBSYS_TemplateBtn';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_Menu')
export class NBSYS_Menu extends Component {
    public CanLook: boolean = false;//默认是否可视


    start() {
        this.Init();
    }


    //初始化
    Init() {
        //初始化器材界面
        NBSYS_Incident.Loadprefab("PreFab/按钮/器材按钮").then((prefab: Prefab) => {
            NBSYS_GameData.QiCaiData.forEach((cd) => {
                let node = instantiate(prefab);
                node.setParent(this.node.getChildByPath("实验器材界面/Content"));
                node.getComponent(NBSYS_EquipmentBtn).Name = cd.Name;
                node.getComponent(NBSYS_EquipmentBtn).Init();
            })
        });
        //初始化模板界面
        NBSYS_Incident.Loadprefab("PreFab/按钮/模板按钮").then((prefab: Prefab) => {
            NBSYS_GameData.Template.forEach((cd) => {
                let node = instantiate(prefab);
                node.setParent(this.node.getChildByPath("实验模板界面/Content"));
                node.getComponent(NBSYS_TemplateBtn).Name = cd.Name;
                node.getComponent(NBSYS_TemplateBtn).Init();
            })
        });
    }

    OnButtonClick(btn: EventTouch) {
        switch (btn.target.name) {
            case "收缩按钮":
                this.OnShrinkClick();
                break;
            case "切换器材界面":
                this.OnQieHuanClick(true);

                break;
            case "切换模板界面":
                this.OnQieHuanClick(false);
                break;
        }

    }

    //切换按钮点击
    OnQieHuanClick(Isleft: boolean) {
        this.node.getChildByName("实验器材界面").active = Isleft ? true : false;
        this.node.getChildByName("实验模板界面").active = Isleft ? false : true;
        this.node.getChildByPath("切换器材界面/Label").getComponent(Label).color = Isleft ? new Color(105, 165, 255, 255) : new Color(255, 255, 255, 255);
        this.node.getChildByPath("切换模板界面/Label").getComponent(Label).color = Isleft ? new Color(255, 255, 255, 255) : new Color(105, 165, 255, 255);
        tween(this.node.getChildByName("下划线"))
            .to(0.3, { position: v3(Isleft ? -140 : 140, 320) }, { easing: "backOut" })
            .start();

    }


    //收缩按钮点击
    OnShrinkClick() {
        this.CanLook = !this.CanLook;
        let left = this.CanLook ? 0 : -600;
        let name = this.CanLook ? "收缩" : "弹出";
        tween(this.node.getComponent(Widget))
            .to(0.5, { right: left }, { easing: "backOut" })
            .call(() => {
                NBSYS_Incident.LoadSprite("Sprits/UI其他/" + name).then((sp: SpriteFrame) => {
                    this.node.getChildByName("收缩按钮").getComponent(Sprite).spriteFrame = sp;
                })
            })
            .start();
    }
}


