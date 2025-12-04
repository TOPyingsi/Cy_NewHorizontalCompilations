import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { ObjectController } from './WLSYS_ObjectController';
const { ccclass, property } = _decorator;

@ccclass('BuldController')
export class BuldController extends ObjectController {

    @property([SpriteFrame])
    sps : SpriteFrame[] = [];

    protected override onLoad(): void {
        super.onLoad();
        this.beNode = true;
    }

    override setEle(type: number): void {
        super.setEle(type);
    }
    override initEle(): void {
        super.setEle(0);
    }
    override freshState(){
        super.freshState();
        this.sp.spriteFrame = this.sps[this.Onele];
    }
}


