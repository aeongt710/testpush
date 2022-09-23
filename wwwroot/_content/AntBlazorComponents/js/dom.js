
window.interop = {
    performLinkClick: function (url, target) {
        var a = document.createElement('a');
        a.href = url;
        a.target = target;
        a.click();
        document.body.removeChild(a);
    },
};

window.execClick = function (el) {
    if (!el) {
        return;
    }
    return el.click();
};

function convertFiles(files) {
    let scanFile = function (file) {
        return new Promise((resolver) => {
            let infos = [file.name, file.size.toString()];
            if (file.type.indexOf("image") != -1) {
                let img = new Image();
                img.onload = function () {
                    infos.push(this.width.toString());
                    infos.push(this.height.toString());
                    infos.push(img.src);
                    resolver(infos);
                };
                img.src = URL.createObjectURL(file);
                return;
            }
            resolver(infos);
        });
    };
    let filePromises = [];
    for (var i = 0; i < files.length; i++) {
        let file = files.item ? files.item(i) : files[i];

        filePromises.push(new Promise((resolver) => {
            scanFile(file).then(infos => {
                resolver(infos);
            });
        }));
    }
    return Promise.all(filePromises);
};

window.scanFiles = function (el) {
    if (!el) {
        return [];
    }

    let files = this.convertFiles(el.files);
    return files;
};

async function _uploadFile(url, file, fileName, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.onreadystatechange = function () {
        if (this.readyState != 4) {
            return;
        }
        if (this.status < 200 || this.status >= 300) {
            return;
        }
        let response = JSON.parse(this.responseText);
        callback([response.code.toString(), response.message || "", response.id, response.url]);
    };
    xhr.withCredentials = true;
    xhr.setRequestHeader("x-requested-with", "XMLHttpRequest");
    let formData = new this.FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);
    xhr.send(formData);
};

window.uploadFile = function (el, index, oldFileName, fileName, url) {
    return new Promise((resolver, reject) => {
        let file = null;
        if (index < el.files.length) {
            file = el.files[index];
            _uploadFile(url, file, fileName, resolver);
        }
    });
};