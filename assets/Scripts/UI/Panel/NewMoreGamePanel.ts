import { _decorator, Button, Component, Event, EventHandler, Node, resources, ScrollView, Sprite, SpriteFrame, Tween, tween, Vec3 } from 'cc';
import { MoreGameItem } from '../MoreGameItem';
import NodeUtil from '../../Framework/Utils/NodeUtil';
import { PoolManager } from '../../Framework/Managers/PoolManager';
import { DataManager, GameData } from '../../Framework/Managers/DataManager';
import { Constant } from '../../Framework/Const/Constant';
import { Panel, UIManager } from '../../Framework/Managers/UIManager';
import { AudioManager, Audios } from '../../Framework/Managers/AudioManager';
import { GameManager } from '../../GameManager';
import { PanelBase } from '../../Framework/UI/PanelBase';
const { ccclass, property } = _decorator;

@ccclass('NewMoreGamePanel')
export class NewMoreGamePanel extends PanelBase {

    TitleContent: Node = null;
    Content: Node = null;
    @property(Sprite)
    sprite: Sprite = null;
    @property([SpriteFrame])
    sfs: SpriteFrame[] = [];

    nextData: GameData;

    items: Node[] = [];

    protected onLoad(): void {
        this.TitleContent = NodeUtil.GetNode("TitleContent", this.node);
        this.Content = NodeUtil.GetNode("Content", this.node);
        this.Show();
    }

    Show() {
        this.node.active = true;
        this.items.forEach(e => PoolManager.PutNode(e));
        this.items = [];
        for (let i = 0; i < DataManager.GameData.length; i++) {
            const data = DataManager.GameData[i];
            PoolManager.GetNode(Constant.Path.NewMoreGameItem, this.TitleContent).then(node => {
                node.getComponent(Sprite).spriteFrame = this.sfs[i == 0 ? 1 : 0];
                resources.load(`Sprites/GameIcons/${data.gameName}/spriteFrame`, SpriteFrame, (err, sf) => { node.children[0].getComponent(Sprite).spriteFrame = sf; });
                let handler = new EventHandler();
                handler.component = "NewMoreGamePanel";
                handler.handler = "MoreGameItemCallback";
                handler.target = this.node;
                node.getComponent(Button).clickEvents.push(handler);
                console.log(node.getComponent(Button).clickEvents);
                this.items.push(node);
                if (i == 0) this.MoreGameItemCallback(this.TitleContent.children[0]);
            });
        }
    }

    MoreGameItemCallback(event: Event): void;
    MoreGameItemCallback(target: Node): void;
    MoreGameItemCallback(arg: Event | Node): void {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);
        //加载场景
        let target: Node;
        if ((arg as Event).target) target = (arg as Event).target;
        else target = arg as Node;
        for (let i = 0; i < this.TitleContent.children.length; i++) {
            const element = this.TitleContent.children[i].getComponent(Sprite);
            element.spriteFrame = this.sfs[0];
        }
        target.getComponent(Sprite).spriteFrame = this.sfs[1];
        let data = DataManager.GameData[target.getSiblingIndex()];
        this.nextData = data;
        resources.load(`Sprites/GameIcons/${data.gameName}${2}/spriteFrame`, SpriteFrame, (err, sf) => { this.sprite.spriteFrame = sf; });
    }

    Play() {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);
        console.log(`加载游戏：${this.nextData.gameName}`);
        GameManager.GameData = this.nextData;
        UIManager.ShowPanel(Panel.LoadingPanel, [this.nextData, this.nextData.startScene]);
    }
}