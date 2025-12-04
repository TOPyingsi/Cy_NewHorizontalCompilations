import { _decorator, Animation, assetManager, AudioClip, AudioSource, Component, director, EventTouch, find, instantiate, Node, Prefab, Sprite, SpriteFrame, tween, UITransform, v3 } from 'cc';
import { JJHZ_Incident } from '../JJHZ_Incident';
import { JJHZ_AudioManager } from '../JJHZ_AudioManager';


import { JJHZ_MusicButtom } from './JJHZ_MusicButtom';
import { JJHZ_EventManager, JJHZ_MyEvent } from '../JJHZ_EventManager';
import { JJHZ_Player } from './JJHZ_Player';
import Banner from '../../../../Scripts/Banner';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from '../../../../Scripts/Framework/Managers/ProjectEventManager';
import { JJHZ_CatalogButton } from './JJHZ_CatalogButton';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { GameManager } from '../../../../Scripts/GameManager';


const { ccclass, property } = _decorator;

@ccclass('JJHZ_GameManager')
export class JJHZ_GameManager extends Component {
    public static IsPauseAudio: boolean = false;//是否关闭音效
    public static IsPauseMusic: boolean = false;//是否关闭音乐

    public static GameScene: number = 3;//游戏关卡
    public static GameSceneNumber: number[] = [20, 18, 20, 19, 20, 12, 12, 12, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20];//每一关选择的数量
    public static AudioIndex: number[] = [-1, 0, -1, 0, 0, -1, -1, -1, -1, -1, 10, 1, 1, 1, 2, 2, 2, 3, 3, -1];//每个关卡用到的音乐

    public _gameSceneNumber: number = 0;//本关卡的选择数量
    @property(Node)
    public BG: Node = null;
    @property(Node)
    public PlayerContent: Node = null;//角色Content
    @property(Node)
    public buttomContent: Node = null;//按钮Content
    @property(Node)
    public UINode: Node = null;//按钮Content

    public gameStart: boolean = false;//游戏开启

