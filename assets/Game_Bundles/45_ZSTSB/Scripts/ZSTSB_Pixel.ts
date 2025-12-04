import { _decorator, Color, Component, director, Label, Node, NodeEventType, ParticleSystem2D, Sprite, UIOpacity, UITransform, v3, Vec3 } from 'cc';
import { ZSTSB_GameMgr } from './ZSTSB_GameMgr';
import { ZSTSB_AudioManager } from './ZSTSB_AudioManager';
import { ZSTSB_GameData } from './ZSTSB_GameData';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_Pixel')
export class ZSTSB_Pixel extends Component {

    private colorIndex: number = 0;
    public get ColorIndex(): number {
        return this.colorIndex;
    }
    private pixelColor: Color = new Color();

    public sprite: Sprite = null;
    private label: Label = null
    private isFilled: boolean = false;
    public get IsFilled(): boolean {
        // console.log("填充状态" + this.isFilled);
        return this.isFilled;
    }

    // private uiOp: UIOpacity = null;
    private spUIOp: UIOpacity = null;

    private particle: ParticleSystem2D = null;

    protected onLoad(): void {
        this.label = this.node.getChildByName("数字").getComponent(Label);
        this.changeUIOpacity(0);
    }

    showIndex: number = 5;
    // initData(color: Color, colorIndex: number, sprite: Sprite, fillState?: boolean) {
    initData(sp: Sprite, grayColor: { r: number; g: number; b: number; a: number; },
        color: Color, colorIndex: number, fillState?: boolean) {

        this.colorIndex = colorIndex;

        this.sprite = sp;

        this.spUIOp = this.sprite.getComponent(UIOpacity);

        let buildingName = ZSTSB_GameMgr.instance.curBuildingName;
        let showNum = ZSTSB_GameData.getShowNumByName(buildingName);
        this.showIndex = showNum;

        if (color.a === 0) {
            this.pixelColor = new Color(0, 0, 0, 0);
            this.sprite.color = new Color(0, 0, 0, 0);
            return;
        }
        else {
            this.pixelColor = color;
            if (this.colorIndex > this.showIndex) {
                this.label.node.active = false;
            }
            else {
                this.label.node.active = true;
            }
            this.label.string = this.colorIndex.toString();
            this.changeUIOpacity(255);
        }

        if (fillState) {
            this.Filled();
        } else {
            let spriteColor = grayColor;
            this.sprite.color = new Color(spriteColor.r, spriteColor.g, spriteColor.b, spriteColor.a);
        }

        // this.scheduleOnce(() => {
        //     if (this.colorIndex === 10) {
        //         console.log(this.pixelColor);
        //     }
        // }, 2);

        director.getScene().on("钻石填色本_颜色填充加一", (colorIndex: number) => {
            if (this.colorIndex === colorIndex) {
                this.showLabel(true);
            }
        }, this);
    }

    showLabel(flag: boolean) {
        // console.log(this.colorIndex + "显示");
        this.label.node.active = flag;
    }

    blackColor: Color = new Color(1, 1, 1, 255);
    onFill() {
        if (this.isFilled) {
            return;
        }

        if (!this.label.node.active) {
            return;
        }

        let mgrColor = ZSTSB_GameMgr.instance.curColor;
        if (this.pixelColor.r === mgrColor.r
            && this.pixelColor.g === mgrColor.g
            && this.pixelColor.b === mgrColor.b
            && this.pixelColor.a === mgrColor.a) {
            this.isFilled = true;
            this.label.string = "";

            let spriteColor = this.pixelColor;

            if (mgrColor.r === 0 && mgrColor.g === 0 && mgrColor.b === 0) {
                spriteColor = this.blackColor;
            }

            this.sprite.color = spriteColor;

            ZSTSB_AudioManager.instance.playSFX("填涂");

            if (ZSTSB_GameData.Instance.isGameFirst && ZSTSB_GameMgr.instance.isFirstFill) {
                ZSTSB_GameMgr.instance.isFirstFill = false;
                director.getScene().emit("钻石填色本_新手教程");
            }


            ZSTSB_GameMgr.instance.fillColor(this.colorIndex);
            ZSTSB_GameMgr.instance.ParticleEffect(this.node.worldPosition.clone(), spriteColor);

        }
    }

    onPropFill() {
        if (!this.label.node.active) {
            return;
        }

        this.isFilled = true;
        this.label.string = "";
        let spriteColor = this.pixelColor;

        if (spriteColor.r === 0 && spriteColor.g === 0 && spriteColor.b === 0) {
            spriteColor = this.blackColor;
        }

        this.sprite.color = spriteColor;

        ZSTSB_GameMgr.instance.fillColor(this.colorIndex);
        ZSTSB_GameMgr.instance.ParticleEffect(this.node.worldPosition.clone(), spriteColor);

        // ZSTSB_AudioManager.instance.playSFX("填涂");

    }

    Filled() {
        this.isFilled = true;
        this.label.string = "";

        let spriteColor = this.pixelColor;

        if (spriteColor.r === 0 && spriteColor.g === 0 && spriteColor.b === 0 && spriteColor.a === 255) {
            spriteColor = this.blackColor;
        }

        this.sprite.color = spriteColor;

    }

    reset() {
        this.isFilled = false;
        this.label.string = "";
        this.showLabel(false);
        this.sprite.color = Color.WHITE;
        this.pixelColor = Color.WHITE;
        this.changeUIOpacity(0);
    }

    changeUIOpacity(opacity: number) {
        if (this.spUIOp) {
            this.spUIOp.opacity = opacity;
        }
    }

    getLabelActive() {
        return this.label.node.active;
    }
}


