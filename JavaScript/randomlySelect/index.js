function formatNumber (num, decimal = 2) {
    let _num = num
    for (let i = 0; i < decimal; i++) {
        _num *= 10
    }
    _num = _num.toFixed(1)
    return Number(Math.ceil(_num) / 100)
}

function handleList (list) {
    let total = 0;
    if (Array.isArray(list)) {
        list.forEach((item) => {
            if (!item.value || !item.chance) {
                throw Error('item 必须有 value 和 chance');
            }

            if (typeof item.chance !== 'number' || item.chance > 1) {
                throw Error('chance必须为小于1的数字');
            }

            let hundred = formatNumber(item.chance * 100);
            if (hundred !== parseInt(hundred)) {
                throw Error('chance的小数位数最多为2位');
            }

            total = formatNumber(total + item.chance);
        });

        if (total > 1) {
            throw Error('chance 概率之和大于1');
        }

        if (total < 1) {
            throw Error('chance 概率之和需要等于1');
        }

        return list

    } else {
        throw Error('参数必须是 Array');
    }
}

var Solution = function (list) {
    this.formatList = handleList(list);

    let n = this.formatList.length;
    // 构建前缀和数组，偏移一位留给preSum[0]
    this.preSum = new Array(n + 1);
    this.preSum[0] = 0;
    for (let i = 1; i <= n; i++) {
        this.preSum[i] = this.preSum[i - 1] + this.formatList[i - 1].chance * 100;
    }
};

Solution.prototype.pickIndex = function () {
    let n = this.preSum.length;
    // 在闭区间[1,preSum[n-1]]中随机选择一个数字
    let target = Math.floor(Math.random() * this.preSum[n - 1]) + 1;
    // 获取target在前缀和数组preSum中的索引
    // 二分搜索左侧边界
    let left = 0,
        right = n;
    while (left < right) {
        let mid = left + ((right - left) >> 1);
        if (this.preSum[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    // preSum的索引偏移了一位，还原为权重数组w的索引
    return left - 1;
};

Solution.prototype.pickValue = function () {
    return this.formatList[this.pickIndex()].value
}