    private static _instance: JJHZ_GameManager = null;
    public static get Instance(): JJHZ_GameManager {
        if (this._instance == null) {
            this._instance = new JJHZ_GameManager();
        }
        return this._instance;
    }
    protected onLoad(): void {
        JJHZ_GameManager._instance = this;
    }
    public static IsOpen: boolean = false;
    start() {
        this._gameSceneNumber = JJHZ_GameManager.GameSceneNumber[JJHZ_GameManager.GameScene];
        this.buttomContent.getComponent(UITransform).width = Math.ceil(this._gameSceneNumber / 2) * 156 + 10;
        if (!JJHZ_AudioManager.AudioSource) JJHZ_AudioManager.AudioSource = new Node().addComponent(AudioSource);
        JJHZ_AudioManager.AudioSource.stop();
        this.Tween_Star();
        this.InitSprite();
        this.LoadAudio();
        if (Banner.RegionMask) {
            JJHZ_GameManager.IsOpen = true;
        }
        ProjectEventManager.emit(ProjectEvent.游戏开始, "节奏盒子");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.UINode.getChildByPath("顶部/更多模式"));
        this.UINode.getChildByPath("暂停界面/板子/音效圈/对勾").active = !JJHZ_GameManager.IsPauseAudio;
        this.UINode.getChildByPath("暂停界面/板子/音乐圈/对勾").active = !JJHZ_GameManager.IsPauseMusic;
        if (JJHZ_CatalogButton.catalogUIs.length == 0) {
            assetManager.getBundle("4_JJHZ_Bundle").loadDir("CharacterCatalog/Prefabs", Prefab, (err, data) => {
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    JJHZ_CatalogButton.catalogUIs.push(element);
                    console.log(element.name);
                }
                PoolManager.GetNodeByPrefab(JJHZ_CatalogButton.catalogUIs.find((value, index, obj) => {
                    return value.name == "CatalogButton";
                }), find("Canvas"));
            })
        }
        else {
            PoolManager.GetNodeByPrefab(JJHZ_CatalogButton.catalogUIs.find((value, index, obj) => {
                return value.name == "CatalogButton";
            }), find("Canvas"));
        }
        if (JJHZ_CatalogButton.cards.length == 0) assetManager.getBundle("4_JJHZ_Bundle").loadDir("CharacterCatalog/Cards", SpriteFrame, (err, data) => {
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                JJHZ_CatalogButton.cards.push(element);
                console.log(element.name);
            }
            JJHZ_CatalogButton.cards.sort();
        })
    }

    public AudioList: AudioClip[] = [];
    LoadAudio() {
        for (let i = 0; i < JJHZ_GameManager.GameSceneNumber[JJHZ_GameManager.GameScene]; i++) {
            JJHZ_Incident.LoadMusic("Audio/" + JJHZ_GameManager.AudioIndex[JJHZ_GameManager.GameScene] + "/" + i).then((ad: AudioClip) => {
                this.AudioList[i] = ad;
            })
        }
    }

    GameStart() {
        this.gameStart = true;
        this.UINode.getChildByPath("顶部/进度圈/顶圈").getComponent(Animation).play();
        this.PlayerPlay();
    }
    Time: number = 4.8;
    update(deltaTime: number) {
        if (this.gameStart) {
            this.Time -= deltaTime;
            if (this.Time <= 0) {
                this.Time = 4.8;
                this.PlayerPlay();
            }
        }
    }


    //向所有人发送开始播放音乐的事件
    PlayerPlay() {
        JJHZ_EventManager.Scene.emit(JJHZ_MyEvent.播放);
    }

    //判断游戏状态
    GameState() {
        let state = 0;
        this.PlayerContent.children.forEach((cd, index) => {
            if (cd.getComponent(JJHZ_Player).ID != -1) {
                state = 1;
            }
        })

        if (state == 0 && this.gameStart) {//没人唱歌且游戏开始
            this.Time = 4.8;
            this.UINode.getChildByPath("顶部/进度圈/顶圈").getComponent(Animation).stop();
            this.UINode.getChildByPath("顶部/进度圈/顶圈").getComponent(Sprite).fillRange = 0;
            this.gameStart = false;
        } else if (state == 1 && !this.gameStart) {//有人唱歌且游戏没开始
            this.GameStart();
        }
    }

    //按钮事件
    OnbuttonClick(btn: EventTouch) {
        switch (btn.target.name) {
            case "音效圈":
                JJHZ_GameManager.IsPauseAudio = !JJHZ_GameManager.IsPauseAudio;
                JJHZ_EventManager.Scene.emit(JJHZ_GameManager.IsPauseAudio == true ? JJHZ_MyEvent.关闭音效 : JJHZ_MyEvent.开启音效);
                this.UINode.getChildByPath("暂停界面/板子/音效圈/对勾").active = !JJHZ_GameManager.IsPauseAudio;
                break;
            case "音乐圈":
                JJHZ_GameManager.IsPauseMusic = !JJHZ_GameManager.IsPauseMusic;
                this.UINode.getChildByPath("暂停界面/板子/音乐圈/对勾").active = !JJHZ_GameManager.IsPauseMusic;
                break;

        }

    }


    //游戏开始所有角色Tween动画
    Tween_Star() {
        this.PlayerContent.children.forEach((Nd: Node) => {
            Nd.setPosition(Nd.position.x, -600);
            tween(Nd)
                .to(0.8, { position: v3(Nd.position.x, -27) }, { easing: "quartInOut" })
                .start();
        })

    }
    //初始化所有按钮图片
    InitSprite() {
        //初始化游戏背景
        JJHZ_Incident.LoadSprite("Scene" + JJHZ_GameManager.GameScene + "Sprite/背景").then((sp: SpriteFrame) => {
            this.PlayerContent.parent.getComponent(Sprite).spriteFrame = sp;
        })
        JJHZ_Incident.Loadprefab("Res/音乐选择钮").then((pre: Prefab) => {
            for (let index = 0; index < this._gameSceneNumber; index++) {
                let buttom = instantiate(pre);
                buttom.setParent(this.buttomContent);
                JJHZ_Incident.LoadSprite("Scene" + JJHZ_GameManager.GameScene + "Sprite/" + "按钮/" + index).then((sp: SpriteFrame) => {
                    buttom.getChildByName("颜色层").getComponent(Sprite).spriteFrame = sp;
                })
                JJHZ_Incident.LoadSprite("Scene" + JJHZ_GameManager.GameScene + "Sprite/" + "按钮/" + index + "_0").then((sp: SpriteFrame) => {
                    buttom.getChildByName("灰白层").getComponent(Sprite).spriteFrame = sp;
                })
                buttom.getComponent(JJHZ_MusicButtom).ID = index;
            }
        })
        //初始化特效
        JJHZ_Incident.Loadprefab("Scene" + JJHZ_GameManager.GameScene + "Sprite/特效").then((pre: Prefab) => {
            let nd = instantiate(pre);
            nd.setParent(this.BG.getChildByPath("底色/特效区"));
        })
    }

    public ReGameNumber: number = 0;
    //重置场景
    ReGame() {
        this.ReGameNumber++;
        if (this.ReGameNumber >= 5) {
            director.loadScene("JJHZ_Game");
        } else {
            this.PlayerContent.children.forEach((cd) => {
                cd.getComponent(JJHZ_Player).ReStart();
            })
        }
    }
    //返回主页
    ReMain() {
        // Banner.Instance.StopNativeAd_30s();
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, "JJHZ_Start", () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "节奏盒子");
            });
        });
    }

    //打开教程
    Open_teaching() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "节奏盒子");
        this.UINode.getChildByName("教程界面").active = true;
    }
    //关闭教程
    Exit_teaching() {
        this.UINode.getChildByName("教程界面").active = false;
    }
    //打开暂停界面
    Open_StopPanel() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "节奏盒子");
        this.UINode.getChildByName("暂停界面").active = true;
        let nd = this.UINode.getChildByPath("暂停界面/板子");
        nd.setPosition(v3(0, 1800, 0));
        tween(nd)
            .to(0.4, { position: v3(0, 0, 0) }, { easing: "backOut" })
            .start();
    }
    //关闭暂停界面
    Exit_StopPanel() {
        let nd = this.UINode.getChildByPath("暂停界面/板子");
        tween(nd)
            .to(0.4, { position: v3(0, 1800, 0) }, { easing: "backIn" })
            .call(() => { this.UINode.getChildByName("暂停界面").active = false; })
            .start();

    }

    //重选风格
    SelectGameStart(target: EventTouch) {
        JJHZ_GameManager.GameScene = Number(target.target.name);
        director.loadScene("JJHZ_Game");
    }
}


