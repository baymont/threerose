import BComponent, { IComponentContext } from './BComponent';

declare global {
    namespace JSX {
        // tslint:disable:no-empty-interface
        interface Element extends BComponent<{}> { }
        interface ElementAttributesProperty { props: {}; }
        interface ElementChildrenAttribute { children: {}; }
        // tslint:enable:no-empty-interface
    }
}

export module React {
    export function createElement<T extends BComponent<TT>, TT>(constructorFn: new (props: TT, children: BComponent<{}>[]) => T, attributes: TT, child: BComponent<{}>) {
        // Children can be more than one argument
        let childrenLength = arguments.length - 2;
        let children: BComponent<{}>[] = Array(childrenLength);
        for (var i = 0; i < childrenLength; i++) {
            children[i] = arguments[i + 2];
        }

        const component: BComponent<TT> = new constructorFn(attributes, children);
        children.forEach((child: BComponent<{}>) => {
            component.addChild(child);
        });
        return component;
    }
}