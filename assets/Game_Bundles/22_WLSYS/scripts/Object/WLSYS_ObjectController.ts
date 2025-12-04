import { _decorator, Button, Component, instantiate, Node, Sprite, Vec2 } from 'cc';
import { ObjectData } from './WLSYS_ObjectData';
import { BUILD } from 'cc/env';
import { placementSystem } from '../System/WLSYS_placementSystem';
import { Grid } from '../Components/WLSYS_Grid';
const { ccclass, property } = _decorator;



@ccclass('ObjectController')
export class ObjectController extends Component {

    @property({ type: ObjectData })
    data: ObjectData = new ObjectData();

    button: Button = null;

    onMap: boolean = false;

    canCross: boolean = true;

    canBeFinalNode : boolean = false;

    sp: Sprite = null;

    gridPos: Vec2;

    @property(Number)
    Type: number = 0;

    grid: Grid = null;

    Onele: number = 0;

    @property(Boolean)
    beNode: boolean = false;

    rotationType: number = 0;

    equleWire : boolean = false;

    isDestroy: boolean = false;

    // link the object
    upController: ObjectController = null;
    downController: ObjectController = null;
    leftController: ObjectController = null;
    rightController: ObjectController = null;

    setUpController(up: ObjectController) {
        this.upController = up;
    }
    setdownController(down: ObjectController) {
        this.downController = down
    }
    setleftController(left: ObjectController) {
        this.leftController = left;
    }
    setrigthController(right: ObjectController) {
        this.rightController = right;
    }

    buildNeighbour() {
        this.upController = this.grid.getGridController(this.gridPos.x, this.gridPos.y + 1);
        this.downController = this.grid.getGridController(this.gridPos.x, this.gridPos.y - 1);
        this.leftController = this.grid.getGridController(this.gridPos.x - 1, this.gridPos.y);
        this.rightController = this.grid.getGridController(this.gridPos.x + 1, this.gridPos.y);
    }

    checkType() {

    }
    freshState() {

    }


    protected onLoad(): void {
        this.button = this.getComponent(Button);
        this.sp = this.getComponentInChildren(Sprite);
        this.isDestroy = false;
    }

    initEle() {

    }

    protected onEnable(): void {
        this.node.on(Button.EventType.CLICK, this.callback, this);
    }

    offselect() {
        this.button.node.off(Button.EventType.CLICK, this.callback, this);
    }
    onSomething() {
        this.button.enabled = false;
    }

    callback() {
        placementSystem.instance.setPlaceObject(this.data);
    }

    init(newdata: ObjectData) {
        this.data = newdata;
    }

    setEle(type: number) {
        this.Onele = type;
        this.freshState();
    }

    protected onDisable(): void {
        this.offselect();
    }

    V2EqualJue(v1: Vec2, v2: Vec2) { // V2 value check
        if (v1.x == v2.x && v1.y == v2.y) {
            return true;
        }
        return false;
    }
    V2absEqualJue(v1: Vec2, v2: Vec2) { // V2 value check
        if (Math.abs(v1.x) == Math.abs(v2.x) && Math.abs(v1.y) == Math.abs(v2.y)) {
            return true;
        }
        return false;
    }
    Vec2(x: number, y: number) {
        return new Vec2(x, y);
    }

    protected onDestroy(): void {
        this.isDestroy = true;
    }
}


