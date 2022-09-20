import React, { useEffect, useRef, useState } from 'react';

// 依赖值第一次改变时执行
export function useDepOnceEffect (dep) {
    const isFirstUpDate = useRef(false);
    const [isFirst, setIsFirst] = useState(false);

    useEffect(() => {
        if (!isFirstUpDate) {
            isFirstUpDate.current = true;
        } else {
            return true
        }
    }, [dep]);
}