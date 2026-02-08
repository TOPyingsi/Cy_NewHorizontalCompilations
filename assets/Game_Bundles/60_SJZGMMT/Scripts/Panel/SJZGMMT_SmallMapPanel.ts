import { _decorator, Color, Component, director, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_Incident } from '../SJZGMMT_Incident';

const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_SmallMapPanel')
export class SJZGMMT_SmallMapPanel extends PanelBase {
    private MapSprite: Sprite = null;
    private PlayyerSpriteNode: Node = null;

    protected onLoad(): void {
        this.MapSprite = this.node.getChildByPath("框/Map").getComponent(Sprite);
        this.PlayyerSpriteNode = this.node.getChildByPath("框/Player");
    }
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.LoadMap();
    }

    //加载地图
    LoadMap() {
        SJZGMMT_Incident.LoadSprite("Sprites/小地图/" + SJZGMMT_GameManager.GameScene).then((sp: SpriteFrame) => {
            this.MapSprite.spriteFrame = sp;
        })
        this.ShowPlayerPos();

    }
    //角色位置刷新 
    ShowPlayerPos() {
        if (SJZGMMT_GameManager.Instance.PlayerNode) {
            this.PlayyerSpriteNode.position = SJZGMMT_GameManager.Instance.PlayerNode.position.clone().multiplyScalar(0.17);
        }
    }
    OnExit() {
        SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.SmallMapPanel)

    }

}


