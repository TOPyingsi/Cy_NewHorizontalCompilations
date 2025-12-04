import { LBL_PointData } from "./LBL_PointData";

export interface LBL_ILevelData{
    [level: number]: {
        roundCount:number;
        endingTitle:string;
        endingIconId:string;
        round:{
            [round: number]: {
                [number: number]: LBL_PointData
            }
        }
    }
}