import { _decorator, Component, Node, v3 } from 'cc';
import { ATZJ_Unit } from '../ATZJ_Unit';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_YuZhiBoBan')
export class ATZJ_YuZhiBoBan extends ATZJ_Unit {
    public NormalAttackNum: number = 1;//角色的普攻段数
    public SkillAttakScale: { Name: string, Scale: number }[] = [
        { Name: "普0", Scale: 0.2 },
        { Name: "技1", Scale: 0.7 },
        { Name: "技2_0", Scale: 0.5 },
        { Name: "技2_1", Scale: 0.7 },
        { Name: "技3", Scale: 1 },

    ]


    //动画帧事件
    AniEmit(Emit: string) {
        super.AniEmit(Emit);
        switch (Emit) {

        }

    }

}


