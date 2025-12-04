import { _decorator, Component, director, instantiate, Node, Prefab, size, UITransform, v3, Vec2, Vec3, Widget } from 'cc';
import { InputManager } from '../Manager/WLSYS_InputManager';
import { Grid } from '../Components/WLSYS_Grid';
import { ObjectController } from '../Object/WLSYS_ObjectController';
import { ObjectData } from '../Object/WLSYS_ObjectData';
import { WireController } from '../Object/WLSYS_WireController';
import { BatteryController } from '../Object/WLSYS_BatteryController';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('placementSystem')
export class placementSystem extends Component {

    static instance: placementSystem = null;

    @property(Node)
    inputDirctor: Node = null;

    @property(InputManager)
    inputManager: InputManager = null;

    // @property(Node)
    placeObject: Node = null;
    placeObjectController: ObjectController = null;
    placeObjectData: ObjectData = null;

    @property(Node)
    selectIndecate: Node = null;
    
    @property(Grid)
    grid: Grid = null;

    @property(Node)
    placeObjectParent: Node;

    @property(Node)
    TempTip : Node;

    battery : boolean = false;

    // onPlaceing : boolean = true;

    placeObjectControllerList: ObjectController[] = [];

    dx: number[] = [0, 0, 0, 1, -1];
    dy: number[] = [0, 1, -1, 0, 0];


    opType : number = 0;

    currentPlacenum: number = 0;

    inf: number = 99999999;

    LastgridPos: Vec3 = new Vec3(this.inf, this.inf, this.inf);

    @property(Node)
    moreGame : Node;

