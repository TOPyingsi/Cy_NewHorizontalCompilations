import { _decorator, Component, Node, v3 } from 'cc';
import { ATZJ_Unit } from '../ATZJ_Unit';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_ShiDaiMu')
export class ATZJ_ShiDaiMu extends ATZJ_Unit {
    public NormalAttackNum: number = 1;//角色的普攻段数
    public SkillAttakScale: { Name: string, Scale: number }[] = [
        { Name: "普0", Scale: 0.6 },
        { Name: "技1", Scale: 1.2 },
        { Name: "技2", Scale: 0.8 },
        { Name: "技3_0", Scale: 2 },
        { Name: "技3_1", Scale: 3 }
    ]


    //动画帧事件
    AniEmit(Emit: string) {
        super.AniEmit(Emit);
        switch (Emit) {
            case "发射火球":
                this.GenerateBullet(0, v3(110, 160, 0), this.GetSkillScale("技1"));
                break;

        }

    }

}


