// 因为文件跨域，直接使用a.download 修改文件名不生效

// 修改下载文件的文件名
export function changeDownloadFileName (fileUrl, fileName, type='docx') {
    if(!fileUrl || !fileName){
        window.message.error('请输入完整参数');
        return
    }
    var xml = new XMLHttpRequest();
    xml.open('GET', fileUrl, true);
    xml.responseType = 'blob';
    xml.onload = function () {
        let a = document.createElement('a');
        a.href = URL.createObjectURL(xml.response);
        a.download = `${fileName}.${type}`;
        a.click();
        URL.revokeObjectURL(a.href);
    }
    xml.send();
}