import React, { useMemo, forwardRef } from 'react';

/**
 * 用于多组件组装成一个整体返回，会增加componentType属性用于组件选择
 * @param {Object} maps 多组件映射列表 key -> type值 | value -> 组件
 * @param {Object} config 配置项
 *   @param {string} [config.keyName='componentType'] 组件类型在props中的字段名
 *   @param {string} [config.defaultKey] 默认组件类型key
 *   @param {Array<Function>} [config.hooks=[]] 额外处理props的hook函数数组，每个函数接收props，返回需合并的新props
 * @returns {React.Component} 返回一个根据props动态渲染不同组件的高阶组件
 */
export const componentTypes = (maps, config) => {
    const {
        keyName = 'componentType', // 指定props中用于区分组件类型的字段名
        defaultKey,                // 默认组件类型key
        hooks = []                 // 处理props的hook函数数组
    } = config || {};

    // 返回一个带ref转发的函数组件
    return forwardRef((props, ref) => {

        // 根据props中的keyName字段或defaultKey，选择要渲染的组件
        const WrapComponent = useMemo(
            () => maps[props[keyName] || defaultKey],
            [props[keyName]]
        );

        // 未找到对应组件时返回null
        if (!WrapComponent) {
            return null;
        }

        // 合并ref和props
        const newProps = Object.assign({ ref }, props);

        // 依次执行hooks，将返回的新props合并到newProps
        if (hooks && hooks.length > 0) {
            hooks.forEach(handle => {
                const addProps = handle(props);

                if (addProps instanceof Object) {
                    Object.assign(newProps, addProps);
                }
            });
        }

        // 渲染最终选择的组件
        return React.createElement(WrapComponent, newProps);
    })
}