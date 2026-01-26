import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_Constant } from './SJZXD_Constant';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_SkinBox')
export class SJZXD_SkinBox extends Component {
    public SkinName: string = "";
    public SkinData: { Name: string, Price: number, Quality: string, AddHP: number } = null;
    private skinPanel: Node = null;
    Init(Name: string, skinPanel: Node) {
        this.skinPanel = skinPanel;
        this.SkinName = Name;
        this.SkinData = SJZXD_Constant.getSkinDataByName(Name);
        SJZXD_Incident.LoadSprite("Sprites/皮肤/" + this.SkinData.Quality).then((sp: SpriteFrame) => {
            this.node.getChildByName("Bg").getComponent(Sprite).spriteFrame = sp;
        });
        SJZXD_Incident.LoadSprite("Sprites/皮肤/皮肤图像/" + this.SkinData.Name).then((sp: SpriteFrame) => {
            this.node.getChildByName("图").getComponent(Sprite).spriteFrame = sp;
        });
        SJZXD_Incident.LoadSprite("Sprites/皮肤/文本/" + this.SkinData.Quality).then((sp: SpriteFrame) => {
            this.node.getChildByName("品质图").getComponent(Sprite).spriteFrame = sp;
        });
        this.node.getChildByName("名字").getComponent(Label).string = this.SkinData.Name;
        this.node.parent.on("皮肤_选中", this.OnSelect, this);
    }
    OnSelect(Name: string) {
        if (Name == this.SkinName) {
            this.node.getChildByName("选中框").active = true;
        } else {
            this.node.getChildByName("选中框").active = false;
        }

    }

    ButtomClick() {
        this.node.parent.emit("皮肤_选中", this.SkinName);
        this.skinPanel.emit("皮肤_选中", this.SkinName);
    }

}


