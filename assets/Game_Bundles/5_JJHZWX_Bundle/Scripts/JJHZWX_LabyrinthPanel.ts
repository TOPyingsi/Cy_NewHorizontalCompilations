import { _decorator, Component, instantiate, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { JJHZWX_incident } from './JJHZWX_incident';
import { JJHZWX_Joystick } from './JJHZWX_Joystick';
import { JJHZWX_LabyrinthPlayer } from './JJHZWX_LabyrinthPlayer';
const { ccclass, property } = _decorator;

@ccclass('JJHZWX_LabyrinthPanel')
export class JJHZWX_LabyrinthPanel extends Component {
    public GameScene: number = 0;//游戏关卡
    start() {

    }

    //初始化数据
    Init() {
        //加载地图
        JJHZWX_incident.Loadprefab("LabyrinthPanel/" + this.GameScene + "/地图").then((pre: Prefab) => {
            let nd = instantiate(pre);
            nd.setParent(this.node);
            nd.setSiblingIndex(2);
            //初始化人
            JJHZWX_incident.LoadSprite("LabyrinthPanel/" + this.GameScene + "/玩家").then((sprite: SpriteFrame) => {
                this.node.getChildByPath("地图/玩家").getComponent(Sprite).spriteFrame = sprite;
            })
            //初始化道具
            JJHZWX_incident.LoadSprite("LabyrinthPanel/" + this.GameScene + "/道具").then((sprite: SpriteFrame) => {
                this.node.getChildByPath("地图/道具").getComponent(Sprite).spriteFrame = sprite;
            })
            //初始化敌人
            JJHZWX_incident.LoadSprite("LabyrinthPanel/" + this.GameScene + "/敌人").then((sprite: SpriteFrame) => {
                this.node.getChildByPath("地图/敌人Node").children.forEach((cd) => {
                    cd.getComponent(Sprite).spriteFrame = sprite;
                })
            })
            this.node.getChildByName("Joystick").getComponent(JJHZWX_Joystick).Player = nd.getChildByName("玩家").getComponent(JJHZWX_LabyrinthPlayer);
        })

    }




}


