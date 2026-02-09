import { _decorator, Component, Node, v3 } from 'cc';
import { ATZJ_Unit } from '../ATZJ_Unit';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_ZuoZhu')
export class ATZJ_ZuoZhu extends ATZJ_Unit {
    public NormalAttackNum: number = 4;//角色的普攻段数
    public SkillAttakScale: { Name: string, Scale: number }[] = [
        { Name: "普0", Scale: 1 },
        { Name: "普1", Scale: 1 },
        { Name: "普2", Scale: 1 },
        { Name: "普3", Scale: 1 },
        { Name: "技1_0", Scale: 1.5 },
        { Name: "技1_1", Scale: 1.5 },
        { Name: "技2", Scale: 0.6 },
        { Name: "技3_0", Scale: 1 },
        { Name: "技3_1", Scale: 1.5 },
    ]


    //动画帧事件
    AniEmit(Emit: string) {
        super.AniEmit(Emit);
        switch (Emit) {

        }

    }

}


