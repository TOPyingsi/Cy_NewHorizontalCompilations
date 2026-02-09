import { _decorator, Component, Node, v3 } from 'cc';
import { ATZJ_Unit } from '../ATZJ_Unit';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_ZuoZhu')
export class ATZJ_ZuoZhu extends ATZJ_Unit {
    public NormalAttackNum: number = 2;//角色的普攻段数
    public SkillAttakScale: { Name: string, Scale: number }[] = [
        { Name: "普0", Scale: 1 },
        { Name: "普1", Scale: 1 },
        { Name: "技1", Scale: 2 },
        { Name: "技2", Scale: 2 },
        { Name: "技3", Scale: 4 },
    ]


    //动画帧事件
    AniEmit(Emit: string) {
        super.AniEmit(Emit);
        switch (Emit) {

        }

    }

}


