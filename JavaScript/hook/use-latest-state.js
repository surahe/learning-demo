import { useState, useCallback, useRef } from "react";

/**
 * @description: 可获取最新state得自定义hook
 * @param {any} initState 初始值
 * @return {Array} [state, setState, getState]
 */
export function useLatestState (initState) {
    const [state, setState] = useState(initState);
    const ref = useRef(initState);

    const _updateState = useCallback((newState) => {

        setState(newState);
        ref.current = newState;
    }, []);

    const _getState = useCallback(() => {
        return ref.current;
    }, []);

    return [state, _updateState, _getState];
}