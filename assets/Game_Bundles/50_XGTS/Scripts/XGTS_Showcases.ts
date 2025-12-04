import { _decorator, Component, Sprite, Node, BoxCollider2D, SpriteFrame, Layers, v3, Vec3, view, Collider2D, IPhysics2DContact, Contact2DType, CCString, Label } from 'cc';
import XGTS_Showcase from './XGTS_Showcase';
import { XGTS_DataManager } from './XGTS_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_Showcases')
export default class XGTS_Showcases extends Component {
    public static Instance: XGTS_Showcases = null;

    showcases: XGTS_Showcase[] = [];

    protected onLoad(): void {
        XGTS_Showcases.Instance = this;
    }

    start() {
        this.showcases = [];
        for (let i = 0; i < this.node.children.length; i++) {
            let showcase = this.node.children[i].getComponent(XGTS_Showcase);
            showcase.Init(XGTS_DataManager.ShowcaseData[i]);
            this.showcases.push(showcase);
        }
    }

    GetTarget(name: string, putcallback: Function = null) {
        let result = this.showcases.find(e => e.data.Name == name);
        if (result) {
            result.putcallback = putcallback;
        } else {
            console.error(`大红展览里面没有 name:  ${name} 的物品`);
        }
        return result;
    }

}