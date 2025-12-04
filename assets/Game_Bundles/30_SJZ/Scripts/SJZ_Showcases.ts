import { _decorator, Component, Sprite, Node, BoxCollider2D, SpriteFrame, Layers, v3, Vec3, view, Collider2D, IPhysics2DContact, Contact2DType, CCString, Label } from 'cc';
import SJZ_Showcase from './SJZ_Showcase';
import { SJZ_DataManager } from './SJZ_DataManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_Showcases')
export default class SJZ_Showcases extends Component {
    public static Instance: SJZ_Showcases = null;

    showcases: SJZ_Showcase[] = [];

    protected onLoad(): void {
        SJZ_Showcases.Instance = this;
    }

    start() {
        this.showcases = [];
        for (let i = 0; i < this.node.children.length; i++) {
            let showcase = this.node.children[i].getComponent(SJZ_Showcase);
            showcase.Init(SJZ_DataManager.ShowcaseData[i]);
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