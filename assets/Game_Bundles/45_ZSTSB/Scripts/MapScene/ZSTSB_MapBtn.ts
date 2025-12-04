import { _decorator, Color, Component, director, Node, NodeEventType, Sprite, SpriteFrame, tween } from 'cc';
import { ZSTSB_Incident } from '../ZSTSB_Incident';
import { ZSTSB_UIGame } from '../ZSTSB_UIGame';
import { ZSTSB_GameMgr } from '../ZSTSB_GameMgr';
import { ZSTSB_GameData } from '../ZSTSB_GameData';
import { ZSTSB_AudioManager } from '../ZSTSB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_MapBtn')
export class ZSTSB_MapBtn extends Component {
    private buildingName: string = "";
    start() {

    }

    update(deltaTime: number) {

    }

    init(name: string) {
        this.buildingName = name;

        //转化为灰度图片
        let sprite = this.getComponent(Sprite);
        sprite.grayscale = true;

        this.node.on(NodeEventType.TOUCH_END, this.touchEnd, this);
    }

    Complete(name: string) {
        this.buildingName = name;

        let sprite = this.getComponent(Sprite);
        sprite.grayscale = false;

        this.node.on(NodeEventType.TOUCH_END, this.touchEnd, this);
    }

    touchEnd() {
        ZSTSB_AudioManager.instance.playSFX("按钮");

        let data = ZSTSB_GameData.Instance.getMapDataByName(ZSTSB_GameMgr.instance.curMapID, this.buildingName);
        if (data.State) {
            return;
        }

        let sprite = ZSTSB_UIGame.instance.ColorBox.getChildByName("图片").getComponent(Sprite);

        let levelName = "关卡" + ZSTSB_GameMgr.instance.curMapID;
        let path = "Sprites/关卡/" + levelName + "/" + this.buildingName;
        ZSTSB_Incident.LoadSprite(path).then((spriteFrame: SpriteFrame) => {
            sprite.spriteFrame = spriteFrame;
            ZSTSB_GameMgr.instance.curBuildingName = this.buildingName;
            ZSTSB_UIGame.instance.showColorBox();
        });

    }

}


