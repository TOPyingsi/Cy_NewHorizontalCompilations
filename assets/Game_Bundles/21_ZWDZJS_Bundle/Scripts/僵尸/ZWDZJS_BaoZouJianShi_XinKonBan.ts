import { _decorator } from 'cc';
import ZWDZJS_JiangShi from './ZWDZJS_JiangShi';
const { ccclass, property } = _decorator;



@ccclass('ZWDZJS_BaoZouJianShi_XinKonBan')
export default class ZWDZJS_BaoZouJianShi_XinKonBan extends ZWDZJS_JiangShi {
    public AnimationName: string[] = ["move1", "attack1"];//
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



