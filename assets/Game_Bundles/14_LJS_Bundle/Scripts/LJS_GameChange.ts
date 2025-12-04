import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LJS_GameChange')
export class LJS_GameChange extends Component {
    public static Instance: LJS_GameChange = null;

    protected onLoad(): void {
        LJS_GameChange.Instance = this;
    }
    start() {

    }

    update(deltaTime: number) {
        this.Change();
    }

    Change() {
     

        //优化图片生成; i++) {
        if (this.node.children.length > 1) {
            this.node.children[0].destroy();
          
        }

    }
}


