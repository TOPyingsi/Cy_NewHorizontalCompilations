import { _decorator, Button, Component, director, EventTouch, Label, macro, Node, ScrollView, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { ZSTSB_GameData } from '../ZSTSB_GameData';
import { ZSTSB_MapBtn } from './ZSTSB_MapBtn';
import Banner from 'db://assets/Scripts/Banner';
import { ZSTSB_GameMgr } from '../ZSTSB_GameMgr';
import { ZSTSB_UIGame } from '../ZSTSB_UIGame';
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

    @property(Node)
    AdNode: Node = null;

    public mainMapNode: Node = null;
    private curMapNode: Node = null;
    start() {
        this.mainMapNode = this.node.getChildByName("大地图");
        this.refreshBigMap(false);

        // this.schedule(ZSTSB_GameData.DateSave(), 5, macro.REPEAT_FOREVER, 5);

        // if (ZSTSB_GameData.Instance.isMapFirst) {
        //     this.mainMapNode.getComponent(ScrollView).horizontal = false;
        //     this.curMapNode.getComponent(ScrollView).horizontal = false;

        // } else {
        //     this.mainMapNode.getComponent(ScrollView).horizontal = true;
        //     this.curMapNode.getComponent(ScrollView).horizontal = true;
        // }
    }

    update(deltaTime: number) {

    }

    lockMapName: string = "";

    public onBtnClick(event: EventTouch) {
        ZSTSB_AudioManager.instance.playSFX("按钮");

        let targetName: string = event.target.name;
        //点击未解锁的大地图
        if (targetName.startsWith("未解锁")) {
            this.lockMapName = event.target.name;
            this.ShowAd(true);
            return;
        }
        if (targetName.startsWith("地图")) {
            this.loadMap(event.target.name);
            return;
        }

        switch (event.target.name) {

            case "返回选图":
                director.getScene().emit("钻石填色本_开始切换场景");
                ZSTSB_UIGame.instance.hideColorBox();

                this.scheduleOnce(() => {
                    this.mainMapNode.active = true;
                    this.curMapNode.active = false;
                    ZSTSB_UIGame.instance.mapBtn.active = false;
                    this.returnBtn.active = true;

                    this.refreshBigMap();

                    // ZSTSB_AudioManager.instance.playBGM("主界面");

                }, 0.3);

                break;
            case "返回地图":
                if (!ZSTSB_GameData.Instance.isFillFirst) {
                    UIManager.ShowTip("请先完成当前关卡！");
                    return;
                }

                ZSTSB_GameData.DateSave();
                ZSTSB_UIGame.instance.changeMenu("选图界面");

                ZSTSB_GameMgr.instance.StopWinEffect();

                if (ZSTSB_GameData.Instance.isMapFirst) {
                    ZSTSB_GameData.Instance.isMapFirst = false;
                    this.node.getChildByName("新手教程").active = true;

                    this.mainMapNode.getComponent(ScrollView).horizontal = true;
                    this.curMapNode.getComponent(ScrollView).horizontal = true;

                }

                this.refreshBigMap(false);
                this.refresghMap(ZSTSB_GameMgr.instance.curMapID, false);

                this.scheduleOnce(async () => {
                    await ZSTSB_GameMgr.instance.restart();
                    ZSTSB_AudioManager.instance.playBGM("主界面");
                }, 0);

                break;
            case "返回选择模式":
                ZSTSB_GameData.DateSave();

                director.getScene().emit("钻石填色本_开始切换场景");

                ZSTSB_UIGame.instance.restartGame();

                this.scheduleOnce(() => {
                    director.getScene().emit("钻石填色本_加载进度", 1);
                }, 0.2);
                break;
            case "观看广告":
                Banner.Instance.ShowVideoAd(() => {
                    this.ShowAd(false);
                    // 获取节点名称最后一位
                    let lastChar = this.lockMapName.charAt(this.lockMapName.length - 1);
                    // 如果最后一位是数字，转换为整数
                    let mapID = parseInt(lastChar);
                    ZSTSB_GameData.Instance.mapLockArr[mapID - 1] = true;
                    this.loadMap(this.lockMapName);
                });
                break;
            case "关闭广告":
                this.ShowAd(false);
                break;
            case "教程按钮":
                this.courseNode.active = true;
                break;
            case "填色按钮":
                if (ZSTSB_GameData.Instance.isGameFirst) {
                    director.getScene().emit("钻石填色本_新手教程");
                }
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

    ShowAd(flag: boolean) {
        let adBtn = this.AdNode.getChildByName("观看广告").getComponent(Button);
        let closeBtn = this.AdNode.getChildByName("关闭广告").getComponent(Button);

        if (!adBtn.enabled) {
            return;
        }

        if (flag) {

            this.AdNode.active = true;
            adBtn.enabled = false;
            closeBtn.enabled = false;

            tween(this.AdNode)
                .to(0.5, { scale: v3(1, 1, 1) }, { easing: "backInOut" })
                .call(() => {
                    adBtn.enabled = true;
                    closeBtn.enabled = true;
                })
                .start();
        }
        else {
            adBtn.enabled = false;
            closeBtn.enabled = false;

            tween(this.AdNode)
                .to(0.3, { scale: v3(0, 0, 0) }, { easing: "backInOut" })
                .call(() => {
                    adBtn.enabled = true;
                    closeBtn.enabled = true;
                    this.AdNode.active = false;
                })
                .start();
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
            console.error(111);
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

            // console.log("切换到地图" + mapID);

        }, 0.5);
    }

    //初始化地图数据
    initMapData(mapID: number) {
        let mapData = ZSTSB_GameData.Instance.getMapDataByID(mapID);
        // console.log(mapData);

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
        if (ZSTSB_GameData.Instance.isMapFirst) {
            this.mainMapNode.getComponent(ScrollView).horizontal = false;
            this.node.getChildByName("地图1").getComponent(ScrollView).horizontal = false;
        } else {
            this.mainMapNode.getComponent(ScrollView).horizontal = true;
            this.node.getChildByName("地图1").getComponent(ScrollView).horizontal = true;
        }

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
            case 4:
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

        if (process >= 1) {
            let mapID = ZSTSB_GameMgr.instance.curMapID;
            //判断是否为最后一关
            if (mapID < ZSTSB_GameData.Instance.mapLockArr.length) {
                ZSTSB_GameData.Instance.mapLockArr[mapID] = true;
            }
        }

        let progressLabel = progressNode.getChildByName("进度百分比").getComponent(Label);
        progressLabel.string = (process * 100).toFixed(2) + "%";
    }

    refreshBigMap(needEmit: boolean = true) {
        let scroll = this.node.getChildByName("大地图").getComponent(ScrollView);
        let lockLength = ZSTSB_GameData.Instance.mapLockArr.length;
        let curView = this.curMapNode?.getComponent(ScrollView);

        if (ZSTSB_GameData.Instance.isMapFirst) {
            this.mainMapNode.getComponent(ScrollView).horizontal = false;
            this.node.getChildByName("地图1").getComponent(ScrollView).horizontal = false;
        } else {
            this.mainMapNode.getComponent(ScrollView).horizontal = true;
            this.node.getChildByName("地图1").getComponent(ScrollView).horizontal = true;
        }

        for (let i = 0; i < ZSTSB_GameData.Instance.mapLockArr.length; i++) {
            let flag = ZSTSB_GameData.Instance.mapLockArr[i];
            if (!flag) {
                scroll.content.children[i + 3].name = "未解锁" + (i + 1);
                this.node.children[i + 1].name = "未解锁" + (i + 1);

                // let sprite = scroll.content.children[i].getComponent(Sprite);
                // sprite.grayscale = true;
                scroll.content.children[i + 3].children[0].active = true;
            }
            else {
                scroll.content.children[i + 3].name = "地图" + (i + 1);
                this.node.children[i + 1].name = "地图" + (i + 1);

                // let sprite = scroll.content.children[i].getComponent(Sprite);
                // sprite.grayscale = false;
                scroll.content.children[i + 3].children[0].active = false;
            }

            if (needEmit) {
                director.getScene().emit("钻石填色本_加载进度", (i + 1) / lockLength);
            }
        }

    }
}


