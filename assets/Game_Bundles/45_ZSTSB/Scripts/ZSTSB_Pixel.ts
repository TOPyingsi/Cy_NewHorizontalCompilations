import { _decorator, Color, Component, director, Label, Node, NodeEventType, ParticleSystem2D, Sprite, UIOpacity, UITransform, Vec3 } from 'cc';
import { ZSTSB_GameMgr } from './ZSTSB_GameMgr';
import { ZSTSB_AudioManager } from './ZSTSB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_Pixel')
export class ZSTSB_Pixel extends Component {

    private colorIndex: number = 0;
    public get ColorIndex(): number {
        return this.colorIndex;
    }
    private pixelColor: Color = new Color();

    public sprite: Sprite = null;
    private label: Label = null;
    private isFilled: boolean = false;
    public get IsFilled(): boolean {
        // console.log("填充状态" + this.isFilled);
        return this.isFilled;
    }

    // private uiOp: UIOpacity = null;
    private spUIOp: UIOpacity = null;

    private particle: ParticleSystem2D = null;

    protected onLoad(): void {
        // this.sprite = this.node.getChildByName("图片").getComponent(Sprite);
        // this.sprite = this.node.getComponent(Sprite);
        this.label = this.node.getChildByName("数字").getComponent(Label);
        // this.particle = this.node.getChildByName("粒子").getComponent(ParticleSystem2D);
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
        if (buildingName === "2-31"
            || buildingName === "2-8"
            || buildingName === "2-81"
            || buildingName === "2-9"
            || buildingName === "2-10"
            || buildingName === "2-101") {
            this.showIndex = 3;
        }
        else {
            this.showIndex = 5;
        }

        if (color.a === 0) {
            this.pixelColor = new Color(0, 0, 0, 0);
            this.sprite.color = new Color(0, 0, 0, 0);
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
        //     this.sprite.color = this.pixelColor;
        // }, 2);

        director.getScene().on("钻石填色本_颜色填充加一", (colorIndex: number) => {
            if (this.colorIndex === colorIndex) {
                this.showLabel(true);
            }
        }, this);
    }

    showLabel(flag: boolean) {
        console.log(this.colorIndex + "显示");
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
            // console.log("填充正确像素");
            this.isFilled = true;
            this.label.string = "";

            let spriteColor = this.pixelColor;

            if (mgrColor.r === 0 && mgrColor.g === 0 && mgrColor.b === 0) {
                spriteColor = this.blackColor;
            }

            this.sprite.color = spriteColor;
            // this.sprite.color.set(spriteColor.r, spriteColor.g, spriteColor.b, spriteColor.a);

            // this.particle.startColor = spriteColor;
            // this.particle.endColor = spriteColor;

            // this.particle.node.active = true;
            // this.particle.resetSystem();

            ZSTSB_AudioManager.instance.playSFX("填涂");

            ZSTSB_GameMgr.instance.fillColor(this.colorIndex);
            ZSTSB_GameMgr.instance.ParticleEffect(this.node.worldPosition.clone(), spriteColor);

        }
        else {
            // console.log("填充错误像素");
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

        // this.particle.startColor = spriteColor;
        // this.particle.endColor = spriteColor;

        // this.particle.node.active = true; 
        // this.particle.resetSystem();

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

        // ZSTSB_GameMgr.instance.finishColorNum++;
        // director.getScene().emit("钻石填色本_颜色填充加一", ZSTSB_GameMgr.instance.finishColorNum);
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
        // this.uiOp.opacity = opacity;
        if (this.spUIOp) {
            this.spUIOp.opacity = opacity;
        }
    }

    getLabelActive() {
        return this.label.node.active;
    }
}


