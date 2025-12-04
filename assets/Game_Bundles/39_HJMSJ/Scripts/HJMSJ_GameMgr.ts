import { _decorator, AudioClip, AudioSource, Component, director, EventTouch, instantiate, Node, Prefab, Sprite, SpriteFrame, UITransform, v3, Vec3 } from 'cc';
import { HJMSJ_BagMgr } from './Bag/HJMSJ_BagMgr';
import { HJMSJ_GameData } from './HJMSJ_GameData';
import { HJMSJ_Prop } from './Bag/HJMSJ_Prop';
import { HJMSJ_Incident } from './HJMSJ_Incident';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { HJMSJ_Player } from './Player/HJMSJ_Player';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_GameMgr')
export class HJMSJ_GameMgr extends Component {

    @property(Node)
    public Pause: Node = null;

    @property(Node)
    public playerNode: Node = null;

    @property(Prefab)
    dropProp: Prefab = null;

    @property(Node)
    startMapNode: Node = null;
    @property(Node)
    mapNode: Node = null;

    @property({ type: [AudioClip] })
    clips: AudioClip[] = [];

    public BagMgrTs: HJMSJ_BagMgr = null;

    public isBossMap: boolean = false;

    public isGameOver: boolean = false;

    public isGamePause: boolean = false;

    public static instance: HJMSJ_GameMgr = null;
    start() {
        HJMSJ_GameMgr.instance = this;

        console.log(HJMSJ_GameData.Instance.levelReward);

        ProjectEventManager.emit(ProjectEvent.游戏开始);

        this.BagMgrTs = director.getScene().getChildByName("Canvas").getComponentInChildren(HJMSJ_BagMgr);
        director.getScene().on("哈基米世界_掉落物品", (propName: string, pos: Vec3) => {
            this.DropProp(propName, pos);
        }, this);

        // let curSkinData = HJMSJ_GameData.Instance.getSkinData(HJMSJ_GameData.Instance.curSkin);
        // HJMSJ_GameData.Instance.getSkinMap.set(curSkinData.Name, curSkinData);
        // HJMSJ_GameData.Instance.buySkin(curSkinData.Name);
    }

    update(deltaTime: number) {

    }


    returnMap() {
        this.startMapNode.active = true;
        this.mapNode = this.startMapNode;
        this.playerNode.position = v3(0, 0, 0);
        let playerTs = this.playerNode.getComponent(HJMSJ_Player);
        playerTs.mapUITransform = this.startMapNode.getComponent(UITransform);
    }

    changeMap(map: Node) {

        let index = this.mapNode.getSiblingIndex();
        map.parent = this.mapNode.parent;
        map.setSiblingIndex(index + 1);

        this.mapNode.destroy();

        this.playerNode.position = v3(0, 0, 0);
        this.mapNode = map;
        let playerTs = this.playerNode.getComponent(HJMSJ_Player);
        playerTs.mapUITransform = map.getComponent(UITransform);

        console.log("更换地图结束");

        if (map.name.startsWith("BossMap")) {
            this.isBossMap = true;
        }
        else {
            this.isBossMap = false;
        }
    }

    revive() {
        HJMSJ_GameData.Instance.hp = 10;

        this.isGameOver = false;
        this.BagMgrTs.subPropByName("不死图腾", 1);
        let playerTs = this.playerNode.getComponent(HJMSJ_Player);
        playerTs.curHealth = 10;
    }

    Lost() {
        this.isGameOver = true;
        HJMSJ_GameData.DateSave();
        ProjectEventManager.emit(ProjectEvent.游戏结束);
    }

    onBtnClick(event: EventTouch) {
        switch (event.target.name) {
            case "返回主页":
                HJMSJ_GameData.DateSave();
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "哈基米世界");
                    });
                });
                break;
            case "重新开始":
                HJMSJ_GameData.Instance.hp = 10;
                director.loadScene("HJMSJ_Game");
                break;
            case "暂停":
                this.isGamePause = true;
                this.Pause.active = true;
                break;
            case "继续游戏":
                this.isGamePause = false;
                this.Pause.active = false;
                break;
            case "打开切歌":
                director.getScene().emit("哈基米世界_打开切歌");
                break;

        }
    }

    DropProp(propName: string, pos: Vec3) {
        let dropPropNode = instantiate(this.dropProp);
        dropPropNode.parent = this.mapNode.children[0];

        dropPropNode.worldPosition = pos;

        dropPropNode.getComponent(HJMSJ_Prop).propName = propName;

        HJMSJ_Incident.LoadSprite("Sprites/物品/" + propName).then((sp: SpriteFrame) => {
            dropPropNode.getChildByName("propSprite").getComponent(Sprite).spriteFrame = sp;
            console.error("掉落" + propName);
            // console.log(HJMSJ_GameData.Instance.KnapsackData);
        })
    }



    protected onDestroy(): void {
        HJMSJ_GameData.DateSave();
    }
}


