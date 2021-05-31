class RandomRecord{
    /**
     * @param {string} id qqId
     * @param {number} seed 
     * @param {Date} date 
     */
    constructor(id, seed, date) {
        this.id = id;
        this.seed = seed;
        this.timeStamp = date.setHours(0, 0, 0, 0);
    }

    /**
     * @param {number} seed 
     * @param {Date} date 
     */
    update(seed, date) {
        this.seed = seed;
        this.timeStamp = date.setHours(0, 0, 0, 0);
    }

    getSeed() {
        return this.seed;
    }

    isSameDay(dateB) {
        return (this.timeStamp === dateB.setHours(0, 0, 0, 0));
    }
}

class RandomRecordCollection{
    constructor() {
        this.list = {};
    }

    seedGen() {
        return Math.round(Math.random()*9999 + 1);
    }

    add(id, seed) {
        let rr = new RandomRecord(id, seed, new Date());
        this.list[id] = rr;
    }

    getSeed(id) {
        if (!this.list[id]) {
            let seed = this.seedGen();
            this.add(id, seed);
            return seed;
        }
        else {
            let rr = this.list[id];
            if (rr.isSameDay(new Date())) return rr.getSeed();
            else {
                let seed = this.seedGen();
                rr.update(seed, new Date());
                return seed;
            }
        }
    }
}

module.exports = RandomRecordCollection;