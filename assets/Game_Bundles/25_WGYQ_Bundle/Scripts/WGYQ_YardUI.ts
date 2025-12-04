import { _decorator, Component, Label, Node, tween } from 'cc';
import { WGYQ_UI } from './WGYQ_UI';
import { WGYQ_DogName, WGYQ_DogType, WGYQ_GameData } from './WGYQ_GameData';
import { WGYQ_YardManager } from './WGYQ_YardManager';
import { WGYQ_Camera } from './WGYQ_Camera';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_YardUI')
export class WGYQ_YardUI extends WGYQ_UI {

    private static instance: WGYQ_YardUI;
    public static get Instance(): WGYQ_YardUI {
        return this.instance;
    }

    @property(Node)
    tutorialAni: Node;

    @property(Node)
    viewButton: Node;

    @property(Node)
    build: Node;

    @property(Node)
    tip: Node;

    @property(Node)
    zjzg: Node;

    tutorialTexts = [
        "哥们儿！！小院今天第一天开放昂",
        "咱今天接到个私信啊，又是一条柴犬，把主人波棱盖咬秃噜皮了",
        "哪能这么无法无天了？？眼里还有没有主人了？？",
        "别废话了昂，咱这立马给它揪过来瞅瞅咋回事",
        "出发！！接狗！！",
        "",
        //播一段接狗动画后
        "咱们已经让它缓了两天了，现在看看它是真咬还是假咬",
        "",
        //走上前被咬
        "哎！！",
        "是真咬",
        "我就喜欢这样的",
        "给它给我抓出来！！",
    ]

    tutorialTexts2 = [
        "好了，看，老没老实？",
        "行了，咱也让它歇会儿，给它找个地方趴",
        "以后再接到狗也一样，给它弄个窝歇着。现在有一个现成的窝，等下它就待那",
        "院里狗窝的数量要大于等于院里的狗",
        "点击背包栏里的狗，操作右侧摇杆，给它放空地吧"
    ];

    coins: number;
    get Coins(): number {
        return this.coins;
    }
    set Coins(value: number) {
        this.coins = value;
        WGYQ_GameData.Instance.setNumberData("Coins", this.coins);
        this.coinLabel.string = this.coins.toString();
    }

    protected onLoad(): void {
        super.onLoad();
        this.coins = WGYQ_GameData.Instance.getNumberData("Coins");
        WGYQ_YardUI.instance = this;
        let data = WGYQ_GameData.Instance.getNumberData("YardTutorial");
        let data2 = WGYQ_GameData.Instance.getNumberData("YardTutorial2");
        if (data == 0) {
            this.Talk();
            WGYQ_GameData.Instance.setObjectData("CurrentDog", {});
        }
        else if (data == 1 && data2 == 0 && WGYQ_GameData.Instance.getNumberData("IsCatch")) this.Talk2();
        this.viewButton.on(Node.EventType.TOUCH_START, this.BigView, this);
        this.viewButton.on(Node.EventType.TOUCH_END, this.NormalView, this);
        this.viewButton.on(Node.EventType.TOUCH_CANCEL, this.NormalView, this);
        this.InitZJZG();
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "玩狗园区");
    }

    InitZJZG() {
        let gouliang = WGYQ_GameData.Instance.getNumberData("ZJZG");
        if (gouliang > 0) {
            this.zjzg.children[1].active = true;
            this.zjzg.children[2].active = true;
            this.zjzg.children[2].getComponent(Label).string = gouliang.toString();
        }
    }

    start() {

    }

    update(deltaTime: number) {

    }

    Talk(): void {
        let data = WGYQ_GameData.Instance.getNumberData("YardTutorial");
        let data2 = WGYQ_GameData.Instance.getNumberData("YardTutorial2");
        if (data == 1 && data2 == 0) {
            return this.Talk2();
        }
        if (this.talkNum < this.tutorialTexts.length) {
            switch (this.talkNum) {
                case 5:
                    WGYQ_GameData.Instance.setObjectData("CurrentDog", {
                        dogNumber: -1,
                        dogName: WGYQ_DogName[0] + "（" + WGYQ_DogType[0] + "）",
                        dogType: WGYQ_DogType[0],
                        dogProperty: ""
                    })
                    WGYQ_YardManager.Instance.InitDogGame(true);
                    this.tutorialAni.active = true;
                    this.talkNum++;
                    this.Talk();
                    break;
                case 7:
                case 12:
                    this.talkPanel.active = false;
                    this.talkNum++;
                    break;
                default:
                    super.Talk();
                    break;
            }
        }
        else {
            this.talkPanel.active = false;
            WGYQ_GameData.Instance.setNumberData("YardTutorial", 1);
        }
    }

    Talk2(): void {
        if (this.talkNum < this.tutorialTexts2.length) {
            this.talkPanel.active = true;
            this.talkLabel.string = this.tutorialTexts2[this.talkNum];
            this.talkNum++;
        }
        else {
            this.talkPanel.active = false;
            WGYQ_GameData.Instance.setNumberData("YardTutorial2", 1);
        }
    }

    BigView() {
        tween(WGYQ_Camera.Instance.camera)
            .to(1, { orthoHeight: 2000 })
            .start();
    }

    NormalView() {
        tween(WGYQ_Camera.Instance.camera)
            .to(1, { orthoHeight: 500 })
            .start();
    }

    FeelAllDogs() {

    }

    GetAllMoney() {

    }

    Back() {
        UIManager.ShowPanel(Panel.LoadingPanel, "WGYQ_Home");
    }

    Tip() {
        this.tip.active = !this.tip.active;
    }

    Build() {
        this.build.active = !this.build.active;
    }
}


