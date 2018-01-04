import EntityBase from './Component';
import IComponentProps from './common/IComponentProps';

declare global {
    export namespace JSX {
        // tslint:disable:no-empty-interface
        interface Element extends EntityBase<IComponentProps> {}
        interface ElementAttributesProperty {
            props: {};
        }
        interface IntrinsicAttributes {
            key?: string;
            ref?: (component: EntityBase<IComponentProps>) => void;
        }
        // tslint:enable:no-empty-interface
    }
}

export namespace React {
    export function createElement<T extends EntityBase<TT>, TT>(
        constructorFn: new (props: TT, key: string, ref: () => T) => T,
        attributes: TT,
        child: EntityBase<IComponentProps>
    ) {
        // Children can be more than one argument
        let childrenLength = arguments.length - 2;
        let children: EntityBase<IComponentProps>[] = Array(childrenLength);
        for (var i = 0; i < childrenLength; i++) {
            children[i] = arguments[i + 2];
        }

        attributes = attributes || {} as TT;
        const component: EntityBase<TT> = new constructorFn(
            attributes,
            // tslint:disable:no-any
            (<any>attributes).key,
            (<any>attributes).ref
            // tslint:enable:no-any
        );
        children.forEach((child: EntityBase<IComponentProps>) => {
            component.mountChild(child);
        });
        return component;
    }
}
