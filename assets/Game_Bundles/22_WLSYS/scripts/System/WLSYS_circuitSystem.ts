import { _decorator, Component, Node, Pool } from 'cc';
import { ObjectController } from '../Object/WLSYS_ObjectController';
import { BatteryController } from '../Object/WLSYS_BatteryController';
import { Grid } from '../Components/WLSYS_Grid';
import { SwitchController } from '../Object/WLSYS_SwitchController';
const { ccclass, property } = _decorator;



@ccclass('circuitSystem')
export class circuitSystem {
    circuitNode: number[] = [];

    batteryController: ObjectController = null;

    grid: Grid;

    dx: number[] = [0, 0, 1, -1];
    dy: number[] = [1, -1, 0, 0];

    circuit: number[] = [];
    circuitUndir: number[][] = [];
    circuitdir : number[][] = [];
    dfsNodeVis : number[] = [];
    dfsTypeVis : number[][] = [];

    circuitController : ObjectController[] = [];

    setBattery(battery: BatteryController) {
        this.batteryController = battery;
        this.grid = battery.grid;
    }

    buildGraph() {
        if (this.batteryController.isDestroy){
            return;
        }
        console.log("Circuit begin");
        let vis = Array<number>(this.grid.width * this.grid.height);

        vis.fill(0);

        let startx = this.batteryController.gridPos.x;
        let starty = this.batteryController.gridPos.y;
        this.circuit = [];
        this.circuitUndir = [];
        this.circuitdir = [];
        this.circuitNode = [];
        this.circuitController = []; 
        this.dfsTypeVis  = [];
        let Rsum = []; // 关于一个元件串联的电阻和。 but its useless now
        this.circuitNode.push(this.grid.getGridMapIndex(startx, starty))
        this.circuitController.push(this.grid.getGridController(startx, starty));
        vis[this.getMapindex(startx, starty)] = 1;
        let u = startx;
        let v = starty;

        let queue = new Array<number>();

        if (this.batteryController.rotationType == 0) {
            u++;
        } else {
            v--;
        }
        queue.push(this.getMapindex(u, v));

        while (queue.length > 0) {
            let u = this.grid.getGridpos(queue[0]).x;
            let v = this.grid.getGridpos(queue[0]).y;
            vis[this.getMapindex(u, v)] = 1;
            if (this.grid.getGridController(u, v).beNode) {
                this.circuitNode.push(this.getMapindex(u, v));
                this.circuitController.push(this.grid.getGridController(u, v));
                this.grid.getGridController(u, v).initEle();
            }
            if (!this.grid.getGridController(u, v).isDestroy && this.grid.getGridController(u, v).data.id == 3) {
                (this.grid.getGridController(u, v) as SwitchController).setBattery(this.circuitController[0] as BatteryController);
            }
            queue.shift();
            for (let i = 0; i < 4; i++) {
                let x = u + this.dx[i];
                let y = v + this.dy[i];
                if (vis[this.getMapindex(x, y)] == 0 && this.grid.isGridOccupy(x, y) == true) {
                    vis[this.getMapindex(x, y)] = 1;
                    queue.push(this.getMapindex(x, y));
                }
            }
        }

        let idxToGraph = new Map<number, number>();
        for (let i = 0; i < this.circuitNode.length; i++) {
            this.circuitUndir.push([]);
            this.circuitdir.push([]);
            this.dfsNodeVis.push(0);
            Rsum.push(this.circuitController[i].data.resistance);
            idxToGraph.set(this.circuitNode[i], i);
            console.log(this.circuitController[i]);
            this.circuitController[i].initEle();
        }
        
        for (let k = 0; k < this.circuitNode.length; k++){
            queue.push(this.circuitNode[k]);
            vis.fill(0);
            while (queue.length > 0) {
                let u = this.grid.getGridpos(queue[0]).x;
                let v = this.grid.getGridpos(queue[0]).y;   
                vis[this.getMapindex(u, v)] = 1;
                queue.shift();
                for (let i = 0; i < 4; i++) {
                    let x = u + this.dx[i];
                    let y = v + this.dy[i];
                    if (this.grid.isGridOccupy(x, y) == true && this.grid.getGridController(x, y).canCross){
                        if (vis[this.getMapindex(x, y)] == 0 && this.grid.isGridOccupy(x, y) == true && idxToGraph.has(this.getMapindex(x, y)) == false) {
                            queue.push(this.getMapindex(x, y));
                        }else if (vis[this.getMapindex(x, y)] == 0 && idxToGraph.has(this.getMapindex(x, y)) == true && this.getMapindex(x, y) != (this.circuitNode[k])){
                            this.circuitUndir[idxToGraph.get(this.circuitNode[k])].push(idxToGraph.get(this.getMapindex(x, y)))
                        }
                    }
                }
            }
        }
        let size = this.circuitUndir.length;
        for (let i = 0; i < (1 << size); i++){
            let tt = Array<number>(size);
            this.dfsTypeVis.push(tt);
        }
        
        // for (let i = 0 ; i < size; i++){
        //     for (let j = 0; j < this.circuitUndir[i].length; j++){
        //         console.log(i + " -> " + this.circuitUndir[i][j]);
        //     }
        // }
        let breaks = [];
        for (let i = 0; i < size; i++){
            if (this.circuitUndir[i].length <= 1 && this.circuitController[i].data.name != "wire"){
                breaks.push(i);
                this.circuitUndir[i] = [];
            }
        }
        for (let i = 0; i < size; i++){
            for (let j = 0; j < breaks.length; j++){
                if (this.circuitUndir[i].indexOf(breaks[j]) != -1){

                    this.circuitUndir[i].splice(this.circuitUndir[i].indexOf(breaks[j]), 1);
                }
            }
        }
        // for (let i = 0 ; i < size; i++){
        //     for (let j = 0; j < this.circuitUndir[i].length; j++){
        //         console.log(i + " -> " + this.circuitUndir[i][j]);
        //     }
        // }
        
        // 图已建立，下考虑全部回路。
        // 注意，当图十分复杂时需要考虑复杂度过高的问题。
        // 下转换题意为给定一个有向图，考虑以0为起点，终点为0的全部回路问题。
        this.dfsNodeVis[0] = 1;
        this.dfsTypeVis[1][0] = 1;
        this.dfs(0, 1);

        let onEl = [];
        let curType = (1 << size) - 1;
        for (let i = 0; i < this.circuit.length; i++){
            curType &= (this.circuit[i]);
            // console.log(this.circuit[i]);
        }
        console.log(curType);
        for (let i = 0; i < size; i++){
            if (curType & (1 << i)){
                onEl.push(i);
            }
        }
        let canAll = true;

        for (let i = 0; i < this.circuit.length; i++){
            let temp = (this.circuit[i] ^ curType);
            let allWire = true;
            // console.log(i + " : ");
            for (let j = 0; j < size; j++){
                if (temp >> j & 1){
                    console.log(j);
                    if (this.circuitController[j].equleWire == false){
                        allWire = false;
                    }
                }
            }
            if (allWire){
                canAll = false;
            }
        }
        // console.log(canAll);
        if (canAll){
            for (let i = 0; i < this.circuitUndir.length; i++){
                if (this.circuitUndir[i].length != 0){
                    this.circuitController[i].setEle(1);
                }
            }
        }else{
            for (let i = 0; i < onEl.length; i++){
                this.circuitController[onEl[i]].setEle(1);
            }

        }

    }

    dfs(x : number, curType : number){
        // console.log("dfsTTT   " + x +  "  Type : " + curType);
        if (x == this.circuitUndir[0][1]){
            this.circuit.push(curType);
            return;
        }
        if (x == 0){
            let y = this.circuitUndir[x][0];
            let nextType = (curType | (1 << y));
            if (!this.dfsTypeVis[nextType][y]){
                this.dfsNodeVis[y] ++;
                this.dfsTypeVis[nextType][y] = 1;
                this.dfs(y, nextType);
                this.dfsNodeVis[y]--;
            }
        }else{
            for (let i = 0; i < this.circuitUndir[x].length; i++){
                let y = this.circuitUndir[x][i];
                let nextType = (curType | (1 << y));
                if (this.dfsTypeVis[nextType][y]){
                    continue;
                }
                if ((curType & (1 << y))) {
                    continue;
                }
    
                this.dfsNodeVis[y] ++;
                this.dfsTypeVis[nextType][y] = 1;
                this.dfs(y, nextType);
                this.dfsNodeVis[y]--;
            }
        }
    }


    getMapindex(_u: number, _v: number): number {
        return this.grid.getGridMapIndex(_u, _v);
    }

}


