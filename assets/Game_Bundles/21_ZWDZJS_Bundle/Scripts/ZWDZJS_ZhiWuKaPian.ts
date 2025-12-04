import { _decorator, Component, Label, Node, Sprite, SpriteFrame, tween, UIOpacity, v3 } from 'cc';
import ZWDZJS_GameDate from './ZWDZJS_GameDate';
import ZWDZJS_GameManager from './ZWDZJS_GameManager';
import { ZWDZJS_Incident } from './ZWDZJS_Incident';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;


@ccclass('ZWDZJS_ZhiWuKaPian')
export default class ZWDZJS_ZhiWuKaPian extends Component {
    start() {
        this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnMouseDown(even); });
        ZWDZJS_GameManager.Instance.SetSpriteSum(this.node.getChildByPath("卡片/阳光").getComponent(Sprite));
        tween(this.node.getChildByName("白色光效"))
            .to(2, { angle: 360 })
            .to(0, { angle: 0 })
            .union()
            .repeatForever()
            .start();
        tween(this.node.getChildByName("箭头"))
            .by(0.8, { position: v3(0, 40, 0) })
            .by(0.8, { position: v3(0, -40, 0) })
            .union()
            .repeatForever()
            .start();
    }
    OnMouseDown(even) {
        this.node.off(Node.EventType.TOUCH_START);
        this.node.getChildByName("箭头").active = false;
        ZWDZJS_GameDate.JieSuo[ZWDZJS_GameDate.GuanQia_JieSuo[ZWDZJS_GameManager.Scence]] = 1;//解锁植物
        tween(this.node)
            .to(2, { position: v3(0, 0), scale: v3(2, 2, 2) })
            .start();
        tween(this.node.getChildByName("白色光效").getComponent(UIOpacity))
            .to(1, { opacity: 255 }).start();
        tween(this.node.getChildByName("白色光效"))
            .to(1, { scale: v3(5, 5, 5) })
            .call(() => {
                tween(this.node.getChildByName("卡片").getComponent(UIOpacity))
                    .to(1, { opacity: 0 })
                    .start();
            })
            .to(1, { scale: v3(40, 40, 40) })
            .call(() => {
                ProjectEventManager.emit(ProjectEvent.游戏结束, "植物大战僵尸");
                ZWDZJS_GameManager.Instance.UI.getChildByName("结算界面").active = true;
                let id = ZWDZJS_GameDate.GuanQia_JieSuo[ZWDZJS_GameManager.Scence];
                let name = ZWDZJS_GameDate.GetNameById(id);
                ZWDZJS_Incident.LoadSprite("Sprite/小图/" + ZWDZJS_GameManager.GameMode + "/" + name).then((sp: SpriteFrame) => {
                    ZWDZJS_GameManager.Instance.UI.getChildByName("结算界面").getChildByName("植物图").getComponent(Sprite).spriteFrame = sp;
                })
                ZWDZJS_GameManager.Instance.UI.getChildByName("结算界面").getChildByName("描述").getComponent(Label).string
                    = ZWDZJS_GameDate.GetTextById(ZWDZJS_GameDate.GuanQia_JieSuo[ZWDZJS_GameManager.Scence]);
                ZWDZJS_GameManager.Instance.UI.getChildByName("结算界面").getComponent(UIOpacity).opacity = 0;
                tween(ZWDZJS_GameManager.Instance.UI.getChildByName("结算界面").getComponent(UIOpacity))
                    .to(1, { opacity: 255 })
                    .start();
            })
            .start();
    }
}


