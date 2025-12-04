import { _decorator, Collider2D, Component, Contact2DType, EventTouch, find, instantiate, IPhysics2DContact, Node, PhysicsSystem2D, Prefab, v3, Vec3 } from 'cc';
import { LSJ_WorkSpaceManager } from './LSJ_WorkSpaceManager';
import { LJS_TempElement } from './LJS_TempElement';
import { LJS_GameChange } from './LJS_GameChange';
const { ccclass, property } = _decorator;

@ccclass('LJS_ElementDraggable')
export class LJS_ElementDraggable extends Component {
    @property(String) elementType: string = '';
    @property(Prefab) elementPrefab: Prefab = null!; // 用于生成拖动时的临时元素
    @property(Prefab) spritePrefab: Prefab = null!; // 用于生成拖动时的临时元素
    private startPos: Vec3 = new Vec3();
    private tempElement: Node | null = null;
    private trmpspritePrefab: Node | null = null;
    private collidingTempElements: Node = null;

    private times: number = 2;


    onLoad() {
        this.startPos = this.node.position.clone();
        this.node.on(Node.EventType.TOUCH_START, this.onDragStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onDrag, this);

        this.node.on(Node.EventType.TOUCH_CANCEL, this.onDrop, this);
        this.node.on(Node.EventType.TOUCH_END, this.onDrop, this);

    }
    private onDragStart() {
        this.times = 2;
        // 生成临时元素用于拖动
        this.trmpspritePrefab = instantiate(this.spritePrefab);
        find("Canvas/暂存").addChild(this.trmpspritePrefab);
        this.trmpspritePrefab.setScale(1.5, 1.5, 1);
        // this.tempElement.parent = this.node.parent;
        this.trmpspritePrefab.worldPosition = this.node.worldPosition.clone();
        LJS_TempElement.Touch = true;
    }


    private onDrag(event: EventTouch) {
        if (!this.trmpspritePrefab) return;
        const pos = event.getUILocation();
        this.trmpspritePrefab.worldPosition = this.trmpspritePrefab.worldPosition.set(v3(pos.x, pos.y, 0));

    }

    private onDrop(text: string) {
        this.times--;
        if (this.times <= 0) {
            //销毁图片
            this.trmpspritePrefab.destroy();

            //生成临时对象
            this.tempElement = instantiate(this.elementPrefab);
            this.tempElement.name = this.elementType;
            find("Canvas/BG/合成").addChild(this.tempElement);
            this.tempElement.worldPosition = this.trmpspritePrefab.worldPosition.clone();
            this.tempElement = null;

        }



    }

}


