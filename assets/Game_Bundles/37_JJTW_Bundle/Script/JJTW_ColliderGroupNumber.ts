import { _decorator, CCInteger, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum JJTW_ColliderGroupType{
    Wall,
    Barrier,
    Stairs,
    Floor,
    Player_Collider,
    Player_Scan,
    NPC_Scan,
    NPC_Collider,
    Monster_Scan,
    Monster_Collider,
    Key,
    Compass_1,
    Compass_2,
    Compass_3,
    Compass_4,
    Compass_5,
    Compass_6,
    File,
    Door_1,
    Door_2,
    Door_3,
    Door_4,
    Door_5,
    Door_6,
    Door_Normal,
    Door_Exit,
    Exit_End,
    Door_Stair_1,
    Door_Stair_2,
    House
}

@ccclass('JJTW_ColliderGroupNumber')
export class JJTW_ColliderGroupNumber extends Component {
    @property(CCInteger)
    groupType: JJTW_ColliderGroupType = JJTW_ColliderGroupType.Wall;

    @property({type:Boolean})
    isDoor: boolean = false;

    @property({type:Node})
    door1?: Node = null;

    @property({type:Node})
    door2?: Node = null;

    @property({type:Number})
    openAngelYDoor1?:number = 0;

    @property({type:Number})
    openAngelYDoor2?:number = 0;

    @property({type:Node})
    compassNode?:Node[]=[];

    orignAngelYOoor1?:number = null;
    orignAngelYOoor2?:number = null;

    start(){
        if(this.isDoor){
            if(this.door1){
                this.orignAngelYOoor1 = this.door1.eulerAngles.y;
            }
            if(this.door2){
                this.orignAngelYOoor2 = this.door2.eulerAngles.y;
            }
        }
    }

    setDoorOpen(){
        if(this.door1){
            let angle =  this.door1.eulerAngles;
            this.door1.eulerAngles = new Vec3(angle.x,this.openAngelYDoor1,angle.z);
        }

        if(this.door2){
            let angle =  this.door2.eulerAngles;
            this.door2.eulerAngles = new Vec3(angle.x,this.openAngelYDoor2,angle.z);
        }
    }

    setDoorClose(){
        if(this.door1){
            let angle =  this.door2.eulerAngles;
            this.door1.eulerAngles = new Vec3(angle.x, this.orignAngelYOoor1, angle.z);
        }
        if(this.door2){
            let angle =  this.door2.eulerAngles;
            this.door2.eulerAngles = new Vec3(angle.x, this.orignAngelYOoor2, angle.z);
        }
    }
}


