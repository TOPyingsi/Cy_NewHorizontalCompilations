import { _decorator, Button, Component, director, EventTouch, macro, Node, ScrollView, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { ZSTSB_AudioManager } from '../../ZSTSB_AudioManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ZSTSB_UIGame } from '../../ZSTSB_UIGame';
import Banner from 'db://assets/Scripts/Banner';
import { ZSTSB_Incident } from '../../ZSTSB_Incident';
import { BHPD_GameMgr } from '../BHPD_GameMgr';
import { BHPD_GameData } from '../BHPD_GameData';
const { ccclass, property } = _decorator;

@ccclass('BHPD_Map')
export class BHPD_Map extends Component {

    @property(Node)
    AdNode: Node = null;

    public mainMapNode: Node = null;
    start() {
        this.mainMapNode = this.node.getChildByName("大地图");
        this.refresghMap();

        if (BHPD_GameData.Instance.isFirst) {
            this.mainMapNode.getComponent(ScrollView).horizontal = false;
        }
        else {
            this.mainMapNode.getComponent(ScrollView).horizontal = true;
        }

        // this.schedule(BHPD_GameData.DateSave(), 5, macro.REPEAT_FOREVER, 5);

    }

    update(deltaTime: number) {

    }

    lockMapName: string = "";

    public onBtnClick(event: EventTouch) {
        ZSTSB_AudioManager.instance.playSFX("按钮");

        let targetName: string = event.target.name;
        //点击未解锁的地图
        if (targetName.startsWith("未解锁")) {
            this.lockMapName = event.target.name;
            this.ShowAd(true);
            return;
        }
        if (targetName.startsWith("地图")) {
            let match = targetName.match(/(\d+)$/);
            let level = parseInt(match[1]);

            // let lastChar = targetName.charAt(targetName.length - 1);
            // let level = parseInt(lastChar);
            BHPD_GameMgr.instance.level = level;
            this.ClickMap(targetName);
            return;
        }

        switch (event.target.name) {

            case "返回选图":

                BHPD_GameMgr.instance.restart();

                ZSTSB_UIGame.instance.changeMenu("选图界面");
                ZSTSB_UIGame.instance.hideColorBox();

                director.getScene().emit("钻石填色本_开始切换场景");
                this.scheduleOnce(() => {
                    this.mainMapNode.active = true;

                    if (BHPD_GameData.Instance.isFirst) {
                        this.mainMapNode.getComponent(ScrollView).horizontal = false;
                    }
                    else {
                        this.mainMapNode.getComponent(ScrollView).horizontal = true;
                    }
                    this.refresghMap();

                }, 0.3);

                break;
            // case "返回地图":
            // if (!ZSTSB_GameData.Instance.isFillFirst) {
            //     UIManager.ShowTip("请先完成当前关卡！");
            //     return;
            // }

            // ZSTSB_UIGame.instance.changeMenu("选图界面");

            // if (ZSTSB_GameData.Instance.isMapFirst) {
            //     ZSTSB_GameData.Instance.isMapFirst = false;
            //     this.node.getChildByName("新手教程").active = true;

            // }

            // this.scheduleOnce(async () => {
            //     // await ZSTSB_GameMgr.instance.restart
            //     ZSTSB_AudioManager.instance.playBGM("主界面");
            // }, 0);

            case "下一关":
                const mapID = BHPD_GameMgr.instance.curMapID;
                let newID = "";
                for (let i = 0; i < BHPD_GameData.Instance.mapData.length; i++) {

                    if (mapID === BHPD_GameData.Instance.mapData[i].BuildingName) {
                        if (i + 1 >= BHPD_GameData.Instance.mapData.length) {
                            UIManager.ShowTip("已经是最后一关!");
                            return;
                        }
                        newID = BHPD_GameData.Instance.mapData[i + 1].BuildingName;
                        break;
                    }

                }

                const level = BHPD_GameMgr.instance.level;
                BHPD_GameMgr.instance.restart();

                BHPD_GameMgr.instance.curMapID = newID;
                this.scheduleOnce(() => {
                    BHPD_GameMgr.instance.level = level + 1;
                    ZSTSB_UIGame.instance.changeMenu("游戏界面");
                    BHPD_GameMgr.instance.startGame();
                }, 0.2);

                break;
            case "返回选择模式":
                BHPD_GameData.DateSave();

                BHPD_GameMgr.instance.restart();
                ZSTSB_UIGame.instance.restartGame();

                ZSTSB_UIGame.instance.changeMenu("选图界面");
                ZSTSB_UIGame.instance.hideColorBox();

                director.getScene().emit("钻石填色本_开始切换场景");

                this.scheduleOnce(() => {
                    this.mainMapNode.active = true;

                    if (BHPD_GameData.Instance.isFirst) {
                        this.mainMapNode.getComponent(ScrollView).horizontal = false;
                    }
                    else {
                        this.mainMapNode.getComponent(ScrollView).horizontal = true;
                    }
                    this.refresghMap();

                    director.getScene().emit("钻石填色本_加载进度", 1);
                }, 0.3);

                break;

            case "观看广告":
                Banner.Instance.ShowVideoAd(() => {
                    this.ShowAd(false);
                    // 获取节点名称最后一位
                    let match = this.lockMapName.match(/(\d+)$/);
                    let mapID = parseInt(match[1]);

                    // let lastChar = this.lockMapName.charAt(this.lockMapName.length - 1);
                    // // 如果最后一位是数字，转换为整数
                    // let mapID = parseInt(lastChar);

                    BHPD_GameData.Instance.LockArr[mapID - 1] = true;
                    BHPD_GameMgr.instance.level = mapID;
                    BHPD_GameMgr.instance.curMapID = "地图" + mapID;
                    console.log(mapID);
                    this.loadGame();
                });
                break;
            case "关闭广告":
                this.ShowAd(false);
                break;
            case "填色按钮":
                if (BHPD_GameData.Instance.isFirst) {
                    director.getScene().emit("八花拼豆_新手教程");
                }
                this.loadGame();
                ZSTSB_UIGame.instance.hideColorBox();
                break;
            case "关闭填色":
                ZSTSB_UIGame.instance.hideColorBox();
                break;
            default:
                break;
        }

    }

    ShowAd(flag: boolean) {
        let adBtn = this.AdNode.getChildByName("观看广告").getComponent(Button);
        let closeBtn = this.AdNode.getChildByName("关闭广告").getComponent(Button);
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

    ClickMap(mapName: string) {
        let sprite = ZSTSB_UIGame.instance.ColorBox.getChildByName("图片").getComponent(Sprite);

        ZSTSB_Incident.LoadSprite("Sprites/八花拼豆/关卡/" + mapName + "最终").then((sp: SpriteFrame) => {
            sprite.spriteFrame = sp;
            const mapData = BHPD_GameData.Instance.getDataByName(mapName);
            if (mapData) {
                if (!mapData.State) {
                    sprite.grayscale = true;
                }
                else {
                    sprite.grayscale = false;
                }
            }

            BHPD_GameMgr.instance.curMapID = mapName;
            ZSTSB_UIGame.instance.showColorBox();
        })
    }

    loadGame() {
        director.getScene().emit("八花拼豆_进度条图片");

        this.scheduleOnce(() => {
            ZSTSB_UIGame.instance.changeMenu("游戏界面");
            BHPD_GameMgr.instance.startGame();
            console.error(111);
        }, 0.5);
    }

    loadMap(targetName: string) {
        director.getScene().emit("钻石填色本_开始切换场景");
        this.scheduleOnce(() => {
            this.mainMapNode.active = false;
            // this.curMapNode = this.node.getChildByName(targetName);
            // this.curMapNode.active = true;
            // 获取节点名称最后一位
            let nodeName = targetName;
            let lastChar = nodeName.charAt(nodeName.length - 1);
            // 如果最后一位是数字，转换为整数
            let mapID = parseInt(lastChar);
            // ZSTSB_GameMgr.instance.curMapID = mapID;

            ZSTSB_UIGame.instance.mapBtn.active = true;

            // console.log("切换到地图" + mapID);

        }, 0.5);
    }

    refresghMap() {
        this.scheduleOnce(() => {
            let mapData = BHPD_GameData.Instance.LockArr;
            let content = this.mainMapNode.getComponent(ScrollView).content;

            for (let i = 0; i < mapData.length; i++) {
                let flag = mapData[i];

                let mapNode = content.children[i + 3];

                if (flag) {
                    mapNode.children[0].active = false;
                    mapNode.name = "地图" + (i + 1).toString();
                }
                else {
                    mapNode.children[0].active = true;
                    mapNode.name = "未解锁" + (i + 1).toString();
                }
            }

        }, 0.1);
    }
}


