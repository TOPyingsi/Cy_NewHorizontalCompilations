import { _decorator, Color, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { BHPD_GameMgr } from '../BHPD_GameMgr';
import { ZSTSB_AudioManager } from '../../ZSTSB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('BHPD_Pixel')
export class BHPD_Pixel extends Component {
    @property(SpriteFrame)
    mask: SpriteFrame = null;

    private colorIndex: number = 0;
    public get ColorIndex(): number {
        return this.colorIndex;
    }
    private pixelColor: Color = new Color();
    private finishColor: Color = new Color();

    public sprite: Sprite = null;
    public circleSprite: Sprite = null;

    private colorLabel: Label = null;
    private isFilled: boolean = false;
    public get IsFilled(): boolean {
        // console.log("填充状态" + this.isFilled);
        return this.isFilled;
    }

    private isFinish: boolean = false;
    public get IsFinish(): boolean {
        // console.log("填充状态" + this.isFilled);
        return this.isFinish;
    }

    showIndex: number = 5;
    // initData(color: Color, colorIndex: number, sprite: Sprite, fillState?: boolean) {
    initData(grayColor: { r: number; g: number; b: number; a: number; },
        color: Color, colorIndex: number, fillState?: boolean) {

        this.colorIndex = colorIndex;

        this.sprite = this.node.getComponent(Sprite);
        this.colorLabel = this.node.getChildByName("数字").getComponent(Label);
        this.circleSprite = this.node.getChildByName("Circle").getComponent(Sprite);

        // let buildingName = ZSTSB_GameMgr.instance.curBuildingName;

        if (color.a === 0) {
            this.pixelColor = new Color(255, 255, 255, 255);
            this.sprite.color = new Color(255, 255, 255, 255);
            this.isFinish = true;
            this.isFilled = true;
            this.colorLabel.string = "";
            return;
        }
        else {
            this.pixelColor = color;
            this.colorLabel.string = colorIndex.toString();
            this.finishColor = new Color(grayColor.r, grayColor.g, grayColor.b, grayColor.a);
        }

        if (fillState) {
            this.Filled();
        } else {
            let spriteColor = this.pixelColor;
            this.sprite.color = new Color(spriteColor.r, spriteColor.g, spriteColor.b, spriteColor.a);
            this.circleSprite.color = new Color(spriteColor.r, spriteColor.g, spriteColor.b, spriteColor.a);
            this.circleSprite.node.active = false;
        }

        // this.scheduleOnce(() => {
        //     this.isFilled = true;
        //     this.circleSprite.node.active = true;
        //     BHPD_GameMgr.instance.couldFire = true;
        //     // this.sprite.spriteFrame = this.mask;
        //     // this.sprite.color = this.finishColor;
        // }, 2);

    }

    isFirst: boolean = true;
    blackColor: Color = new Color(1, 1, 1, 255);
    onFill() {
        if (this.isFilled) {
            return;
        }

        let mgrColor = BHPD_GameMgr.instance.curColor;
        if (this.pixelColor.r === mgrColor.r
            && this.pixelColor.g === mgrColor.g
            && this.pixelColor.b === mgrColor.b
            && this.pixelColor.a === mgrColor.a) {
            this.isFilled = true;

            let spriteColor = this.pixelColor;

            if (mgrColor.r === 0 && mgrColor.g === 0 && mgrColor.b === 0) {
                spriteColor = this.blackColor;
            }

            this.circleSprite.node.active = true;
            this.colorLabel.string = "";

            ZSTSB_AudioManager.instance.playSFX("填涂");

            BHPD_GameMgr.instance.fillColor(this.colorIndex);

        }
    }

    onTextFill() {
        this.isFilled = true;

        this.circleSprite.node.active = true;
        this.colorLabel.string = "";

        ZSTSB_AudioManager.instance.playSFX("填涂");

        BHPD_GameMgr.instance.fillColor(this.colorIndex);
    }

    //被熨斗烫时
    onFire() {
        if (this.isFinish) {
            return;
        }

        this.isFinish = true;
        this.sprite.color = this.finishColor;
        this.circleSprite.node.active = false;

        ZSTSB_AudioManager.instance.playIron();

        BHPD_GameMgr.instance.onFire();
    }

    onTextFire() {
        this.isFinish = true;
        this.sprite.color = this.finishColor;
        this.circleSprite.node.active = false;

        ZSTSB_AudioManager.instance.playIron();

        BHPD_GameMgr.instance.onFire();
    }

    Filled() {
        this.isFilled = true;

        let spriteColor = this.pixelColor;

        if (spriteColor.r === 0 && spriteColor.g === 0 && spriteColor.b === 0 && spriteColor.a === 255) {
            spriteColor = this.blackColor;
        }

        this.sprite.color = spriteColor;

    }

    reset() {
        this.isFilled = false;
        this.isFinish = false;
        this.circleSprite.node.active = false;
        this.sprite.color = Color.WHITE;
        this.pixelColor = Color.WHITE;
    }

}


