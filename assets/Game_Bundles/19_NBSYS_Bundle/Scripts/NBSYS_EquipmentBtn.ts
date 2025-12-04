import { _decorator, Component, Node, Sprite, SpriteFrame, UITransform, v2, v3 } from 'cc';
import { NBSYS_Incident } from './NBSYS_Incident';
import { NBSYS_GameManager } from './NBSYS_GameManager';
import { NBSYS_GameData } from './NBSYS_GameData';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_EquipmentBtn')
export class NBSYS_EquipmentBtn extends Component {
    //器材按钮对应器材
    public Name: string = "";
    start() {
        this.Init();
    }

    Init() {
        NBSYS_Incident.LoadSprite("Sprits/材料/" + this.Name).then((sprite: SpriteFrame) => {
            let scaleX = sprite.width / 190;
            let scaleY = sprite.height / 190;
            let Scale = scaleX > scaleY ? scaleX : scaleY;
            if (Scale < 1) Scale = 1;
            this.node.getChildByName("图").getComponent(UITransform).width = sprite.width / Scale;
            this.node.getChildByName("图").getComponent(UITransform).height = sprite.height / Scale;
            this.node.getChildByName("图").getComponent(Sprite).spriteFrame = sprite;
        });
    }

    //按下
    OnClick() {
        console.log("生成" + this.Name);
        NBSYS_GameManager.Instance.InitNode(this.Name, NBSYS_GameManager.CentrePoint, NBSYS_GameManager.Instance.Bg.getChildByName(NBSYS_GameData.QiCaiData.find((da) => { return da.Name == this.Name }).Layer));
    }
}


