import { _decorator, Component, Enum, find, Label, Node, Sprite, SpriteFrame } from 'cc';
import { TLWLSJ_WEAPONSHOW } from './TLWLSJ_Constant';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { DataManager } from '../../../Scripts/Framework/Managers/DataManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_WeaponShow')
export class TLWLSJ_WeaponShow extends Component {

    @property({ type: Enum(TLWLSJ_WEAPONSHOW) })
    Type: TLWLSJ_WEAPONSHOW = TLWLSJ_WEAPONSHOW.NON;

    protected onLoad(): void {
        if (this.Type == TLWLSJ_WEAPONSHOW.NON) return;
        this.BulletNumLabel = this.node.getChildByName("子弹数量").getComponent(Label);
        if (this.Type == TLWLSJ_WEAPONSHOW.INSTANT) {
            this.BulletSprite = find("备用子弹/子弹Icon", this.node).getComponent(Sprite);
            this.BulletNameLabel = find("备用子弹/子弹名称", this.node).getComponent(Label);
        }
    }

    //#region 瞬发子弹
    BulletNumLabel: Label = null;

    //#region 填充子弹
    BulletSprite: Sprite = null;
    BulletNameLabel: Label = null;

    showBulletNum(num: number) {
        this.BulletNumLabel.string = num.toString();
    }

    showBullet(name: string = "") {
        if (name === "") {
            this.BulletSprite.spriteFrame = null;
            this.BulletNameLabel.string = "无备用";
            return;
        }
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, "BundleSprites/子弹/" + name).then((sf: SpriteFrame) => {
            this.BulletSprite.spriteFrame = sf;
            this.BulletNameLabel.string = name;
        })
    }

}


