import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import ZWDZJS_JiangShi from './ZWDZJS_JiangShi';

@ccclass('ZWDZJS_JiangShiWang_QBan')
export default class ZWDZJS_JiangShiWang_QBan extends ZWDZJS_JiangShi {
    public AnimationName: string[] = ["walk", "attack", "die"];//
    start(): void {
        super.start();


    }
    Move(dt: number) {
        this.Move_PuTong(dt);
    }
    Attack(): void {
        if (this.ZhuanTai != 4) {
            this.ZhuanTai = 4;
            this.Attack_Putong();
        }
    }
}


