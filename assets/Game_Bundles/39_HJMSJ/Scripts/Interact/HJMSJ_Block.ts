import { _decorator, Component, director, math, Node, Sprite, SpriteFrame } from 'cc';
import { HJMSJ_Incident } from '../HJMSJ_Incident';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Block')
export class HJMSJ_Block extends Component {
    @property()
    public blockName: string = "";

    @property()
    public couldAttack: boolean = true;

    @property()
    public couldCross: boolean = true;

    @property()
    public hp: number = 0;

    @property(SpriteFrame)
    shineSpriteFrame: SpriteFrame = null;

    private curHp: number = 0;
    onLoad() {
        this.curHp = this.hp;
    }

    onAttack(damage: number) {
        if (this.curHp <= 0) {
            return;
        }

        this.curHp -= damage;
        if (this.curHp <= 0) {
            let pos = this.node.worldPosition.clone();
            console.log(pos);

            director.getScene().emit("哈基米世界_掉落物品", this.blockName, pos);

            this.node.destroy();
        }


        let crack = this.node.getChildByName("裂痕").getComponent(Sprite);
        let index = Math.floor(this.curHp / this.hp * 10);
        HJMSJ_Incident.LoadSprite("Sprites/方块裂痕/" + index).then((sp: SpriteFrame) => {
            crack.spriteFrame = sp;
        });

        this.shine();
    }

    shine() {
        let shineSprite = this.node.getChildByName("闪烁").getComponent(Sprite);
        shineSprite.spriteFrame = this.shineSpriteFrame;
        shineSprite.node.active = true;

        this.scheduleOnce(() => {
            shineSprite.node.active = false;
        }, 0.05);
    }
}


