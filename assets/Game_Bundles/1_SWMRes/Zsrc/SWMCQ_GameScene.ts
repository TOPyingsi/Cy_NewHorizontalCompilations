// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Node, Component, Animation, Prefab, Label, Sprite, Vec2, macro, AudioSource, Vec3, UIOpacity, tween, v3, v2, Tween, AnimationClip, Event, EventTouch, UITransform, view, SpriteFrame, clamp } from "cc";
import SWMCQ_Coin from "./SWMCQ_Coin";
import SWMCQ_GameData, { Upgrades } from "./SWMCQ_GameData";
import SWMCQ_GameUI from "./SWMCQ_GameUI";
import SWMCQ_Guest from "./SWMCQ_Guest";
import GameData2 from "./SWMCQ_GameData";
import Guest from "./SWMCQ_Guest";
import { ProjectEventManager, ProjectEvent } from "db://assets/Scripts/Framework/Managers/ProjectEventManager";
import Banner from "db://assets/Scripts/Banner";
import { PoolManager } from "db://assets/Scripts/Framework/Managers/PoolManager";

const { ccclass, property } = _decorator;

@ccclass("GameScene")
export default class GameScene extends Component {

    public static get Instance(): GameScene {
        return this.instance;
    }

    private static instance: GameScene;

    public set CutPotato(bool: boolean) {
        var ani = this.potato.getComponent(Animation);
        if (this.cutPotato != bool) {
            var node = this.potato.children[0].children[0];
            if (this.cutTime < this.potatoTime) {
                var state = ani.getState("Hand");
                if (bool) state.wrapMode = AnimationClip.WrapMode.Normal, node.active = true;
                else state.wrapMode = AnimationClip.WrapMode.Reverse, node.active = false;
                ani.play("Hand");
            }
            else {
                ani.play("Finish"), this.cutFinish = true, node.active = false;
                if (this.tutorial.active) this.TutorialNext();
            }
        }
        this.cutPotato = bool;
    }

    @property([Node])
    ingredients: Node[] = [];

    @property([Node])
    ingredientsAdd: Node[] = [];

    @property([Node])
    ingredientsNeed: Node[] = [];

    @property([Node])
    guestSummons: Node[] = [];

    @property([Node])
    guestWaits: Node[] = [];

    @property([Prefab])
    ingredientPres: Prefab[] = [];

    @property([Prefab])
    coinPres: Prefab[] = [];

    @property([SpriteFrame])
    foodSfs: SpriteFrame[] = [];

    @property(Node)
    guestPanel: Node = null;

    @property(Node)
    guestWait: Node;

    @property(Node)
    bg: Node = null;

    @property(Node)
    meat: Node = null;

    @property(Node)
    knife: Node = null;

    @property(Node)
    assistant: Node = null;

    @property(Node)
    potato: Node = null;

    @property(Node)
    fryMech: Node = null;

    @property(Node)
    cakes: Node = null;

    @property(Node)
    panel: Node = null;

    @property(Node)
    package: Node = null;

    @property(Node)
    sandwiches: Node;

    @property(Node)
    tutorial: Node;

    @property(Node)
    rightWall: Node;

    @property(Node)
    grenadine: Node;

    @property(Node)
    tea: Node = null;

    @property(Node)
    banana: Node = null;

    @property(Node)
    frenchFry: Node = null;

    @property(Node)
    drinksMach: Node = null;

    @property(Node)
    cups: Node = null;

    @property(Node)
    walls: Node = null;

    @property(Node)
    iron: Node = null;

    @property(Node)
    touchSprite: Node = null;

    @property(Node)
    coinPanel: Node = null;

    @property(Node)
    autoPanel: Node = null;

    @property(Node)
    wisp: Node = null;

    @property(Node)
    head: Node = null;

    @property(Prefab)
    pointPre: Prefab = null;

    @property(Prefab)
    cakePre: Prefab = null;

    @property(Prefab)
    packPre: Prefab = null;

    @property(Prefab)
    sandwithPre: Prefab = null;

    @property(Prefab)
    guestPres: Prefab = null;

    @property(Label)
    fryLabel: Label = null;

    @property(Label)
    dayLabel: Label = null;

    @property(Label)
    timeLabel: Label = null;

    @property(Label)
    tutorialLabel: Label = null;

    @property(Sprite)
    cutProgress: Sprite = null;

    guestDatas = [
        null,
        null,
        null,
        null
    ]

    ingredient = [0, 0, 0, 0];
    cakeItems = [0, 0, 0, 0];
    cakeItems2 = [0, 0, 0, 0];
    itemPart = [4, 4, 4, 20];
    tutorialText = [
        "准备好帮助老爹成为新的传奇了吗",
        "让我们拖动刀上下滑动就可以切下肉片了",
        "长按可以切土豆，切完土豆之后需要等待炸机把土豆炸熟",
        "我们需要先等待薯条炸好",
        "点击炸好的薯条，把薯条装进篮子里",
        "点击员工，再点击展示的食材可以对制作沙威玛需要的材料进行补货",
        "食材准备好了，让我们开始制作第一个沙威玛吧",
        "食盘上每种食材点击一次就可以完整添加配料了",
        "点击卷饼把它卷好",
        "最后再拖动包装对制作好的沙威玛进行包装",
        "",
        "有客人出现了，把我们制作好的沙威玛拖给需要的客人吧",
        "柜台的硬币也要及时收取"
    ]

    max = 40;
    potatoTime = 6;
    fryTime = 12;
    guestLength = 3;
    dragLength = 0;
    cutTime = 0;
    fringTime = 0;
    guestNum = 0;
    time = 0;
    tutorialNum = 0;
    drinkTime = 5;
    cookTime = 5;
    AutoTime = 0;

