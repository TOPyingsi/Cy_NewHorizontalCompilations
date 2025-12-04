// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Node, Component, Sprite, SpriteFrame, Vec3, tween, Animation, v3, UIOpacity, randomRangeInt, clamp, randomRange, Tween } from "cc";
import SWMCQ_GameData from "./SWMCQ_GameData";
import SWMCQ_GameScene from "./SWMCQ_GameScene";
import { PoolManager } from "db://assets/Scripts/Framework/Managers/PoolManager";

const { ccclass, property } = _decorator;

@ccclass("Guest")
export default class Guest extends Component {

    @property(Sprite)
    patient: Sprite = null;

    @property(Sprite)
    head: Sprite = null;

    @property(Sprite)
    body: Sprite = null;

    @property(Animation)
    ani: Animation = null;

    @property(Node)
    ask: Node = null;

    @property(Node)
    punch: Node = null;

    @property([SpriteFrame])
    headSf: SpriteFrame[] = [];

    @property([SpriteFrame])
    bodySf: SpriteFrame[] = [];

    @property([SpriteFrame])
    angrySf: SpriteFrame[] = [];

    characterNum = 0;
    num = -1;
    patientPart = 0;
    price = 0;
    AskNum: number[] = [];
    GetNum: number[] = [];

    isAsk = false;
    isEnd = false;
    isTutorial = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    protected onEnable(): void {
        this.isTutorial = false;
        this.isAsk = false;
        this.isEnd = false;
        this.AskNum = [];
        this.GetNum = [];
        this.price = 0;
        this.characterNum = Math.floor(SWMCQ_GameData.randomRange(0, this.bodySf.length));
        // this.characterNum = 2;
        if (this.head) this.head.spriteFrame = this.headSf[this.characterNum];
        this.body.spriteFrame = this.bodySf[this.characterNum];
    }

    // update (dt) {}

    Walk(pos: Vec3) {
        this.ani.play("Walk");
        var v = v3();
        tween(this.node)
            .to(3, { position: pos })
            .call(() => {
                this.node.setParent(SWMCQ_GameScene.Instance.guestWait);
            })
            .to(2, { scale: Vec3.multiplyScalar(v, Vec3.ONE, 0.8) })
            .call(() => {
                this.Ask();
            })
            .start();
    }

    Ask() {
        var gameScene = SWMCQ_GameScene.Instance;
        if (gameScene.tutorial.active) gameScene.TutorialNext();
        this.isAsk = true;
        // this.AskNum = Math.floor(GameData.randomRange(0, GameData.clamp(3, 1, GameData.Instance.Datas[1] + 1)));
        // this.AskNum = 0;
        if (this.isTutorial) {
            var length = 1;
            this.AskNum = [0];
            this.GetNum = [0];
            let sprite = this.ask.children[0].getComponent(Sprite);
            sprite.spriteFrame = gameScene.foods[0];
            sprite.grayscale = false;
        }
        else {
            var length = randomRangeInt(1, 11);
            length = length < 6 ? 1 : length < 9 ? 2 : 3;
            for (let i = 0; i < length; i++) {
                let num = randomRangeInt(0, gameScene.foods.length + 3);
                num = clamp(num - 3, 0, gameScene.foods.length + 3);
                this.AskNum.push(num);
                this.GetNum.push(0);
                let node = this.ask.children[i];
                node.active = true;
                let sprite = node.getComponent(Sprite);
                sprite.spriteFrame = gameScene.foods[num];
                sprite.grayscale = false;
            }
        }
        for (let i = length; i < this.ask.children.length; i++) {
            const element = this.ask.children[i];
            element.active = false;
        }
        var v = v3();
        tween(this.ask)
            .to(0.25, { scale: Vec3.multiplyScalar(v, v3(1.5, 1.5, 1.5), 0.7) })
            .start();
        if (!this.isTutorial) this.Wait();
    }

    Wait() {
        this.ani.play("Wait");
        this.patientPart = 0;
        this.patient.fillRange = 0;
        tween(this.patient.node.parent.getComponent(UIOpacity))
            .to(0.25, { opacity: 255 })
            .start();
        this.schedule(this.Patient, 3, 9);
    }

    Patient() {
        this.patientPart += 0.1;
        this.patient.fillRange = this.patientPart;
        console.log(this.patientPart);
        if (this.patientPart == 0.5 && this.head) this.head.spriteFrame = this.angrySf[this.characterNum];
        if (this.patientPart > 0.95) this.Leave();
    }

    GetFood(num: number, swmNum: number) {
        var gameScene = SWMCQ_GameScene.Instance;
        this.GetNum[num] = 1;
        this.ask.children[num].getComponent(Sprite).grayscale = true;
        var foodNum = gameScene.foodSfs.indexOf(gameScene.foods[this.AskNum[num]]);
        switch (foodNum) {
            case 0:
                var coin = SWMCQ_GameData.Instance.Datas[4];
                if (gameScene.cakeStates[swmNum][2]) coin += 3;
                if (gameScene.cakeStates[swmNum][3]) coin += 2;
                this.price += coin;
                break;
            case 1:
                this.price += 5;
                break;
            case 2:
                this.price += 6;
                break;
            case 3:
            case 4:
            case 5:
                this.price += 9;
                break;

        }
        if (this.GetNum.every((value, index, array) => { return value == 1 })) this.GetLeave();
    }

    GetLeave() {
        this.unscheduleAllCallbacks();
        if (this.head) this.head.spriteFrame = this.headSf[this.characterNum];
        this.Leave(true);
    }

    Leave(isFinish = false) {
        this.isEnd = true;
        var gameScene = SWMCQ_GameScene.Instance;
        if (isFinish) gameScene.GuestCoin(this.num, this.price);
        gameScene.guestDatas[this.num] = null;
        tween(this.patient.node.parent.getComponent(UIOpacity))
            .to(0.25, { opacity: 0 })
            .start();
        tween(this.ask)
            .to(0.25, { scale: Vec3.ZERO })
            .start();
        var num = Math.floor(SWMCQ_GameData.randomRange(0, gameScene.guestSummons.length));
        var pos = gameScene.guestSummons[num].position;
        this.ani.play("Walk");
        var v = v3();
        tween(this.node)
            .to(2, { scale: Vec3.multiplyScalar(v, Vec3.ONE, 0.6) })
            .to(3, { position: pos })
            .call(() => {
                this.scheduleOnce(() => {
                    PoolManager.PutNode(this.node);
                    if (gameScene.getPunch) this.node.off(Node.EventType.TOUCH_START, gameScene.DragStart, this);
                });
            })
            .start();
    }

    ClearTime() {
        if (!this.isAsk || this.isEnd) return;
        this.unschedule(this.Patient);
        this.Wait();
        this.punch.active = true;
        this.punch.angle = randomRange(0, 360);
        var hit = this.punch.children[0];
        var pun = this.punch.children[1];
        pun.active = true;
        Tween.stopAllByTarget(pun);
        pun.setPosition(v3(200, 0));
        tween(pun)
            .to(0.25, { position: Vec3.ZERO })
            .call(() => {
                pun.active = false;
                hit.active = true;
                this.scheduleOnce(() => {
                    hit.active = false;
                    this.punch.active = false;
                }, 0.25);
            })
            .start();
    }
}
