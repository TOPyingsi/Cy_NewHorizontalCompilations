import { _decorator, Component, director, EventTouch, instantiate, Node, PageView, Prefab, tween, UIOpacity } from 'cc';
import { HJMSJ_Constant } from '../HJMSJ_Constant';
import { HJMSJ_BuyProp } from './HJMSJ_BuyProp';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
import { HJMSJ_BagMgr } from '../Bag/HJMSJ_BagMgr';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Store')
export class HJMSJ_Store extends Component {

    @property(Prefab)
    buyNode: Prefab = null;

    private storeNode: Node = null;
    private pageView: PageView = null;

    start() {
        this.storeNode = this.node.getChildByName("商店");
        this.pageView = this.storeNode.getChildByName("PageView").getComponent(PageView);

        this.initData();

        director.getScene().on("哈基米世界_交互", (InteractTarget: string) => {
            if (InteractTarget === "购买商店") {
                this.open();
            }
        }, this);
    }

    initData() {

        let j = 0;
        for (let i = 0; i < HJMSJ_Constant.StoreData.length; i++) {
            let buyNode: Node = instantiate(this.buyNode);
            buyNode.parent = this.pageView.content.children[j];

            if (this.pageView.content.children[j].children.length === 4) {
                j++;
            }

            let buyPropTs = buyNode.getComponent(HJMSJ_BuyProp);
            buyPropTs.init(HJMSJ_Constant.StoreData[i]);

        }

    }

    onBtnClick(event: EventTouch) {
        switch (event.target.name) {
            case "上一页":
                this.prePage();
                break;
            case "下一页":
                this.nextPage();
                break;
            case "退出":
                this.close();
                break;
            case "观看广告":
                Banner.Instance.ShowVideoAd(() => {
                    if (HJMSJ_GameData.Instance.pushKnapsackData("绿宝石", 50, HJMSJ_BagMgr.curBagID)) {
                        HJMSJ_GameMgr.instance.BagMgrTs.pushPropByName("绿宝石", 50);
                    }
                });
                break;
        }
    }

    open() {
        this.storeNode.active = true;
        this.node.getChildByName("bg").active = true;
        this.node.getChildByName("商店底框").active = true;

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
                this.storeNode.active = false;
                this.node.getChildByName("商店底框").active = false;
                this.node.getChildByName("bg").active = false;
            })
            .start();
    }

    prePage() {
        let index = this.pageView.getCurrentPageIndex();
        if (index > 0) {
            this.pageView.scrollToPage(index - 1);
        }
    }

    nextPage() {
        let index = this.pageView.getCurrentPageIndex();
        if (index < this.pageView.content.children.length - 1) {
            this.pageView.scrollToPage(index + 1);
        }
    }
}


