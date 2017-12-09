import IComponentState from "../../core/common/IComponentState";

/**
 * Base props for all controls.
 */
export default interface IControlProps extends IComponentState {
    name?: string;
}