import { _decorator, Component, Node, v3 } from 'cc';
import { XSHZ_Unit } from '../XSHZ_Unit';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_ChuanKaoHaoZuo')
export class XSHZ_ChuanKaoHaoZuo extends XSHZ_Unit {
    public NormalAttackNum: number = 2;//角色的普攻段数
    public SkillAttakScale: { Name: string, Scale: number }[] = [
        { Name: "普0", Scale: 0.8 },
        { Name: "普1", Scale: 0.8 },
        { Name: "技1_0", Scale: 1.5 },
        { Name: "技1_1", Scale: 2 },
        { Name: "技2_0", Scale: 1.5 },
        { Name: "技2_1", Scale: 0.6 },
        { Name: "技3_0", Scale: 1.2 },  
        { Name: "技3_1", Scale: 2 },

    ]


    //动画帧事件
    AniEmit(Emit: string) {
        super.AniEmit(Emit);
        switch (Emit) {

        }

    }

}


