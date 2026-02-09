import { Component, Node, Vec3 } from "cc";
import { SJZGMMT_WeaponItem } from "../SJZGMMT_Constant";
import { SJZGMMT_Unit } from "../SJZGMMT_Unit";


export abstract class SJZGMMT_I_SkillBtn extends Component {
    public FindUnit: SJZGMMT_Unit = null;
    public FindNode: Node = null;
}


