import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJ_Incident } from './XYMJ_Incident';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_Detail')
export class XYMJ_Detail extends Component {

    public propName: string = "";

    public removeBtn: Node = null;
    public propIcon: Sprite = null;
    public propNameLabel: Label = null;
    public propValueLabel: Label = null;

    onEnable() {
        this.removeBtn = this.node.getChildByName("RemoveBtn");
        this.propIcon = this.node.getChildByName("propIcon").getComponent(Sprite);
        this.propNameLabel = this.node.getChildByName("propName").getComponent(Label);
        this.propValueLabel = this.node.getChildByName("propValue").getComponent(Label);
    }

    update(deltaTime: number) {

    }

    initData(propData: any) {
        this.propName = propData.Name;
        this.propNameLabel.string = this.propName;
        this.propValueLabel.string = "价值【" + propData.value + "】";

        XYMJ_Incident.LoadSprite("Sprites/Prop/" + propData.Name).then((sp: SpriteFrame) => {
            this.propIcon.spriteFrame = sp;
        });
    }

    close() {
        this.node.active = false;
    }
}


