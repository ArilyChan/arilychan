"use strict";

const querystring = require('querystring');
const { getEncryptObj } = require('./aes');
const decryptMusic = require('./decryptMusic');
const https = require('https');

class api {
    static apiRequest(keyWord) {
        return new Promise((resolve, reject) => {
            const reqData = {
                limit: '1',
                offset: '0',
                total: 'true',
                type: '1',
                s: keyWord
            }
            const encryptData = querystring.stringify(getEncryptObj(reqData));
            //console.log( "data:" + encryptData);
            const requestOptions = {
                host: 'music.163.com',
                port: 443,
                type: 'http',
                method: 'POST',
                path: '/weapi/cloudsearch/get/web?csrf_token=',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Referer': 'https://music.163.com/search/'
                }
            }
            let _data = '';

            // console.log("发送请求：" + requestOptions.host + requestOptions.path);

            const req = https.request(requestOptions, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    _data += chunk;
                });
                res.on('end', function () {
                    resolve(_data);
                });
                res.on('error', function (e) {
                    console.dir('problem with request: ' + e.message);
                    reject(e)
                });
            });
            req.write(encryptData);
            req.end();
        })
    }

    static async search(keyWord) {
        return await this.apiRequest(keyWord).then(d => {
            try {
                let data = null;
                let res = JSON.parse(d);
                if (res.code !== 200) return "not found";
                if (res.abroad) {
                    // 搜索url解密key为'fuck~#$%^&*(458'
                    const key = 'fuck~#$%^&*(458';
                    data = JSON.parse(decodeURIComponent(decryptMusic(res.result, key)));
                } else {
                    data = res.result;
                }
                return data.songCount > 0 ? `[CQ:music,id=${data.songs[0].id},type=163]` : "not found";
            }
            catch (ex) {
                console.log(ex);
                return { code: "error" };
            }
        });
    }



}

module.exports = api;
