import { _decorator, Component, Node } from 'cc';
import { XSHY_Unit } from '../XSHY_Unit';
const { ccclass, property } = _decorator;

@ccclass('XSHY_ShiDaiMu')
export class XSHY_ShiDaiMu extends XSHY_Unit {
    public SkillAttakScale: { Name: string, Scale: number }[] = [
        { Name: "普0", Scale: 1 },
        { Name: "普1", Scale: 1 }
    ]




}


