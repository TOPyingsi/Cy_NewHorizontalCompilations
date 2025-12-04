import { _decorator, Collider2D, Component, Contact2DType, Enum, find, instantiate, IPhysics2DContact, Node, Sprite, tween, Tween, UIOpacity, Prefab, Label, color, Color, SpriteFrame, JsonAsset, director } from 'cc';
import { HJMWK_PoolManager } from './HJMWK_PoolManager';
import { HJMWK_CUBE } from './HJMWK_Constant';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { HJMWK_GameManager } from './HJMWK_GameManager';
import { HJMWK_GameData } from './HJMWK_GameData';
import { HJMWK_Equipment } from './HJMWK_Equipment';
import HJMWK_PlayerController from './HJMWK_PlayerController';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_Cube')
export class HJMWK_Cube extends Component {

    @property(Sprite)
    ProgressSprite: Sprite = null;

    @property(UIOpacity)
    ProgressUIOpacity: UIOpacity = null;

    @property({ type: Enum(HJMWK_CUBE) })
    CubeNext: HJMWK_CUBE[] = [];

    @property({ type: [Number] })
    Probability: number[] = [];

    @property({ type: Color })
    NormalColor: Color = new Color();

    @property({ type: Color })
    LoseColor: Color = new Color();

    CurCube: HJMWK_CUBE = HJMWK_CUBE.土块;

    Collider2D: Collider2D = null;
    Sprite: Sprite = null;
    Injury: number = 0;
    HP: number = 10;

    isCollision: boolean = false;

    protected onLoad(): void {
        this.Sprite = this.getComponent(Sprite);
        this.Collider2D = this.getComponent(Collider2D);
        if (this.Collider2D) {
            this.Collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

        this.init();
    }

    getCube(): HJMWK_CUBE {
        if (this.CubeNext.length !== this.Probability.length) {
            console.error("方块和概率数组长度必须相同");
            return HJMWK_CUBE.null;
        }

        // 标准化权重
        const total = this.Probability.reduce((sum, probability) => sum + probability, 0);
        const normalizedWeights = this.Probability.map(weight => weight / total);

        // 生成随机数
        const rand = Math.random();

        // 累积概率选择
        let cumulative = 0;
        for (let i = 0; i < this.CubeNext.length; i++) {
            cumulative += normalizedWeights[i];
            if (rand <= cumulative) {
                return this.CubeNext[i];
            }
        }
        // 防止浮点精度问题
        return this.CubeNext[this.CubeNext.length - 1];
    }

    refresh() {
        if (this.Collider2D.enabled) return;
        this.unschedule(this.recoveryCube);
        this.init();
    }

    init() {
        this.CurCube = this.getCube();
        // console.error(Tools.GetEnumKeyByValue(HJMWK_CUBE, this.CurCube));
        BundleManager.LoadSpriteFrame("43_HJMWK_Bundle", `Sprites/Cubes/${Tools.GetEnumKeyByValue(HJMWK_CUBE, this.CurCube)}`).then((sf: SpriteFrame) => {
            this.Sprite.spriteFrame = sf;
        });
        this.recoveryCube();
    }

    recoveryCube() {
        this.isCollision = false;
        BundleManager.LoadJson("43_HJMWK_Bundle", "CubeData").then((jsonAsset: JsonAsset) => {
            this.HP = jsonAsset.json[Tools.GetEnumKeyByValue(HJMWK_CUBE, this.CurCube)].HP * HJMWK_GameManager.Instance.CurDiggings;
        });
        this.Collider2D.enabled = true;
        this.Collider2D.apply();
        this.Sprite.color = this.NormalColor;
    }

    loseCube() {
        this.scheduleOnce(this.recoveryCube, HJMWK_GameManager.Instance.RecoveryTime);
        this.scheduleOnce(() => {
            this.Collider2D.enabled = false;
            this.Collider2D.apply();
        })

        //获得奖励
        HJMWK_Equipment.Instance.addProp(Tools.GetEnumKeyByValue(HJMWK_CUBE, this.CurCube), HJMWK_GameManager.Instance.YieldMultiplying * HJMWK_GameManager.Instance.CurDiggings);

        this.CurCube = this.getCube();
        this.Sprite.color = this.LoseColor;
        BundleManager.LoadSpriteFrame("43_HJMWK_Bundle", `Sprites/Cubes/${Tools.GetEnumKeyByValue(HJMWK_CUBE, this.CurCube)}`).then((sf: SpriteFrame) => {
            this.Sprite.spriteFrame = sf;
        });
        // console.error(Tools.GetEnumKeyByValue(HJMWK_CUBE, this.CurCube));
    }

    updateProgress() {
        if (this.Injury >= this.HP) {
            this.ProgressSprite.fillRange = 0;
            //打爆
            this.loseCube();
            return;
        }
        this.ProgressSprite.fillRange = (this.HP - this.Injury) / this.HP;
        this.ProgressUIOpacity.opacity = 255;
        Tween.stopAllByTarget(this.ProgressUIOpacity);
        tween(this.ProgressUIOpacity)
            .delay(0.1)
            .call(() => {
                this.isCollision = false;
            })
            .delay(0.2)
            .to(0.1, { opacity: 0 }, { easing: `sineOut` })
            .start();
    }

    BeHit() {
        const skinYield: number = HJMWK_GameData.Instance.CurSkin === "哈基米" ? 0 : 0.1;
        const harm = HJMWK_PlayerController.Instance.Harm * HJMWK_GameManager.Instance.HarmMultiplying * (1 + HJMWK_GameData.Instance.userData["挖矿伤害"] * 0.1 + skinYield)
        this.Injury += harm;
        this.updateProgress();
        HJMWK_PoolManager.Instance.addHarm(this.node.getWorldPosition(), harm);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.isCollision) return;
        if (otherCollider.group == 1 << 3) {
            this.isCollision = true;
            this.BeHit();
        }
    }

    protected onEnable(): void {
        director.getScene().on("HJMWK_CubeRefresh", this.refresh, this);
    }

    protected onDisable(): void {
        director.getScene().off("HJMWK_CubeRefresh", this.refresh, this);
    }

}


