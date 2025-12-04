import { _decorator, Component, director, EventTouch, Node, ScrollView, tween, UIOpacity } from 'cc';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
import { HJMSJ_Role } from './HJMSJ_Role';
import { HJMSJ_AudioManager } from '../HJMSJ_AudioManager';
import { HJMSJ_Music } from './HJMSJ_Music';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_SwitchMusic')
export class HJMSJ_SwitchMusic extends Component {

    private SkinMgr: ScrollView = null;
    private SkinStoreNode: Node = null;

    start() {
        this.SkinStoreNode = this.node.getChildByName("切歌界面");
        this.SkinMgr = this.node.getChildByName("切歌界面").getComponentInChildren(ScrollView);

        this.init();

        director.getScene().on("哈基米世界_打开切歌", this.open, this);
    }

    init() {
        for (let i = 0; i < HJMSJ_AudioManager.instance.bgmNameArr.length; i++) {
            let musicTs = this.SkinMgr.content.children[i].getComponent(HJMSJ_Music);
            musicTs.init(HJMSJ_AudioManager.instance.bgmNameArr[i]);
            if (i === 0) {
                musicTs.onClick();
            }
        }
    }

    onBtnClick(event: EventTouch) {
        switch (event.target.name) {
            case "关闭切歌":
                this.close();
                break;
        }
    }


    open() {
        this.SkinStoreNode.active = true;
        this.node.getChildByName("bg").active = true;

        let uiOp = this.getComponent(UIOpacity);
        tween(uiOp)
            .to(0.3, { opacity: 255 })
            .start();

    }

    close() {
        let uiOp = this.getComponent(UIOpacity);
        tween(uiOp)
            .to(0.3, { opacity: 0 })
            .call(() => {
                this.SkinStoreNode.active = false;
                this.node.getChildByName("bg").active = false;
            })
            .start();
    }
}


