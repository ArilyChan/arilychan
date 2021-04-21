"use strict";

const querystring = require('querystring');
const { getEncryptObj } = require('./aes');
const decryptMusic = require('./decryptMusic');
const https = require('https');

class api {
    static apiRequest(keyWord) {
        return new Promise((resolve, reject) => {
            const reqData = {
                limit: '10',
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
                if (res.code !== 200) return "服务器错误";
                if (res.abroad) {
                    // 搜索url解密key为'fuck~#$%^&*(458'
                    const key = 'fuck~#$%^&*(458';
                    data = JSON.parse(decodeURIComponent(decryptMusic(res.result, key)));
                } else {
                    data = res.result;
                }
                if (data.songCount <= 0) return "找不到歌曲";
                let songs = data.songs;
                // 完全匹配
                let bestIndex = songs.findIndex((song)=> {return song.name === keyWord});
                // 完全包含
                let incIndex = songs.findIndex((song)=> {return song.name.indexOf(keyWord) >= 0});
                let songIndex;
                if (bestIndex >= 0) songIndex = bestIndex;
                else if (incIndex >= 0) songIndex = incIndex;
                else songIndex = 0;
                return `[CQ:music,id=${data.songs[songIndex].id},type=163]`;
            }
            catch (ex) {
                console.log(ex);
                return { code: "error" };
            }
        });
    }



}

module.exports = api;
