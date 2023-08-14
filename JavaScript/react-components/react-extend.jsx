import React, { useMemo, forwardRef } from 'react';

/**
 * 用于多组件组装成一个整体返回，会增加componentType属性用于组件选择
 * @param {Object} maps 多组件映射列表 key -> type值 | value -> 组件
 * @returns 
 */
export const componentTypes = (maps, config) => {
    const {
        keyName = 'componentType',
        defaultKey,
        hooks = []
    } = config || {};

    return forwardRef((props, ref) => {

        const WrapComponent = useMemo(() => maps[props[keyName] || defaultKey], [props[keyName]]);

        if (!WrapComponent) {
            return null;
        }


        const newProps = Object.assign({ ref }, props);

        if (hooks && hooks.length > 0) {
            hooks.forEach(handle => {
                const addProps = handle(props);

                if (addProps instanceof Object) {
                    Object.assign(newProps, addProps);
                }
            });
        }

        return React.createElement(WrapComponent, newProps);
    })
}