    isIngredients = [false, false, false, false];
    drinkItems = [
        [false, 0],
        [false, 0]
    ]
    //卷起、包装、石榴酱、烤、烤完成度、沙威玛、烤完到目标的
    cakeStates: (boolean | number | Node)[][] = [];
    callAss = false;
    cutPotato = false;
    cutFinish = false;
    fryReady = false;
    usingGrenadine = false;
    usingPack = false;
    getPunch = false;

    startPos: Vec3;
    grenadinePos: Vec3;
    cake: Node;
    pack: Node;
    coins: Node[] = [];
    foods: SpriteFrame[] = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        GameScene.instance = this;
        this.CheckUpgrades();
        macro.ENABLE_MULTI_TOUCH = false;
        this.InitDrag();
        this.SetSibling();
        if (SWMCQ_GameData.Instance.Tutorial) this.InitTime();
        else {
            this.tutorial.active = true;
            this.tutorialLabel.string = this.tutorialText[this.tutorialNum];
            this.fryTime = 5;
        }
    }

    SetSibling() {
        this.cakes.setSiblingIndex(99999);
    }

    CheckUpgrades() {
        if (GameData2.Instance.Upgrades.get(Upgrades.knife)[1]) {
            this.itemPart[0] = 8;
            this.knife.children[0].active = false;
            this.knife.children[1].active = true;
        }
        if (GameData2.Instance.Upgrades.get(Upgrades.assistant)[1]) this.itemPart[1] = 8, this.itemPart[2] = 8;
        if (GameData2.Instance.Upgrades.get(Upgrades.potato)[1]) this.potatoTime = 3;
        if (GameData2.Instance.Upgrades.get(Upgrades.fryMach)[1]) this.fryTime = 6;
        if (GameData2.Instance.Upgrades.get(Upgrades.FthGuest)[1]) this.rightWall.active = false, this.guestLength = 4;
        if (GameData2.Instance.Upgrades.get(Upgrades.grenadine)[1]) this.grenadine.active = true;
        if (GameData2.Instance.Upgrades.get(Upgrades.tea)[1]) this.tea.active = true;
        if (GameData2.Instance.Upgrades.get(Upgrades.banana)[1]) this.banana.active = true;
        if (GameData2.Instance.Upgrades.get(Upgrades.frenchFry)[1]) this.frenchFry.active = true;
        if (GameData2.Instance.Upgrades.get(Upgrades.package)[1]) {
            this.package.children[0].active = false;
            this.package.children[1].active = true;
        }
        if (GameData2.Instance.Upgrades.get(Upgrades.drinksMach)[1]) this.drinksMach.active = true, this.cups.active = true;
        if (GameData2.Instance.Upgrades.get(Upgrades.wall)[1]) this.walls.children[1].active = true;
        if (GameData2.Instance.Upgrades.get(Upgrades.iron)[1]) this.iron.active = true;
        if (GameData2.Instance.Upgrades.get(Upgrades.punch)[1]) this.getPunch = true;
        for (let i = 0; i < this.foodSfs.length; i++) {
            const element = this.foodSfs[i];
            if (i == 0 || ((i < 4 || i > 5) && GameData2.Instance.Upgrades.get(element.name)[1])) this.foods.push(element);
            else if ((i == 4 || i == 5) && GameData2.Instance.Upgrades.get(Upgrades.drinksMach)[1]) this.foods.push(element);
        }
    }

    InitDrag() {
        this.knife.on(Node.EventType.TOUCH_START, this.DragStart, this);
        this.knife.on(Node.EventType.TOUCH_MOVE, this.DragMove, this);
        this.knife.on(Node.EventType.TOUCH_END, this.DragEnd, this);
        this.knife.on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
        this.potato.on(Node.EventType.TOUCH_START, this.DragStart, this);
        this.potato.on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
        this.potato.on(Node.EventType.TOUCH_END, this.DragEnd, this);
        this.guestPanel.on(Node.EventType.TOUCH_START, this.DragStart, this);
        this.guestPanel.on(Node.EventType.TOUCH_MOVE, this.DragMove, this);
        this.guestPanel.on(Node.EventType.TOUCH_END, this.DragEnd, this);
        this.guestPanel.on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
        if (this.grenadine.active) {
            this.grenadine.on(Node.EventType.TOUCH_START, this.DragStart, this);
            this.grenadine.on(Node.EventType.TOUCH_MOVE, this.DragMove, this);
            this.grenadine.on(Node.EventType.TOUCH_END, this.DragEnd, this);
            this.grenadine.on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
        }
        if (this.tea.active) {
            this.tea.on(Node.EventType.TOUCH_START, this.DragStart, this);
            this.tea.on(Node.EventType.TOUCH_MOVE, this.DragMove, this);
            this.tea.on(Node.EventType.TOUCH_END, this.DragEnd, this);
            this.tea.on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
        }
        if (this.banana.active) {
            this.banana.on(Node.EventType.TOUCH_START, this.DragStart, this);
            this.banana.on(Node.EventType.TOUCH_MOVE, this.DragMove, this);
            this.banana.on(Node.EventType.TOUCH_END, this.DragEnd, this);
            this.banana.on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
        }
        if (this.frenchFry.active) {
            this.frenchFry.on(Node.EventType.TOUCH_START, this.DragStart, this);
            this.frenchFry.on(Node.EventType.TOUCH_MOVE, this.DragMove, this);
            this.frenchFry.on(Node.EventType.TOUCH_END, this.DragEnd, this);
            this.frenchFry.on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
        }
        if (this.package.children[0].active) {
            this.package.children[0].on(Node.EventType.TOUCH_START, this.DragStart, this);
            this.package.children[0].on(Node.EventType.TOUCH_MOVE, this.DragMove, this);
            this.package.children[0].on(Node.EventType.TOUCH_END, this.DragEnd, this);
            this.package.children[0].on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
        }
        if (this.drinksMach.active) {
            this.cups.children[1].on(Node.EventType.TOUCH_START, this.DragStart, this);
            this.cups.children[1].on(Node.EventType.TOUCH_MOVE, this.DragMove, this);
            this.cups.children[1].on(Node.EventType.TOUCH_END, this.DragEnd, this);
            this.cups.children[1].on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
            this.cups.children[2].on(Node.EventType.TOUCH_START, this.DragStart, this);
            this.cups.children[2].on(Node.EventType.TOUCH_MOVE, this.DragMove, this);
            this.cups.children[2].on(Node.EventType.TOUCH_END, this.DragEnd, this);
            this.cups.children[2].on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
        }
    }

    InitTime() {
        this.time = SWMCQ_GameData.Instance.Datas[3];
        this.dayLabel.string = (SWMCQ_GameData.Instance.Datas[1]).toString();
        this.CheckTime();
        this.schedule(() => {
            this.time--;
            this.CheckTime();
            if (this.time == 0) this.Finish();
        }, 1, this.time - 1, 1);
        this.schedule(() => {
            for (let i = 0; i < this.guestLength; i++) {
                const element = this.guestDatas[i];
                if (!element) return this.SendGuest();
            }
        }, 10);
    }

    CheckTime() {
        var min = Math.floor(this.time / 60);
        var sec = this.time % 60;
        if (min < 10) this.timeLabel.string = "0";
        else this.timeLabel.string = "";
        this.timeLabel.string += min + ":";
        if (sec < 10) this.timeLabel.string += "0";
        this.timeLabel.string += sec;
    }

    TutorialNext() {
        this.tutorialNum++;
        if (this.tutorialNum == this.tutorialText.length) {
            this.tutorial.active = false;
            SWMCQ_GameData.Instance.Tutorial = true;
            this.InitTime();
            this.SendGuest();
            return;
        }
        this.tutorialLabel.node.parent.active = this.tutorialText[this.tutorialNum] != "";
        this.tutorialLabel.string = this.tutorialText[this.tutorialNum];
        this.tutorial.children[1].children[this.tutorialNum].active = true;
        this.tutorial.children[1].children[this.tutorialNum - 1].active = false;
    }

    start() {
        // FadePanel.Instance.node.children[0].active = true;
        // FadePanel.Instance.FadeOut();
        // FadePanel.Instance.node.parent.children[2].getComponent(AudioSource).play();
    }

    update(dt) {
        this.CutPotatos(dt);
        this.CupLoading(dt);
        this.CookSandwich(dt);
        console.log("沙威玛状态长度：" + this.cakeStates.length);
    }

    Point(v3: Vec3) {
        var point = PoolManager.GetNodeByPrefab(this.pointPre, this.bg);
        point.setWorldPosition(v3);
        point.setScale(Vec3.ONE);
        point.getComponent(UIOpacity).opacity = 255;
        var v = new Vec3();
        tween(point)
            .to(0.5, {
                scale: Vec3.multiplyScalar(v, Vec3.ONE, 5),
            })
            .call(() => {
                PoolManager.PutNode(point);
            })
            .start();
        tween(point.getComponent(UIOpacity))
            .to(0.5, { opacity: 0 })
            .start();
    }

    Cake() {
        if (this.tutorial.active && this.tutorialNum != 6) return;
        if (this.cakeStates.length > 0 && !this.cakeStates[this.cakeStates.length - 1][0]) return this.Point(this.panel.getWorldPosition());
        // if (this.cakeStates.length > 0 && this.cakeStates[this.cakeStates.length - 1][0] && !this.cakeStates[this.cakeStates.length - 1][1]) return this.Point(this.package.getWorldPosition());
        this.cake = PoolManager.GetNodeByPrefab(this.cakePre, this.bg.children[3]);
        //卷起、包装、石榴酱、烤、烤完成度、沙威玛、烤完到目标的
        this.cakeStates.push([false, false, false, false, 0, this.cake, false]);
        this.cake.position = this.cakes.position;
        tween(this.cake)
            .to(0.25, { position: this.panel.position })
            .call(() => {
                if (this.tutorial.active && this.tutorialNum == 6) this.TutorialNext();
            })
            .start();
        this.cake.on(Node.EventType.TOUCH_START, this.DragStart, this);
        this.cake.on(Node.EventType.TOUCH_MOVE, this.DragMove, this);
        this.cake.on(Node.EventType.TOUCH_END, this.DragEnd, this);
        this.cake.on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
    }

    AutoPack() {
        if (this.usingPack) return;
        var num = -1;
        for (let i = 0; i < this.cakeStates.length; i++) {
            const element = this.cakeStates[i];
            if (element[0] && !element[1] && (this.iron.active ? element[6] : true)) {
                num = i;
                break;
            }
        }
        if (num == -1) return;
        this.usingPack = true;
        this.pack = PoolManager.GetNodeByPrefab(this.packPre, this.bg);
        this.pack.angle = 0;
        this.pack.setWorldPosition(this.package.getWorldPosition());
        var sandwich = this.cakeStates[num][5] as Node;
        tween(this.pack)
            .to(0.25, { worldPosition: sandwich.getWorldPosition().add3f(-184, 0, 0) })
            .call(() => { this.usingPack = false; this.PackCake(sandwich); })
            .start();
    }

    CupTake() {
        var num = 0;
        if (this.drinkItems[0][0]) {
            if (this.drinkItems[1][0]) return;
            num = 1;
        }
        var cup = this.cups.children[num + 1];
        cup.setPosition(Vec3.ZERO);
        cup.angle = 0;
        cup.active = true;
        tween(cup)
            .to(0.25, {
                worldPosition: this.drinksMach.children[1].children[num].getWorldPosition(),
                angle: 270
            })
            .call(() => {
                this.drinkItems[num][0] = true;
            })
            .start();
    }

    CupLoad(event: Event) {
        var node: Node = event.target;
        var num = node.getSiblingIndex();
        var cup = this.cups.children[num + 1];
        if (this.drinkItems[num][0] && this.drinkItems[num][1] == 0) {
            this.drinksMach.children[0].children[num].children[0].active = true;
            cup.children[1].active = true;
        }
    }

    CupLoading(dt) {
        for (let i = 0; i < this.drinkItems.length; i++) {
            let cup = this.cups.children[i + 1];
            let num = this.drinkItems[i][1] as number;
            if (cup.children[1].active && num < 1) {
                num += dt / this.drinkTime;
                cup.children[2].getComponent(Sprite).fillRange = num;
                if (num >= 1) {
                    num = 1;
                    cup.children[1].active = false;
                    this.drinksMach.children[0].children[i].children[0].active = false;
                }
                this.drinkItems[i][1] = num;
            }
        }
    }

    CookSandwich(dt) {
        for (let i = 0; i < this.iron.children.length; i++) {
            const element = this.iron.children[i];
            let num = -1;
            for (let j = 0; j < this.cakeStates.length; j++) {
                if (this.cakeStates[j].includes(element)) {
                    num = j;
                    break;
                }
            }
            let range = this.cakeStates[num][4] as number;
            if (range < 1) range = clamp(range + dt / this.cookTime, 0, 1);
            element.children[1].children[1].getComponent(Sprite).fillRange = range;
            if (range == 1 && !this.cakeStates[num][3]) {
                this.cakeStates[num][3] = true;
                element.setParent(this.bg.children[3], true);
                tween(element)
                    .to(0.25, { worldPosition: this.sandwiches.getWorldPosition() })
                    .call(() => {
                        this.cakeStates[num][6] = true;
                    })
                    .start();
            }
            this.cakeStates[num][4] = range;
        }
    }

    NeedKnife(event: Event) {
        if (this.ingredient[0] == 0 && (this.cakeStates.length > 0 && !this.cakeStates[this.cakeStates.length - 1][0]) || event.target.name == "烤肉") this.Point(this.knife.getWorldPosition());
    }

    DragStart(event: EventTouch) {
        var pos3 = event.getUILocation();
        var node: Node = event.target;
        if (node == this.knife) {
            if (this.tutorial.active && this.tutorialNum != 1) return;
            this.startPos = this.knife.getPosition();
            this.knife.setWorldPosition(v3(pos3.x, pos3.y));
        }
        else if (node == this.potato) {
            if (this.tutorial.active && this.tutorialNum != 2) return;
            if (!this.cutFinish) this.CutPotato = true;
            else this.Point(this.fryMech.getWorldPosition());
        }
        else if (node == this.cake) {
            for (let i = 0; i < this.cakeItems.length; i++) {
                const element = this.cakeItems[i];
                if (element < 3) return this.NeedIngredient();
            }
            this.RollCake();
        }
        else if (node == this.package.children[0]) {
            this.pack = PoolManager.GetNodeByPrefab(this.packPre, this.bg);
            this.pack.angle = 0;
            this.pack.setWorldPosition(v3(pos3.x, pos3.y));
        }
        else if (this.sandwiches.children.includes(node)) this.startPos = node.getPosition();
        else if (node == this.grenadine) {
            if (this.usingGrenadine) return;
            this.grenadinePos = this.grenadine.getPosition();
            tween(this.grenadine)
                .to(0.25, { angle: 135 })
                .start();
        }
        else if (node == this.tea) {
            this.touchSprite.getComponent(Sprite).spriteFrame = this.foodSfs[1];
            this.touchSprite.setWorldPosition(v3(pos3.x, pos3.y));
            this.touchSprite.active = true;
        }
        else if (node == this.banana) {
            this.touchSprite.getComponent(Sprite).spriteFrame = this.foodSfs[2];
            this.touchSprite.setWorldPosition(v3(pos3.x, pos3.y));
            this.touchSprite.active = true;
        }
        else if (node == this.frenchFry) {
            this.touchSprite.getComponent(Sprite).spriteFrame = this.foodSfs[3];
            this.touchSprite.setWorldPosition(v3(pos3.x, pos3.y));
            this.touchSprite.active = true;
        }
        else if (node == this.cups.children[1] || node == this.cups.children[2]) {
            var num = node.getSiblingIndex() - 1;
            if (this.drinkItems[num][0] && this.drinkItems[num][1] == 1) this.startPos = node.getPosition();
        }
        else if (node.getComponent(Guest) && this.getPunch) node.getComponent(Guest).ClearTime();
        this.GetCoin(event);
    }

    DragMove(event: EventTouch) {
        var pos3 = event.getUILocation();
        var node: Node = event.target;
        if (node == this.knife) {
            if (this.tutorial.active && this.tutorialNum != 1) return;
            if (this.tutorial.active && this.tutorialNum == 1 && this.ingredient[0] > 20) {
                this.TutorialNext();
                this.knife.setPosition(this.startPos);
                this.dragLength = 0;
                return;
            }
            var prePos = this.knife.getPosition();
            this.knife.setWorldPosition(v3(pos3.x, pos3.y));
            if (!this.meat.getComponent(UITransform).getBoundingBoxToWorld().contains(v2(this.knife.getWorldPosition().x, this.knife.getWorldPosition().y))) return;
            this.dragLength += Vec2.distance(this.knife.getPosition(), prePos);
            // if (this.callAss) return;
            while (this.dragLength >= this.meat.getComponent(UITransform).height / 2) {
                this.AddIngredient(0);
                this.dragLength -= this.meat.getComponent(UITransform).height / 2;
                this.meat.getComponent(Animation).play();
            }
        }
        else if (node == this.cake) {
        }
        else if (node == this.package.children[0]) this.pack.setWorldPosition(v3(pos3.x, pos3.y));
        else if (this.sandwiches.children.includes(node)) node.setWorldPosition(v3(pos3.x, pos3.y));
        else if (node == this.grenadine && !this.usingGrenadine && this.grenadinePos) this.grenadine.setWorldPosition(v3(pos3.x, pos3.y));
        else if (node == this.tea || node == this.banana || node == this.frenchFry) this.touchSprite.setWorldPosition(v3(pos3.x, pos3.y));
        else if ((node == this.cups.children[1] || node == this.cups.children[2]) && this.startPos) {
            var num = node.getSiblingIndex() - 1;
            if (this.drinkItems[num][0] && this.drinkItems[num][1] == 1) node.setWorldPosition(v3(pos3.x, pos3.y));
        }
        this.GetCoin(event);
    }

    DragEnd(event: EventTouch) {
        let pos3 = event.getUILocation();
        let node: Node = event.target;
        if (node == this.knife) this.knife.setPosition(this.startPos), this.dragLength = 0;
        else if (node == this.potato) this.CutPotato = false;
        else if (node == this.package.children[0]) {
            let packBox = this.pack.getComponent(UITransform).getBoundingBoxToWorld();
            for (let i = 0; i < this.cakeStates.length; i++) {
                const element = this.cakeStates[i][5] as Node;
                let cakeBox = element.getComponent(UITransform).getBoundingBoxToWorld();
                if (cakeBox.intersects(packBox) && this.cakeStates[i][0] && !this.cakeStates[i][1] && (this.iron.active ? this.cakeStates[i][6] : true)) {
                    this.PackCake(element);
                    return;
                }
            }
            let pack = this.pack;
            this.pack = null;
            tween(pack)
                .by(1.5, {
                    position: v3(SWMCQ_GameData.randomRange(-300, 300), -1500),
                    angle: SWMCQ_GameData.randomRange(-30, 30)
                }, { easing: "quadIn" })
                .call(() => {
                    PoolManager.PutNode(pack);
                })
                .start();
            return;
        }
        else if (this.sandwiches.children.includes(node)) {
            let num = 0;
            for (let i = 0; i < this.cakeStates.length; i++) {
                const element = this.cakeStates[i];
                if (element.includes(node)) {
                    num = i;
                    break;
                }
            }
            if (this.GiveFood(pos3, 0, num)) {
                if (this.tutorial.active && this.tutorialNum == 11) this.TutorialNext();
                node.targetOff(this);
                PoolManager.PutNode(node);
                this.cakeStates.splice(num, 1);
            }
            else node.setPosition(this.startPos);
            this.startPos = null;
        }
        else if (node == this.grenadine) {
            if (this.usingGrenadine) return;
            Tween.stopAllByTarget(this.grenadine);
            this.grenadine.angle = 135;
            if (this.cakeStates.length > 0 && !this.cakeStates[this.cakeStates.length - 1][0] && !this.cakeStates[this.cakeStates.length - 1][2]) {
                let cake = this.cakeStates[this.cakeStates.length - 1][5] as Node;
                let box = cake.getComponent(UITransform).getBoundingBoxToWorld();
                if (box.contains(pos3)) {
                    this.cakeStates[this.cakeStates.length - 1][2] = true;
                    this.usingGrenadine = true;
                    let pos = this.cake.getWorldPosition();
                    let width = this.cake.getComponent(UITransform).width;
                    pos.x -= width / 2;
                    pos.y += 50;
                    this.grenadine.setWorldPosition(pos);
                    tween(this.grenadine)
                        .by(0.5, { position: v3(width, 0, 0) })
                        .call(() => {
                            this.grenadine.setPosition(this.grenadinePos);
                            this.grenadinePos = null;
                            this.grenadine.angle = 0;
                            this.usingGrenadine = false;
                        })
                        .start();
                    this.cake.children[4].active = true;
                    tween(this.cake.children[4].getComponent(Sprite))
                        .to(0.5, { fillRange: 1 })
                        .start();
                }
                else {
                    this.grenadine.setPosition(this.grenadinePos);
                    this.grenadine.angle = 0;
                    this.grenadinePos = null;
                }
            }
            else {
                this.grenadine.setPosition(this.grenadinePos);
                this.grenadine.angle = 0;
                this.grenadinePos = null;
            }
        }
        else if (node == this.tea) {
            this.touchSprite.active = false;
            this.GiveFood(pos3, this.foods.indexOf(this.foodSfs[1]));
        }
        else if (node == this.banana) {
            this.touchSprite.active = false;
            this.GiveFood(pos3, this.foods.indexOf(this.foodSfs[2]));
        }
        else if (node == this.frenchFry) {
            this.touchSprite.active = false;
            this.GiveFood(pos3, this.foods.indexOf(this.foodSfs[3]));
        }
        else if ((node == this.cups.children[1] || node == this.cups.children[2]) && this.startPos) {
            let num = node.getSiblingIndex() - 1;
            if (this.drinkItems[num][0] && this.drinkItems[num][1] == 1) {
                if (this.GiveFood(pos3, this.foods.indexOf(this.foodSfs[4 + num]))) {
                    node.active = false;
                    node.children[2].getComponent(Sprite).fillRange = 0;
                    this.drinkItems[num] = [false, 0];
                }
                else node.setPosition(this.startPos);
            }
        }
        this.GetCoin(event);
    }

    GiveFood(pos: Vec2, foodNum: number, swmNum = -1): boolean {
        for (let i = 0; i < this.guestLength; i++) {
            const element = this.guestDatas[i];
            if (element) {
                var guest = (element as SWMCQ_Guest);
                if (!guest.isAsk) continue;
                if (guest.node.getComponent(UITransform).getBoundingBoxToWorld().contains(pos)) {
                    var num = -1;
                    for (let i = 0; i < guest.AskNum.length; i++) {
                        const element = guest.AskNum[i];
                        if (element == foodNum && guest.GetNum[i] == 0) {
                            num = i;
                            break;
                        }
                    }
                    if (num != -1) {
                        guest.GetFood(num, swmNum);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    AddIngredient(num: number) {
        if (this.ingredient[num] >= 40) return;
        if (num != 3) {
            // var isAdd = false;
            // for (let i = 0; i < 3; i++) {
            const element = PoolManager.GetNodeByPrefab(this.ingredientPres[num], this.bg);
            element.getComponent(UIOpacity).opacity = 255;
            element.setWorldPosition(this.ingredientsAdd[num].getWorldPosition());
            var pos = this.ingredients[num].position;
            if (num != 0) {
                var byX = 300;
                var isCheese = num == 2;
                if (isCheese) {
                    element.angle = 45;
                }
                else {
                    var scale = v3();
                    Vec3.multiplyScalar(scale, Vec3.ONE, 1.5);
                    element.setScale(scale);
                }
                tween(element)
                    .by(0.25, {
                        position: v3(byX, 200),
                        angle: isCheese ? -45 : SWMCQ_GameData.randomRange(-180, 180)
                    })
                    .to(0.25, {
                        position: pos,
                        angle: isCheese ? -45 : SWMCQ_GameData.randomRange(-180, 180)
                    })
                    .call(() => {
                        // if (!isAdd) isAdd = true, 
                        this.ingredient[num] = SWMCQ_GameData.clamp(this.ingredient[num] += this.itemPart[num], 0, 40), this.CheckIngredient(num);
                        tween(element.getComponent(UIOpacity))
                            .to(isCheese ? 0 : 0.5, { opacity: 0 })
                            .call(() => {
                                PoolManager.PutNode(element);
                            })
                            .start();
                    })
                    .start();
            }
            else {
                var scale = v3();
                Vec3.multiplyScalar(scale, Vec3.ONE, 1.5);
                element.setScale(scale);
                tween(element)
                    .to(0.5, {
                        position: pos,
                        angle: SWMCQ_GameData.randomRange(-180, 180)
                    })
                    .call(() => {
                        // if (!isAdd) isAdd = true, 
                        this.ingredient[num] = SWMCQ_GameData.clamp(this.ingredient[num] += this.itemPart[num], 0, 40), this.CheckIngredient(num);
                        tween(element.getComponent(UIOpacity))
                            .to(isCheese ? 0 : 0.5, { opacity: 0 })
                            .call(() => {
                                PoolManager.PutNode(element);
                            })
                            .start();
                    })
                    .start();
            }
            // }
        }
    }

    CheckIngredient(num: number) {
        console.log(this.ingredient[num]);
        if (num < 3) for (let i = 0; i < this.ingredients[num].children[0].children.length; i++) {
            const element = this.ingredients[num].children[0].children[i];
            element.active = this.ingredient[num] > 10 * i + 1;
        }
        else for (let i = 0; i < this.ingredients[num].children[0].children.length; i++) {
            const element = this.ingredients[num].children[0].children[i];
            element.active = this.ingredient[num] > 20 * i + 1;
        }
    }

    IngredientBtn(event, num: number) {
        if (this.tutorial.active && this.tutorialNum != 5) return;
        this.AddIngredient(num);
        if (this.tutorial.active && this.tutorialNum == 5 && this.ingredient[1] > 10 && this.ingredient[2] > 10) this.TutorialNext();
    }

    CallAss() {
        if (this.tutorial.active && this.tutorialNum != 5) return;
        var ani = this.assistant.getComponent(Animation).getState("CallAss");
        if (this.callAss) ani.wrapMode = AnimationClip.WrapMode.Normal;
        else ani.wrapMode = AnimationClip.WrapMode.Reverse;
        this.callAss = !this.callAss;
        ani.play();
    }

    CutPotatos(dt: number) {
        if (!this.cutPotato) return;
        this.cutTime += dt;
        this.cutProgress.fillRange = this.cutTime / this.potatoTime;
        if (this.cutTime >= this.potatoTime) this.CutPotato = false;
    }

    CutFinish() {
        this.cutTime = 0;
        this.cutProgress.fillRange = this.cutTime / this.potatoTime;
        this.fryMech.children[0].active = true;
        this.fringTime = this.fryTime;
        this.fryLabel.string = this.fringTime.toString();
        this.fryMech.getComponent(Animation).play("Fring");
        this.schedule(this.Fring, 1, this.fryTime - 1, 1);
    }

    Fring() {
        this.fringTime--;
        this.fryLabel.string = this.fringTime.toString();
        if (this.fringTime == 0) {
            if (this.tutorial.active) this.fryTime = 12, this.TutorialNext();
            this.fryReady = true;
            this.fryMech.getComponent(Animation).play("Fried");
        }
    }

    AddFry() {
        if (this.ingredient[3] >= 40) return this.Point(this.ingredients[3].getWorldPosition());
        if (!this.fryReady) {
            if (this.fringTime == 0) return this.Point(this.potato.children[0].children[1].getWorldPosition());
            return;
        }
        this.cutFinish = false;
        this.fryReady = false;
        this.fryMech.getComponent(Animation).play("Ready");
        var element = PoolManager.GetNodeByPrefab(this.ingredientPres[3], this.bg);
        element.setPosition(this.fryMech.getPosition());
        var pos = this.ingredients[3].position;
        var byX = pos.x - element.position.x / 2;
        tween(element)
            .by(0.25, { position: v3(byX, 300) })
            .to(0.25, { position: pos })
            .call(() => {
                SWMCQ_GameData.clamp(this.ingredient[3] += this.itemPart[3], 0, 40);
                this.CheckIngredient(3);
                PoolManager.PutNode(element);
                if (this.tutorial.active) this.TutorialNext();
            })
            .start();
    }

    UseIngredient(event, num: number) {
        if (this.tutorial.active && this.tutorialNum != 7) return;
        if (GameScene.Instance.ingredient[num] == 0) {
            if (num != 3) return GameScene.Instance.Point(GameScene.Instance.ingredientsNeed[num].getWorldPosition());
            if (num == 3) {
                if (!GameScene.Instance.cutFinish) return this.Point(this.potato.children[0].children[1].getWorldPosition());
                return GameScene.Instance.Point(GameScene.Instance.fryMech.getWorldPosition());
            }
        }
        if (GameScene.Instance.cakeStates.length == 0 || GameScene.Instance.cakeStates[GameScene.Instance.cakeStates.length - 1][0]) return GameScene.Instance.Point(GameScene.Instance.cakes.position);
        if (GameScene.Instance.cakeItems[num] == 3) return;
        if (GameScene.Instance.cakeItems2[num] == 3) return;
        GameScene.Instance.ingredient[num] = SWMCQ_GameData.clamp(GameScene.Instance.ingredient[num] -= 3, 0, 40);
        GameScene.Instance.CheckIngredient(num);
        GameScene.Instance.cakeItems2[num] += 3;
        var cakeIngred = PoolManager.GetNodeByPrefab(GameScene.Instance.ingredientPres[num], GameScene.Instance.bg);
        cakeIngred.getComponent(UIOpacity).opacity = 255;
        cakeIngred.angle = num == 2 ? -40 : 0;
        cakeIngred.position = GameScene.Instance.ingredients[num].position;
        tween(cakeIngred)
            .to(0.25, { position: GameScene.Instance.cake.position })
            .call(() => {
                PoolManager.PutNode(cakeIngred);
                GameScene.Instance.cake.children[num].active = true;
                GameScene.Instance.cakeItems[num] += 3;
                if (this.tutorial.active && this.tutorialNum == 7 && GameScene.Instance.CheckRoll()) this.TutorialNext();
            })
            .start();
    }

    NeedIngredient() {
        for (let i = 0; i < this.cakeItems.length; i++) {
            const element = this.cakeItems[i];
            if (element < 3) this.Point(this.ingredients[i].position);
        }
    }

    CheckRoll(): boolean {
        for (let i = 0; i < this.cakeItems.length; i++) {
            const element = this.cakeItems[i];
            if (element < 3) return false;
        }
        return true;
    }

    RollCake() {
        if (this.cakeStates.length > 0 && this.cakeStates[this.cakeStates.length - 1][0]) return;
        if (!this.CheckRoll()) return;
        if (this.tutorial.active && this.tutorialNum == 8) this.TutorialNext();
        this.cakeItems = [0, 0, 0, 0];
        this.cakeItems2 = [0, 0, 0, 0];
        this.cakeStates[this.cakeStates.length - 1][0] = true;
        var sandwich = PoolManager.GetNodeByPrefab(this.sandwithPre, this.bg);
        this.cakeStates[this.cakeStates.length - 1][5] = sandwich;
        sandwich.children[0].active = false;
        sandwich.children[1].children[1].getComponent(Sprite).fillRange = 0;
        sandwich.children[2].active = false;
        sandwich.setWorldPosition(this.cake.getWorldPosition());
        PoolManager.PutNode(this.cake);
        for (let i = 0; i < this.cake.children.length; i++) {
            const element = this.cake.children[i];
            element.active = false;
        }
        this.cake.children[4].getComponent(Sprite).fillRange = 0;
        this.cake = null;
        if (this.iron.active) {
            tween(sandwich)
                .to(0.25, { worldPosition: this.iron.getWorldPosition().add3f(0, 10 * this.iron.children.length - 1, 0) })
                .call(() => {
                    sandwich.setParent(this.iron, true);
                })
                .start();
        }
        else {
            tween(sandwich)
                .to(0.25, { worldPosition: this.sandwiches.getWorldPosition() })
                .start();
        }
    }

    PackCake(sandwich: Node) {
        PoolManager.PutNode(this.pack);
        sandwich.getComponent(Animation).play("Pack");
        sandwich.on(Node.EventType.TOUCH_START, this.DragStart, this);
        sandwich.on(Node.EventType.TOUCH_MOVE, this.DragMove, this);
        sandwich.on(Node.EventType.TOUCH_END, this.DragEnd, this);
        sandwich.on(Node.EventType.TOUCH_CANCEL, this.DragEnd, this);
        this.pack = null;
        for (let i = 0; i < this.cakeStates.length; i++) {
            const element = this.cakeStates[i];
            if (element.includes(sandwich)) {
                this.cakeStates[i][1] = true;
                break;
            }
        }
        console.log("沙威玛状态长度：" + this.cakeStates.length);
        sandwich.setParent(this.sandwiches, true);
        var index = this.sandwiches.children.indexOf(sandwich);
        tween(sandwich)
            .to(0.25, { position: v3(0, 10 * index) })
            .start();
        if (this.tutorial.active) {
            this.TutorialNext();
            this.SendGuest(true);
        }
    }

    SendGuest(tutorial = false) {
        // return;
        var num = Math.floor(SWMCQ_GameData.randomRange(0, this.guestSummons.length));
        var guest = PoolManager.GetNodeByPrefab(this.guestPres, this.guestPanel.children[1]);
        var v = v3();
        guest.setScale(Vec3.multiplyScalar(v, Vec3.ONE, 0.6));
        guest.position = this.guestSummons[num].position;
        var num3 = Math.floor(SWMCQ_GameData.randomRange(0, this.guestLength));
        if (tutorial) num3 = 1;
        while (this.guestDatas[num3]) {
            num3 = Math.floor(SWMCQ_GameData.randomRange(0, this.guestLength));
        }
        var guest2 = guest.getComponent(SWMCQ_Guest);
        guest2.isTutorial = tutorial;
        guest2.num = num3;
        guest2.Walk(this.guestWaits[num3].position);
        this.guestDatas[num3] = guest2;
        if (this.getPunch) guest.on(Node.EventType.TOUCH_START, this.DragStart, this);
    }

    GuestCoin(guestNum: number, money: number) {
        console.log("付钱：" + money);
        while (money > 0) {
            // var priceNum = Math.floor(SWMCQ_GameData.randomRange(1, 4));
            // priceNum = priceNum == 1 ? 1 : priceNum == 2 ? 5 : 10;
            var priceNum = 10;
            if (money < 5) priceNum = 1;
            else if (money < 10) priceNum = 5;
            money -= priceNum;
            var num = priceNum == 1 ? 0 : priceNum == 5 ? 1 : 2;
            var coin = PoolManager.GetNodeByPrefab(this.coinPres[num], this.coinPanel);
            var scale = v3();
            Vec3.multiplyScalar(scale, Vec3.ONE, 1.5);
            coin.setScale(scale);
            var coinPlace = this.coinPanel.children[guestNum].getComponent(UITransform).getBoundingBoxToWorld();
            coin.setWorldPosition(v3(SWMCQ_GameData.randomRange(coinPlace.xMin, coinPlace.xMax), SWMCQ_GameData.randomRange(coinPlace.yMin, coinPlace.yMax)));
            this.coins.push(coin);
        }
        this.guestNum++;
    }

    GetCoin(event: EventTouch) {
        for (let i = 0; i < this.coins.length; i++) {
            const element = this.coins[i];
            var coin = element.getComponent(SWMCQ_Coin);
            if (coin.isCollected) continue;
            var box = element.getComponent(UITransform).getBoundingBoxToWorld();
            var pos = event.getUILocation();
            if (box.contains(pos)) {
                coin.Collect();
                if (this.tutorial.active && this.tutorialNum == 12) this.TutorialNext();
            }
        }
    }

    Finish() {
        this.unscheduleAllCallbacks();
        Tween.stopAll();
        SWMCQ_GameUI.Instance.Finish();
    }

    ShowAutoWork() {
        if (this.AutoTime > 0 || this.tutorial.active) return;
        this.autoPanel.active = true;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "沙威玛传奇");
    }

    CloseAutoWork() {
        this.autoPanel.active = false;
    }

    UseAutoWork() {
        Banner.Instance.ShowVideoAd(() => {
            GameScene.Instance.InitWisp();
            GameScene.Instance.CloseAutoWork();
        });
    }

    InitWisp() {
        this.AutoTime = 30;
        var button = this.wisp.parent;
        button.children[1].active = false;
        button.children[3].active = true;
        var label = button.children[2].getComponent(Label);
        label.string = "00:30";
        label.node.active = true;
        this.wisp.on(Node.EventType.TOUCH_START, this.WispStart, this);
        this.wisp.on(Node.EventType.TOUCH_MOVE, this.WispMove, this);
        this.wisp.on(Node.EventType.TOUCH_END, this.WispEnd, this);
        this.wisp.on(Node.EventType.TOUCH_CANCEL, this.WispEnd, this);
        this.schedule(() => {
            this.AutoTime--;
            label.string = "00:" + (this.AutoTime < 10 ? "0" : "") + this.AutoTime;
            if (this.AutoTime == 0) {
                this.wisp.off(Node.EventType.TOUCH_START, this.WispStart, this);
                this.wisp.off(Node.EventType.TOUCH_MOVE, this.WispMove, this);
                this.wisp.off(Node.EventType.TOUCH_END, this.WispEnd, this);
                this.wisp.off(Node.EventType.TOUCH_CANCEL, this.WispEnd, this);
                this.WispEnd();
                this.unschedule(this.AutoIngred);
            }
        }, 1, 29);
    }

    WispStart() {
        this.wisp.parent.children[3].active = false;
        this.wisp.children[2].setScale(v3(1.5, 1.5, 1.5));
    }

    WispMove(event: EventTouch) {
        var pos = event.getUILocation();
        this.wisp.setWorldPosition(v3(pos.x, pos.y));
        var wispBox = this.wisp.getComponent(UITransform).getBoundingBoxToWorld();
        var assBox = this.assistant.getComponent(UITransform).getBoundingBoxToWorld();
        if (wispBox.intersects(assBox)) {
            this.schedule(this.AutoIngred, 0.25);
            if (this.head.children[0].active) {
                this.wisp.getComponent(Animation).play();
                this.head.children[0].active = false;
                this.head.children[1].active = true;
                this.scheduleOnce(() => {
                    this.head.children[0].active = true;
                    this.head.children[1].active = false;
                }, 0.5);
            }
        }
    }

    WispEnd() {
        this.wisp.setPosition(Vec3.ZERO);
        this.wisp.children[2].setScale(Vec3.ONE);
        this.wisp.getComponent(Animation).play("wispoff");
    }

    AutoIngred() {
        var x = GameScene.Instance;
        if (x.ingredient[1] < 40) x.AddIngredient(1);
        else if (x.ingredient[2] < 40) x.AddIngredient(2);
        else this.unschedule(this.AutoIngred);
    }

}