    protected start(): void {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "物理实验室");    
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.moreGame);    
        ProjectEventManager.emit(ProjectEvent.游戏开始, "物理实验室");
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "物理实验室");
    }

    protected onLoad(): void {
        placementSystem.instance = this;
    }

    setPlaceObject(data: ObjectData) {
        this.placeObjectData = data;
        this.opType = 0;
        director.getScene().emit("eraseButtonType", 0);
        this.selectIndecate.getComponent(UITransform).setContentSize(size(this.grid.cellSize.x * data.gridSize.x, this.grid.cellSize.y * data.gridSize.y));
    }

    private createPlaceObject(pos: Vec3, gridPos: Vec2) {
        
        this.placeObject = instantiate(this.placeObjectData.prefab);
        
        this.placeObject.setParent(this.placeObjectParent);
        this.placeObjectController = this.placeObject.getComponent(ObjectController);
        this.placeObjectController.offselect();
        this.placeObjectController.onSomething();
        this.placeObjectController.grid = this.grid;
        this.placeObject.getComponent(UITransform).setContentSize(size(this.grid.cellSize.x * this.placeObjectController.data.gridSize.x, this.grid.cellSize.y * this.placeObjectController.data.gridSize.y));
        this.placeObject.setWorldPosition(pos);
        this.placeObjectController.onMap = true;
        this.placeObjectController.gridPos = gridPos;
        this.placeObjectControllerList.push(this.placeObjectController);
    }

    undoCreatePlaceObject() {
        if (this.placeObjectControllerList.length <= 0) {
            console.log("没了")
            return;
        }
        let temp = this.placeObjectControllerList[this.placeObjectControllerList.length - 1]; // 可用对象池
        if (temp.data.name == "battery"){
            this.battery = false;
        }
        this.grid.RefreeArea(temp.gridPos.x, temp.gridPos.y, temp.data.gridSize.x, temp.data.gridSize.y);
        this.placeObjectControllerList.pop();
        temp.isDestroy = true;
        let x = temp.gridPos.x;
        let y = temp.gridPos.y;
        for (let i = 1; i < 5; i++) {
            let u = x + this.dx[i];
            let v = y + this.dy[i];
            if (this.grid.getGridController(u, v) == null || this.grid.getGridController(u, v).isDestroy){
                continue;
            }
            this.grid.getGridController(u, v)?.buildNeighbour();
            this.grid.getGridController(u, v)?.checkType();
            this.grid.getGridController(u, v)?.freshState();
        }
        temp.grid = null;
        temp.node.destroy();
    }

    protected update(dt: number): void {
        this.inputDirctor.setWorldPosition(this.inputManager.getTouchPosition().x, this.inputManager.getTouchPosition().y, 0);
        let gridPos = this.grid.getWorldtoCellPosition(this.inputDirctor.worldPosition);

        // 强制grid位移单方向
        if (this.inputManager.isTouching) {
            if (this.LastgridPos.x > this.inf / 2) {
                this.LastgridPos = gridPos.clone();
            } else {
                let dx = this.LastgridPos.x - gridPos.x;
                let dy = this.LastgridPos.y - gridPos.y;
                if (dx != 0 && dy != 0) {
                    dx = 0;
                }
                gridPos.x = this.LastgridPos.x - dx;
                gridPos.y = this.LastgridPos.y - dy;
                this.LastgridPos = gridPos.clone();
            }
        } else {
            this.LastgridPos = new Vec3(this.inf, this.inf, this.inf);
        }
        this.selectIndecate.setWorldPosition(this.grid.getCelltoWorldPosition(gridPos));
        if (this.inputManager.isTouching && this.placeObjectData != null && this.opType == 0) {
            if (this.grid.isThisAreaOccupy(gridPos.x, gridPos.y, this.placeObjectData.gridSize.x, this.placeObjectData.gridSize.y)) {
                if (this.placeObjectData.name == "battery"){
                    if (this.battery) {
                        this.TempTip.setScale(1, 1, 1);
                        this.scheduleOnce(()=>{
                            this.TempTip.setScale(0, 0, 0);
                        }, 2);
                        return;
                    }
                    this.battery = true;
                    this.createPlaceObject(this.selectIndecate.worldPosition, new Vec2(gridPos.x, gridPos.y));
                
                    this.grid.OccupyArea(gridPos.x, gridPos.y, this.placeObjectData.gridSize.x, this.placeObjectData.gridSize.y, this.placeObjectController);
                    this.currentPlacenum++;

                    let z = -1;
                    for (let i = 0; i < 5; i++) {
                        let u = this.placeObjectController.gridPos.x + this.dx[i];
                        let v = this.placeObjectController.gridPos.y + this.dy[i];
                        if (this.grid.getGridController(u, v) == null || this.grid.getGridController(u, v).isDestroy){
                            continue;
                        }
                        if (this.grid.getGridController(u, v).data.id == 1){
                            z = i;
                        }else{
                            this.grid.getGridController(u, v)?.buildNeighbour();
                            this.grid.getGridController(u, v)?.checkType();
                            (this.grid.getGridController(u, v))?.freshState();
                        }
                    }
                    if (z >= 0){
                        let u = this.placeObjectController.gridPos.x + this.dx[z];
                        let v = this.placeObjectController.gridPos.y + this.dy[z];
                        if (this.grid.getGridController(u, v) == null || this.grid.getGridController(u, v).isDestroy){
                        }else{
                            this.grid.getGridController(u, v)?.buildNeighbour();
                            this.grid.getGridController(u, v)?.checkType();
                            (this.grid.getGridController(u, v))?.freshState();
                        }
                    }
                }else{
                    this.createPlaceObject(this.selectIndecate.worldPosition, new Vec2(gridPos.x, gridPos.y));
                
                    this.grid.OccupyArea(gridPos.x, gridPos.y, this.placeObjectData.gridSize.x, this.placeObjectData.gridSize.y, this.placeObjectController);
                    this.currentPlacenum++;

                    let z = -1;
                    for (let i = 0; i < 5; i++) {
                        let u = this.placeObjectController.gridPos.x + this.dx[i];
                        let v = this.placeObjectController.gridPos.y + this.dy[i];
                        if (this.grid.getGridController(u, v) == null || this.grid.getGridController(u, v).isDestroy){
                            continue;
                        }
                        if (this.grid.getGridController(u, v).data.id == 1){
                            z = i;
                        }else{
                            this.grid.getGridController(u, v)?.buildNeighbour();
                            this.grid.getGridController(u, v)?.checkType();
                            (this.grid.getGridController(u, v))?.freshState();
                        }
                    }
                    if (z >= 0){
                        let u = this.placeObjectController.gridPos.x + this.dx[z];
                        let v = this.placeObjectController.gridPos.y + this.dy[z];
                        if (this.grid.getGridController(u, v) == null || this.grid.getGridController(u, v).isDestroy){
                        }else{
                            this.grid.getGridController(u, v)?.buildNeighbour();
                            this.grid.getGridController(u, v)?.checkType();
                            (this.grid.getGridController(u, v))?.freshState();
                        }
                    }
                }
                
            }
        }else if (this.opType == 1 && this.inputManager.isTouching){
            if (this.grid.isGridOccupy(gridPos.x, gridPos.y)) {
                for (let i = 0; i < this.placeObjectControllerList.length; i++){
                    if ((this.placeObjectControllerList[i].gridPos.x == gridPos.x) && (this.placeObjectControllerList[i].gridPos.y == gridPos.y)){
                        let temp = this.placeObjectControllerList[i];
                        this.placeObjectControllerList.splice(i, 1);
                        this.grid.RefreeArea(temp.gridPos.x, temp.gridPos.y, temp.data.gridSize.x, temp.data.gridSize.y);
                        temp.isDestroy = true;
                        let x = temp.gridPos.x;
                        let y = temp.gridPos.y;
                        for (let i = 1; i < 5; i++) {
                            let u = x + this.dx[i];
                            let v = y + this.dy[i];
                            if (this.grid.getGridController(u, v) == null || this.grid.getGridController(u, v).isDestroy){
                                continue;
                            }
                            this.grid.getGridController(u, v)?.buildNeighbour();
                            this.grid.getGridController(u, v)?.checkType();
                            this.grid.getGridController(u, v)?.freshState();
                        }
                        temp.grid = null;
                        temp.node.destroy();
                        break;
                    }
                }
            }
        }else if (this.currentPlacenum > 0) {
            // console.log(this.placeObjectControllerList.length);
            // for (let i = 0; i < this.placeObjectControllerList.length; i++) {
            //     console.log(this.placeObjectControllerList[i]);
            // }
            this.currentPlacenum = 0;
        }
    }

    ridEverything(){
        let tot = this.placeObjectControllerList.length;
        for (let i = 0; i < tot; i++){
            this.undoCreatePlaceObject();
        }
    }

    eraseButton(){
        this.opType = 1;
    }

    protected onDestroy(): void {

    }
}