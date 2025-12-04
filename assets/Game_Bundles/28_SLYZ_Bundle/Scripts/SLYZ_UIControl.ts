import { _decorator, AudioClip, Component, director, instantiate, Label, Node, Prefab } from 'cc';
import { SLYZ_Cassette } from './SLYZ_Cassette';
import { SLYZ_CardBook } from './SLYZ_CardBook';
import { SLYZ_AudioManager } from './SLYZ_AudioManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { DataManager } from 'db://assets/Scripts/Framework/Managers/DataManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { AudioManager } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import Banner from 'db://assets/Scripts/Banner';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('SLYZ_UIControl')
export class SLYZ_UIControl extends Component {
    @property(Prefab)
    private cardBookPrefab: Prefab = null;
    @property(Prefab)
    private cassettePrefab: Prefab = null;
    @property(Node)
    private lianSai: Node = null;
    @property(Node)
    private loading: Node = null;
    private bookSpawned: boolean = false;
    @property
    private initCoin: number = 0;
    @property(AudioClip)
    private BGM: AudioClip = null;

    @property([AudioClip])
    public sound: AudioClip[] = [];

    public cardData: number[] = [];

    @property
    public setCoin: number = 0;
    protected onLoad(): void {
        director.on("AddCoin", this.updateHaveCoin, this);
        director.on("updateCard", this.updateCardData, this);
        const savedCoin = localStorage.getItem('SLYZ_CoinNum');
        if (savedCoin) {
            this.initCoin = Number(savedCoin);
        }

    }
    start() {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "狩猎勇者");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.node.getChildByName("UI").getChildByName("更多模式"));
        let cardBook = instantiate(this.cardBookPrefab);
        cardBook.parent = this.node.getChildByName("卡册生成");
        this.bookSpawned = true;
        this.node.getChildByName("卡册生成").getChildByName("卡册").active = false;
        this.node.getChildByName("UI").getChildByName("金币栏").getChildByName("金币数").getComponent(Label).string = this.initCoin.toString();
        this.node.getChildByName("UI").getChildByName("按钮层").getChildByName("普通卡盒钮").getChildByName("金币值").getComponent(Label).string = this.setCoin.toString();
        // AudioManager.Instance.PlayBGM(this.BGM);
    }


    update(deltaTime: number) {

    }

    protected onDestroy(): void {
        localStorage.setItem('SLYZ_CoinNum', JSON.stringify(this.initCoin));
        director.off("AddCoin", this.updateHaveCoin, this);
        director.off("updateCard", this.updateCardData, this);
    }

    cardBookOpen() {
        if (!this.bookSpawned) {
            let cardBook = instantiate(this.cardBookPrefab);
            cardBook.parent = this.node.getChildByName("卡册生成");
            console.log("卡册生成");
            this.UIClose();
            this.bookSpawned = true;
        }
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "狩猎勇者");
        SLYZ_AudioManager.instance.playSound(this.sound[1]);
        this.node.getChildByName("卡册生成").getChildByName("卡册").active = true;
        this.UIClose();
    }

    UIClose() {
        this.node.getChildByName("封面").getChildByName("卡册封面").active = false;
        this.node.getChildByName("UI").active = false;
    }
    SetUIOpen() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "狩猎勇者");
        SLYZ_AudioManager.instance.playSound(this.sound[0]);
        this.node.getChildByName("UI").getChildByName("设置层").getChildByName("设置弹窗").active = true;
    }
    SetUICloase() {
        SLYZ_AudioManager.instance.playSound(this.sound[0]);
        this.node.getChildByName("UI").getChildByName("设置层").getChildByName("设置弹窗").active = false;
    }
    ordinarySpawn() {
        SLYZ_AudioManager.instance.playSound(this.sound[0]);
        this.updateCoin();
        let cassette = instantiate(this.cassettePrefab);
        this.node.addChild(cassette);
        cassette.getComponent(SLYZ_Cassette).cassetteDataSpawn(1);
        // this.updateCardData();
    }

    seniorSpawn() {
        Banner.Instance.ShowVideoAd(() => {
            SLYZ_AudioManager.instance.playSound(this.sound[0]);
            let cassette = instantiate(this.cassettePrefab);
            this.node.addChild(cassette);
            cassette.getComponent(SLYZ_Cassette).cassetteDataSpawn(2);
        })

        // this.updateCardData();
    }
    updateCoin() {
        this.initCoin = this.initCoin - this.setCoin;
        this.node.getChildByName("UI").getChildByName("金币栏").getChildByName("金币数").getComponent(Label).string = this.initCoin.toString();
    }
    updateCardData() {
        this.cardData = this.node.getChildByName("卡册生成").getChildByName("卡册").getComponent(SLYZ_CardBook).verifyArray;
        //    console.log(this.cardData);
    }
    updateHaveCoin(num) {
        this.initCoin = this.initCoin + num;
        console.log("加钱");
    }


    gameChanage() {
        // let data = DataManager.GameData;
        // let x = data.find((value, index, obj) => {
        //     if (value.Bundles[0] == "18_PKP_Bundle") return value;
        // })
        // UIManager.ShowPanel(Panel.LoadingPanel, [x, "PKP_MenuScene"]);
        this.loading.active = true;
        BundleManager.LoadBundles(["18_PKP_Bundle"], () => {
            UIManager.ShowPanel(Panel.LoadingPanel, ["PKP_MenuScene"]);
        }, () => {
            UIManager.ShowTip("网络异常，请稍后重试");
            UIManager.HidePanel(Panel.LoadingPanel);
            this.loading.active = false;
        });
    }

    returnHomePage() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "狩猎勇者");
            })
        });
    }

    LianSai() {
        this.lianSai.active = true;
    }

    ChaiBao() {
        this.lianSai.active = false;
    }
}


