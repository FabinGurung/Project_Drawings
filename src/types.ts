export type EngineeringStatus = "FROZEN" | "CODAL_NOT_VERIFIED / HOLD" | string;
export interface StageModule { stage:string; slug:string; title:string; version:string; status:EngineeringStatus; tab_count:number; href:string; }
export interface NavigationData { schema:string; modules:StageModule[]; }
