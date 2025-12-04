import { _decorator, Collider2D, Component, Contact2DType, Enum, find, instantiate, IPhysics2DContact, Node, Sprite, tween, Tween, UIOpacity, Prefab, Label } from 'cc';
import SJNDGZ_PlayerController from './SJNDGZ_PlayerController';
import { SJNDGZ_GROUP, SJNDGZ_PROP } from './SJNDGZ_Constant';
import { SJNDGZ_HarmText } from './SJNDGZ_HarmText';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { SJNDGZ_GameManager } from './SJNDGZ_GameManager';
import { SJNDGZ_JF } from './SJNDGZ_JF';
import { SJNDGZ_Tool } from './SJNDGZ_Tool';
import { SJNDGZ_GameData } from './SJNDGZ_GameData';
import { SJNDGZ_UIController } from './SJNDGZ_UIController';
import { SJNDGZ_Equipment } from './SJNDGZ_Equipment';
const { ccclass, property } = _decorator;

@ccclass('SJNDGZ_Cube')
export class SJNDGZ_Cube extends Component {

    @property(Sprite)
    ProgressSprite: Sprite = null;

    @property(UIOpacity)
    ProgressUIOpacity: UIOpacity = null;

    @property({ type: Enum(SJNDGZ_PROP) })
    AwardProp: SJNDGZ_PROP = SJNDGZ_PROP.无;

    @property
    Num: number = 0;

    @property
    Probability: number = 0.5;

    @property
    HP: number = 0;

    HPLabel: Label = null;

    Collider2D: Collider2D = null;

    Injury: number = 0;

    protected onLoad(): void {
        this.Collider2D = find("Icon", this.node).getComponent(Collider2D);
        this.Collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.Collider2D.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        this.HPLabel = find("text", this.node).getComponent(Label);
        this.HPLabel.string = "HP" + SJNDGZ_Tool.formatNumber(this.HP);
    }

    updateProgress() {
        if (this.Injury >= this.HP) {
            const count = this.Injury / this.HP;//打爆次数
            this.Injury = this.Injury % this.HP;
            SJNDGZ_JF.Instance.addJF(1);
            const name = SJNDGZ_Tool.GetEnumKeyByValue(SJNDGZ_PROP, this.AwardProp);
            SJNDGZ_GameData.Instance.userData[name] += this.Num;
            SJNDGZ_UIController.Instance.showCup();
            // SJNDGZ_Equipment.Instance.show();
        }
        this.ProgressSprite.fillRange = (this.HP - this.Injury) / this.HP;
        this.ProgressUIOpacity.opacity = 255;
        Tween.stopAllByTarget(this.ProgressUIOpacity);
        tween(this.ProgressUIOpacity)
            .delay(1)
            .to(0.1, { opacity: 0 }, { easing: `sineOut` })
            .start();
    }

    BeHit(harm: number) {
        this.Injury += harm
        this.updateProgress();
        BundleManager.LoadPrefab("12_SJNDGZ_Bundle", "伤害").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = SJNDGZ_GameManager.Instance.Canvas;
            node.getComponent(SJNDGZ_HarmText).show(this.node.getWorldPosition().clone(), harm);
        })
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == SJNDGZ_GROUP.SJNDGZ_PICKAXE) {
            SJNDGZ_PlayerController.Instance.TargetCube = this;
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == SJNDGZ_GROUP.SJNDGZ_PICKAXE) {
            SJNDGZ_PlayerController.Instance.TargetCube = null;
        }
    }

}


