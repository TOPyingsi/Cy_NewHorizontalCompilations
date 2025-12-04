import { _decorator, CCInteger, CCString, Component, Node, Prefab, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ObjectData')
export class ObjectData{
    
    @property({type : Vec2, visible : true, tooltip : "gridSize"})
    gridSize : Vec2 = new Vec2();    
    @property({type : CCString, visible : true, tooltip : "name"})
    name : string = "";
    @property({type : CCInteger, visible : true, tooltip : "name"})    
    id : number = 0;
    @property({type : CCInteger, visible : true, tooltip : "canMask"})    
    canMask : number = 0;
    @property({type : CCInteger, visible : true, tooltip : "Resistance"})
    resistance : number = 0;
    @property({type : Prefab, visible : true, tooltip : "prefab"}) 
    prefab : Prefab;

}


