import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import ZWDZJS_JiangShi from './ZWDZJS_JiangShi';

@ccclass('ZWDZJS_PuTongJiangShi_XinKonBan')
export default class ZWDZJS_PuTongJiangShi_XinKonBan extends ZWDZJS_JiangShi {
    public AnimationName: string[] = ["move1", "attack1", "death1"];//
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


