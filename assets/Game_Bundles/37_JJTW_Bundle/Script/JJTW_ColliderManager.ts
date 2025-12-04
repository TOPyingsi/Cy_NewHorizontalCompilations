import { _decorator, Component, Node } from 'cc';
import { JJTW_ColliderGroupNumber, JJTW_ColliderGroupType } from './JJTW_ColliderGroupNumber';
import { JJTW_DataManager } from './JJTW_DataManager';
const { ccclass, property } = _decorator;

@ccclass('JJTW_ColliderManager')
export class JJTW_ColliderManager extends Component {
    @property(Node)
    private Wall: Node[]=[];

    @property(Node)
    private BarrierParent: Node=null;

    @property(Node)
    private Stairs: Node[]=[];

    @property(Node)
    private Floor: Node[]=[];

    @property(Node)
    private Key: Node;

    
    @property(Node)
    private itemParent: Node;

    protected start(): void {
        JJTW_DataManager.Instance.resetData();
        for(let i=0;i<this.Wall.length;i++){
            this.Wall[i].addComponent(JJTW_ColliderGroupNumber).groupType = JJTW_ColliderGroupType.Wall; 
        }

        for(let i=0;i<this.BarrierParent.children.length;i++){
            this.BarrierParent.children[i].addComponent(JJTW_ColliderGroupNumber).groupType = JJTW_ColliderGroupType.Barrier;
        }

        for(let i=0;i<this.Stairs.length;i++){
            this.Stairs[i].addComponent(JJTW_ColliderGroupNumber).groupType = JJTW_ColliderGroupType.Stairs; 
        }

        this.itemParent.children.forEach((item)=>{
            //console.log(item.name+":"+item.worldPosition.x,item.worldPosition.y,item.worldPosition.z);
        })
    }


}


