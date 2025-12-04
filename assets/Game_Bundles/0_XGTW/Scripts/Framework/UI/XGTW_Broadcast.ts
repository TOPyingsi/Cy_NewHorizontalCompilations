import { _decorator, Vec3, v3, Component, Sprite, Label, Vec2, SpriteFrame, Tween, tween, UIOpacity } from 'cc';
import { BundleManager } from '../../../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../../../Scripts/GameManager';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
const { ccclass, property } = _decorator;

const oriPos: Vec3 = v3(0, 100, 0);

@ccclass('XGTW_Broadcast')
export default class XGTW_Broadcast extends Component {
    mask: Sprite | null = null!;
    tipLb: Label | null = null!;
    onLoad() {
        this.mask = this.node.getChildByName(`Mask`).getComponent(Sprite);
        this.tipLb = this.node.getChildByName(`TipLb`).getComponent(Label);
    }
    Show(content: string, path: string, position: Vec2, delay: number = 0.75, tweenType: number = 1) {
        this.node.addComponent(UIOpacity).opacity = 255;

        this.tipLb.string = `${content}`;

        if (Tools.IsEmptyStr(path)) {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/个性化枪械/Common_Broadcast`).then((sf: SpriteFrame) => {
                this.mask.spriteFrame = sf;
            });
        } else {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/个性化枪械/${path}`).then((sf: SpriteFrame) => {
                this.mask.spriteFrame = sf;
            });
        }

        this.node.setScale(0, 0, 0);
        this.node.setPosition(v3(position.x, position.y));
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .to(0.5, { scale: Vec3.ONE, position: v3(position.x - 250, position.y) }, { easing: `elasticOut` })
            .delay(delay)
            .to(0.25, { position: v3(position.x - 250, position.y + 250), scale: Vec3.ZERO })
            .call(() => {
                PoolManager.PutNode(this.node);
            })
            .start();
        tween(this.node.getComponent(UIOpacity))
            .delay(0.5 + delay)
            .to(0.25, { opacity: 0 })
            .start();

        // switch (tweenType) {
        //     case 1:
        //         this.ShowTween1(delay);
        //         break;
        //     case 2:
        //         this.ShowTween2(delay);
        //         break;
        //     default:
        //         this.ShowTween1(delay);
        //         break;
        // }
    }
    ShowTween1(delay: number = 0.75) {
        this.node.setScale(0, 0, 0);
        this.node.setPosition(oriPos);
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .to(0.5, { scale: Vec3.ONE }, { easing: `elasticOut` })
            .delay(delay)
            .to(0.25, { position: v3(250, 0), scale: Vec3.ZERO })
            .call(() => {
                PoolManager.PutNode(this.node);
            })
            .start();
    }
    ShowTween2(delay: number = 0.75) {
        this.node.setScale(Vec3.ONE);
        this.node.setPosition(oriPos);
        Tween.stopAllByTarget(this.node);
        tween(this.node).delay(delay).to(0.25, { position: v3(0, 250) }).call(() => { PoolManager.PutNode(this.node); }).start();
        if (!this.node.getComponent(UIOpacity)) this.node.addComponent(UIOpacity);
        tween(this.node.getComponent(UIOpacity)).delay(delay).to(0.25, { opacity: 0 }).start();
    }
}