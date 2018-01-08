import Entity from './Entity';
import Component from './Component';

declare global {
    export namespace JSX {
        // tslint:disable:no-empty-interface
        interface Element extends Entity {}
        interface ElementAttributesProperty {
            props: {};
        }
        interface IntrinsicAttributes {
            components?: Component[];
            key?: string;
            ref?: (component: Entity) => void;
        }
        // tslint:enable:no-empty-interface
    }
}

export namespace React {
    export function createElement<T extends Entity<TT>, TT>(
        constructorFn: new (props: TT, key: string, ref: () => T) => T,
        attributes: TT,
        child: Entity
    ) {
        // Children can be more than one argument
        let childrenLength = arguments.length - 2;
        let children: Entity[] = Array(childrenLength);
        for (var i = 0; i < childrenLength; i++) {
            children[i] = arguments[i + 2];
        }

        attributes = attributes || {} as TT;
        const entity: Entity<TT> = new constructorFn(
            attributes,
            // tslint:disable:no-any
            (<any>attributes).key,
            (<any>attributes).ref
            // tslint:enable:no-any
        );

        // tslint:disable-next-line:no-any
        entity.addComponents((<any>attributes).components);

        children.forEach((child: Entity) => {
            entity.mountChild(child);
        });
        return entity;
    }
}
