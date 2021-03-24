const api = require("./api");

async function test() {
    try {
        let str = "room 1611"
        let reply = await api.search(str);
        console.log(reply);
    } catch (ex) {
        console.log(ex);
    }
}

test();