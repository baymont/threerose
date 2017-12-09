import { Vector3 } from "./Vector3";
import BSystem from "../BSystem";

export default interface IComponentState {
    position?: Vector3;
    rotation?: Vector3;
    systems?: BSystem[];
}