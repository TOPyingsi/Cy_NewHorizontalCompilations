import { _decorator, Component, director, EventTouch, Node, ScrollView, tween, UIOpacity } from 'cc';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
import { HJMSJ_Role } from './HJMSJ_Role';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_SkinStore')
export class HJMSJ_SkinStore extends Component {

    private SkinMgr: ScrollView = null;
    private SkinStoreNode: Node = null;

    start() {
        this.SkinStoreNode = this.node.getChildByName("皮肤界面");
        this.SkinMgr = this.node.getChildByName("皮肤界面").getComponentInChildren(ScrollView);

        this.initSkin();

        director.getScene().on("哈基米世界_刷新皮肤数据", this.refreshData, this);

        director.getScene().on("哈基米世界_交互", (InteractTarget: string) => {
            if (InteractTarget === "皮肤商城") {
                this.open();
            }
        }, this);
    }

    initSkin() {
        for (let i = 0; i < HJMSJ_GameData.Instance.SkinData.length; i++) {
            let data = HJMSJ_GameData.Instance.SkinData[i];

            let skinNode = this.SkinMgr.content.children[i];
            let skinTs = skinNode.getComponent(HJMSJ_Role);
            skinTs.initData(data);
        }
    }

    refreshData() {
        for (let i = 0; i < HJMSJ_GameData.Instance.SkinData.length; i++) {
            let data = HJMSJ_GameData.Instance.SkinData[i];

            let skinNode = this.SkinMgr.content.children[i];
            let skinTs = skinNode.getComponent(HJMSJ_Role);
            skinTs.refreshData(data);
        }
    }

    onBtnClick(event: EventTouch) {
        switch (event.target.name) {
            case "返回键":
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


