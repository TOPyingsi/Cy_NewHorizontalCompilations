import { _decorator, Component, director, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJXXB_Incident } from './XYMJXXB_Incident';
import { XYMJXXB_GameData } from './XYMJXXB_GameData';
const { ccclass, property } = _decorator;


@ccclass('XYMJXXB_Prop')
export class XYMJXXB_Prop extends Component {

    public propName: string = "";

    public propValue: number = 0;

    //白绿蓝紫红神
    public propType: string = "";

    public propIcon: Sprite = null;

    onLoad() {
        this.propIcon = this.node.getChildByName("PropIcon").getComponent(Sprite);
    }

    initData(propData: any) {
        this.propName = propData.Name;
        this.propValue = propData.value;
        this.propType = propData.type;

        XYMJXXB_Incident.LoadSprite("/Sprites/Prop/" + propData.Name).then((sp: SpriteFrame) => {
            console.log(sp);
            this.setSpriteFrame(sp);
        });
    }

    setSpriteFrame(sp: SpriteFrame) {
        if (this.propIcon) {
            this.propIcon.spriteFrame = sp;
        }

    }

    getProp() {
        this.node.getChildByName("PropIcon").active = false;
        director.getScene().emit("校园摸金_更新战获");

        console.log(XYMJXXB_GameData.Instance.KnapsackData);
    }
}


