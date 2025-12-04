import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { NBSYS_Incident } from './NBSYS_Incident';
import { NBSYS_GameManager } from './NBSYS_GameManager';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_TemplateBtn')
export class NBSYS_TemplateBtn extends Component {
    //对应模板名字
    public Name: string = "";
    start() {
        this.Init();
    }

    Init() {
        NBSYS_Incident.LoadSprite("Sprits/模板/" + this.Name).then((sprite: SpriteFrame) => {
            this.node.getChildByName("图").getComponent(Sprite).spriteFrame = sprite;
        });
    }

    //按下
    OnClick() {
        NBSYS_GameManager.Instance.WarningPop_up(() => {
            console.log("生成模板" + this.Name);
            NBSYS_GameManager.Instance.GameMode = this.Name;
            NBSYS_GameManager.Instance.InitTemplate(this.Name);
        }, "选择模板会清空所有的实验器材，是否继续？");

    }
}


