import { _decorator, Component, director, EventTouch, Label, Node, ScrollView, Sprite, SpriteFrame, v3 } from 'cc';
import { ZSTSB_GameData } from '../ZSTSB_GameData';
import { ZSTSB_MapBtn } from './ZSTSB_MapBtn';
import Banner from 'db://assets/Scripts/Banner';
import { ZSTSB_GameMgr } from '../ZSTSB_GameMgr';
import { ZSTSB_UIGame } from '../ZSTSB_UIGame';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ZSTSB_Incident } from '../ZSTSB_Incident';
import { ZSTSB_AudioManager } from '../ZSTSB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_Map')
export class ZSTSB_Map extends Component {
    @property(Node)
    returnBtn: Node = null;

    @property(Node)
    courseNode: Node = null;

    public mainMapNode: Node = null;
    private curMapNode: Node = null;
    start() {
        this.mainMapNode = this.node.getChildByName("大地图");
        this.refreshBigMap();
    }

    update(deltaTime: number) {

    }

    public onBtnClick(event: EventTouch) {
        ZSTSB_AudioManager.instance.playSFX("按钮");

        let targetName: string = event.target.name;
        //点击未解锁的大地图
        if (targetName.startsWith("未解锁")) {
            Banner.Instance.ShowVideoAd(() => {
                // 获取节点名称最后一位
                let nodeName = event.target.name;
                let lastChar = nodeName.charAt(nodeName.length - 1);
                // 如果最后一位是数字，转换为整数
                let mapID = parseInt(lastChar);
                ZSTSB_GameData.Instance.mapLockArr[mapID - 1] = true;
                this.loadMap(event.target.name);
            });
            return;
        }
        if (targetName.startsWith("地图")) {
            this.loadMap(event.target.name);
            return;
        }

        switch (event.target.name) {
            case "返回主页":
                ZSTSB_GameData.DateSave();
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "钻石填色本");
                    });
                });
                break;
            case "返回选图":
                director.getScene().emit("钻石填色本_开始切换场景");
                this.scheduleOnce(() => {
                    this.mainMapNode.active = true;
                    this.curMapNode.active = false;
                    ZSTSB_UIGame.instance.mapBtn.active = false;
                    this.returnBtn.active = true;

                    this.refreshBigMap();

                    ZSTSB_AudioManager.instance.playBGM("主场景");

                }, 0.3);

                break;
            case "返回地图":
                ZSTSB_UIGame.instance.changeMenu("选图界面");

                this.refreshBigMap(false);
                this.refresghMap(ZSTSB_GameMgr.instance.curMapID, false);
                ZSTSB_GameMgr.instance.restart();

                ZSTSB_AudioManager.instance.playBGM("主场景");

                break;
            case "教程按钮":
                this.courseNode.active = true;
                break;
            case "填色按钮":
                this.loadGame();
                ZSTSB_UIGame.instance.hideColorBox();
                break;
            case "关闭填色":
                ZSTSB_UIGame.instance.hideColorBox();
                break;
            case "快速填色":
                this.SearchFill();
                break;
            default:
                break;
        }

    }

    SearchFill() {
        let imgArr = ZSTSB_GameData.Instance.getMapDataByID(ZSTSB_GameMgr.instance.curMapID);

        for (let i = 0; i < imgArr.length; i++) {
            let flag = imgArr[i].State;
            let name = imgArr[i].BuildingName;

            if (!flag) {
                ZSTSB_GameMgr.instance.curBuildingName = name;
                let sprite = ZSTSB_UIGame.instance.ColorBox.getChildByName("图片").getComponent(Sprite);

                let levelName = "关卡" + ZSTSB_GameMgr.instance.curMapID;
                let path = "Sprites/关卡/" + levelName + "/" + name;
                ZSTSB_Incident.LoadSprite(path).then((spriteFrame: SpriteFrame) => {
                    sprite.spriteFrame = spriteFrame;
                    ZSTSB_GameMgr.instance.curBuildingName = name;
                    ZSTSB_UIGame.instance.showColorBox();
                });
                break;
            }
        }
    }

    loadGame() {
        this.scheduleOnce(() => {
            ZSTSB_UIGame.instance.changeMenu("游戏界面");
            ZSTSB_GameMgr.instance.startGame();
        }, 0.5);
    }

    loadMap(targetName: string) {
        director.getScene().emit("钻石填色本_开始切换场景");
        this.scheduleOnce(() => {
            this.mainMapNode.active = false;
            this.curMapNode = this.node.getChildByName(targetName);
            this.curMapNode.active = true;
            // 获取节点名称最后一位
            let nodeName = targetName;
            let lastChar = nodeName.charAt(nodeName.length - 1);
            // 如果最后一位是数字，转换为整数
            let mapID = parseInt(lastChar);
            ZSTSB_GameMgr.instance.curMapID = mapID;

            this.initMapData(mapID);

            ZSTSB_UIGame.instance.mapBtn.active = true;

            this.updateMapProcess(mapID);

            console.log("切换到地图" + mapID);

            if (ZSTSB_GameData.Instance.isMapFirst) {
                this.courseNode.active = true;
                ZSTSB_GameData.Instance.isMapFirst = false;
            }
        }, 0.5);
    }

    //初始化地图数据
    initMapData(mapID: number) {
        let mapData = ZSTSB_GameData.Instance.getMapDataByID(mapID);
        console.log(mapData);

        for (let i = 0; i < mapData.length; i++) {
            let flag = mapData[i].State;
            let name = mapData[i].BuildingName;
            let mapNode = this.node.children[mapID];
            let content = mapNode.getComponent(ScrollView).content;

            let btnTs = content.children[i + 2].getComponent(ZSTSB_MapBtn);
            if (flag) {
                btnTs.Complete(name);
            }
            else {
                btnTs.init(name);
            }

            director.getScene().emit("钻石填色本_加载进度", (i + 1) / mapData.length);
        }

        this.returnBtn.active = false;

    }

    refresghMap(mapID: number, needEmit: boolean = true) {
        this.scheduleOnce(() => {
            let mapData = ZSTSB_GameData.Instance.getMapDataByID(mapID);

            this.updateMapProcess(mapID);

            for (let i = 0; i < mapData.length; i++) {
                let flag = mapData[i].State;
                let name = mapData[i].BuildingName;
                let mapNode = this.node.getChildByName("地图" + mapID);
                let content = mapNode.getComponent(ScrollView).content;

                let btnTs = content.children[i + 2].getComponent(ZSTSB_MapBtn);
                if (flag) {
                    btnTs.Complete(name);
                }

                if (needEmit) {
                    director.getScene().emit("钻石填色本_加载进度", (i + 1) / mapData.length);
                }

            }


        }, 0.3);
    }

    updateMapProcess(mapID: number) {
        let mapData = ZSTSB_GameData.Instance.getMapDataByID(mapID);

        let spriteNode = ZSTSB_UIGame.instance.ColorBox.getChildByName("图片");

        switch (mapID) {
            case 1:
                spriteNode.scale = v3(6, 6, 6);
                break;
            case 2:
                spriteNode.scale = v3(4, 4, 4);
                break;
            case 3:
                spriteNode.scale = v3(6, 6, 6);
                break;

        }

        let unfinish: number = mapData.length;
        let finish: number = 0;
        for (let i = 0; i < mapData.length; i++) {
            let flag = mapData[i].State;
            if (flag) {
                finish++;
            }
        }

        let process = finish / unfinish;
        let progressNode = this.node.getChildByName("Btn").getChildByName("进度条");
        let progressSprite = progressNode.getChildByName("进度").getComponent(Sprite);
        progressSprite.fillRange = process;

        let progressLabel = progressNode.getChildByName("进度百分比").getComponent(Label);
        progressLabel.string = (process * 100).toFixed(2) + "%";
    }

    refreshBigMap(needEmit: boolean = true) {
        let scroll = this.node.getChildByName("大地图").getComponent(ScrollView);

        for (let i = 0; i < ZSTSB_GameData.Instance.mapLockArr.length; i++) {
            let flag = ZSTSB_GameData.Instance.mapLockArr[i];
            if (!flag) {
                scroll.content.children[i + 2].name = "未解锁" + (i + 1);
                this.node.children[i + 1].name = "未解锁" + (i + 1);

                let sprite = scroll.content.children[i + 2].getComponent(Sprite);
                sprite.grayscale = true;
                scroll.content.children[i + 2].children[0].active = true;
            }
            else {
                scroll.content.children[i + 2].name = "地图" + (i + 1);
                this.node.children[i + 1].name = "地图" + (i + 1);

                let sprite = scroll.content.children[i + 2].getComponent(Sprite);
                sprite.grayscale = false;
                scroll.content.children[i + 2].children[0].active = false;
            }

            if (needEmit) {
                director.getScene().emit("钻石填色本_加载进度", (i + 1) / ZSTSB_GameData.Instance.mapLockArr.length);
            }
        }
    }
}


