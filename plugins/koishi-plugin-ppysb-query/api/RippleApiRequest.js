"use strict";

const querystring = require('querystring');
const fetch = require('node-fetch');

class RippleApi {
    static async apiCall(_path, _data, _host) {
        try {
            const contents = (_data) ? querystring.stringify(_data) : "";
            const url = "https://" + _host + "/api/v1" + _path + '?' + contents;
            // console.log(url);
            const data = await fetch(url).then(res => res.json());
            if (!data) return { code: "error" };
            const dataString = JSON.stringify(data);
            if (dataString === "[]" || dataString === "{}") return { code: 404 };
            return data;
        }
        catch (ex) {
            console.log("（不会发送给机器人）--------------\n" + ex + "\n--------------");
            return { code: "error" };
        }
    }

    //判断字符串是否为正整数
    static checkInt(nubmer) {
        var re = /^\d+$/;
        return (re.test(nubmer));
    }

    static setIdOrName(options, data = {}) {
        const u = options.u;
        const type = options.type;
        if (type) {
            if (type == 'string') { data.name = u; return data; }
            if (type == 'id') { data.id = u; return data; }
        }
        if (this.checkInt(u)) { data.id = u; return data; }
        else { data.name = u; return data; }
    }

    /**
     * ping
     * @param {String} host 
     */
    static async getPing(host) {
        const resp = await this.apiCall('/ping', null, host);
        return resp;
    }

	/**
     * 获取user简略信息
     * @param {String} host 
	 * @param {Object} options apiOptions格式（osu api参数格式）
	 * @returns {Promise<Object>} The response body
	 */
    static async getUsers(options, host) {
        let data = this.setIdOrName(options);
        const resp = await this.apiCall('/users', data, host);
        return resp;
    }

	/**
     * 获取user详细信息
     * @param {String} host 
	 * @param {Object} options apiOptions格式（osu api参数格式）
	 * @returns {Promise<Object>} The response body
	 */
    static async getUsersFull(options, host) {
        let data = this.setIdOrName(options);
        const resp = await this.apiCall('/users/full', data, host);
        return resp;
    }

	/**
     * 获取user relax详细信息
     * @param {String} host 
	 * @param {Object} options apiOptions格式（osu api参数格式）
	 * @returns {Promise<Object>} The response body
	 */
    static async getUsersFullRx(options, host) {
        let data = this.setIdOrName(options);
        const resp = await this.apiCall('/users/rxfull', data, host);
        return resp;
    }

	/**
     * 根据username获取userId
     * @param {String} host 
	 * @param {Object} options apiOptions格式（osu api参数格式）
	 * @returns {Promise<Object>} The response body
	 */
    static async getUserId(options, host) {
        let data = { name: options.u };
        const resp = await this.apiCall('/users/whatid', data, host);
        return resp;
    }

	/**
     * 获取user recent
     * @param {String} host 
	 * @param {Object} options apiOptions格式（osu api参数格式）
	 * @returns {Promise<Object>} The response body
	 */
    static async getRecent(options, host) {
        let data = this.setIdOrName(options);
        if (options.limit) data.l = options.limit;
        if (options.m || options.m === 0) data.mode = options.m;
        const resp = await this.apiCall('/users/scores/recent', data, host);
        return resp;
    }

	/**
     * 获取user relax recent
     * @param {String} host 
	 * @param {Object} options apiOptions格式（osu api参数格式）
	 * @returns {Promise<Object>} The response body
	 */
    static async getRecentRx(options, host) {
        let data = this.setIdOrName(options);
        if (options.limit) data.l = options.limit;
        if (options.m || options.m === 0) data.mode = options.m;
        const resp = await this.apiCall('/users/scores/rxrecent', data, host);
        return resp;
    }

	/**
     * 获取user best（100个/页），查找指定bp：&l=1&p=#number
     * @param {String} host 
	 * @param {Object} options apiOptions格式（osu api参数格式）
	 * @returns {Promise<Object>} The response body
	 */
    static async getBests(options, host) {
        let data = this.setIdOrName(options);
        if (options.limit) data.l = options.limit;
        if (options.m || options.m === 0) data.mode = options.m;
        if (options.p) data.p = options.p;
        const resp = await this.apiCall('/users/scores/best', data, host);
        return resp;
    }

	/**
     * 获取user 全部 best
     * @param {String} host 
	 * @param {Object} options apiOptions格式（osu api参数格式）
	 * @returns {Promise<Object>} The response body
	 */
    static async getBestsAll(options, host) {
        let data = this.setIdOrName(options);
        // limit失效
        if (options.m || options.m === 0) data.mode = options.m;
        const resp = await this.apiCall('/users/scores/bestall', data, host);
        return resp;
    }

	/**
     * 获取user relax best，查找指定bp：&l=1&p=#number
     * @param {String} host 
	 * @param {Object} options apiOptions格式（osu api参数格式）
	 * @returns {Promise<Object>} The response body
	 */
    static async getBestsRx(options, host) {
        let data = this.setIdOrName(options);
        if (options.limit) data.l = options.limit;
        if (options.m || options.m === 0) data.mode = options.m;
        if (options.p) data.p = options.p;
        const resp = await this.apiCall('/users/scores/rxbest', data, host);
        return resp;
    }

	/**
     * 获取user 全部 relax best
     * @param {String} host 
	 * @param {Object} options apiOptions格式（osu api参数格式）
	 * @returns {Promise<Object>} The response body
	 */
    static async getBestsRxAll(options, host) {
        let data = this.setIdOrName(options);
        // limit失效
        if (options.m || options.m === 0) data.mode = options.m;
        const resp = await this.apiCall('/users/scores/rxbestall', data, host);
        return resp;
    }

	/**
     * 根据谱面获取成绩 暂不支持查relax成绩！！
     * @param {String} host 
	 * @param {Object} options apiOptions格式（osu api参数格式）
	 * @returns {Promise<Object>} The response body
	 */
    static async getScores(options, host) {
        // 没法查指定人，u用不着了
        let data = {};
        if (options.b) data.b = options.b;
        if (options.limit) data.l = options.limit;
        if (options.m || options.m === 0) data.mode = options.m;
        data.sort = "score,desc" // 按得分降序排列
        const resp = await this.apiCall('/scores', data, host);
        return resp;
    }

}

module.exports = RippleApi;
