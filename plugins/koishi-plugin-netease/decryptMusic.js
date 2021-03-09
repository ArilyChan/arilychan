function bjQ() {
    var sy = function (iL) {
        if (iL < -128) {
            return sy(128 - (-128 - iL))
        } else if (iL >= -128 && iL <= 127) {
            return iL
        } else if (iL > 127) {
            return sy(-129 + iL - 127)
        } else {
            throw new Error("1001")
        }
    };
    var bjO = function (iL, cl) {
        return sy(iL + cl)
    };
    var bjK = function (Fy, LP) {
        if (Fy == null) {
            return null
        }
        if (LP == null) {
            return Fy
        }
        var lJ = [];
        var bjJ = LP.length;
        for (var i = 0, ck = Fy.length; i < ck; i++) {
            lJ[i] = bjO(Fy[i], LP[i % bjJ])
        }
        return lJ
    };
    var bjG = function (FF) {
        if (FF == null) {
            return FF
        }
        var lJ = [];
        var bjF = FF.length;
        for (var i = 0, ck = bjF; i < ck; i++) {
            lJ[i] = sy(0 - FF[i])
        }
        return lJ
    };
    var bjC = function (Mb, Cw) {
        Mb = sy(Mb);
        Cw = sy(Cw);
        return sy(Mb ^ Cw)
    };
    var bdh = function (CA, Mg) {
        if (CA == null || Mg == null || CA.length != Mg.length) {
            return CA
        }
        var lJ = [];
        var bjz = CA.length;
        for (var i = 0, ck = bjz; i < ck; i++) {
            lJ[i] = bjC(CA[i], Mg[i])
        }
        return lJ
    };
    var bdk = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    var bjr = function (dE) {
        var wM = [];
        wM.push(bdk[dE >>> 4 & 15]);
        wM.push(bdk[dE & 15]);
        return wM.join("")
    };
    var bjp = function (tO) {
        var ck = tO.length;
        if (tO == null || ck < 0) {
            return new String("")
        }
        var wM = [];
        for (var i = 0; i < ck; i++) {
            wM.push(bjr(tO[i]))
        }
        return wM.join("")
    };
    var bdn = function (Gl) {
        if (Gl == null || Gl.length == 0) {
            return Gl
        }
        var Mv = new String(Gl);
        var lJ = [];
        var ck = Mv.length / 2;
        var cl = 0;
        for (var i = 0; i < ck; i++) {
            var ud = parseInt(Mv.charAt(cl++), 16) << 4;
            var tY = parseInt(Mv.charAt(cl++), 16);
            lJ[i] = sy(ud + tY)
        }
        return lJ
    };
    var bjl = function (dL) {
        if (dL == null || dL == undefined) {
            return dL
        }
        var CE = encodeURIComponent(dL);
        var tO = [];
        var bdq = CE.length;
        for (var i = 0; i < bdq; i++) {
            if (CE.charAt(i) == "%") {
                if (i + 2 < bdq) {
                    tO.push(bdn(CE.charAt(++i) + "" + CE.charAt(++i))[0])
                } else {
                    throw new Error("1009")
                }
            } else {
                tO.push(CE.charCodeAt(i))
            }
        }
        return tO
    };
    var bje = function (po) {
        var cQ = 0;
        cQ += (po[0] & 255) << 24;
        cQ += (po[1] & 255) << 16;
        cQ += (po[2] & 255) << 8;
        cQ += po[3] & 255;
        return cQ
    };
    var bzE = function (cQ) {
        var po = [];
        po[0] = cQ >>> 24 & 255;
        po[1] = cQ >>> 16 & 255;
        po[2] = cQ >>> 8 & 255;
        po[3] = cQ & 255;
        return po
    };
    var bjc = function (dW, ME, ck) {
        var pr = [];
        if (dW == null || dW.length == 0) {
            return pr
        }
        if (dW.length < ck) {
            throw new Error("1003")
        }
        for (var i = 0; i < ck; i++) {
            pr[i] = dW[ME + i]
        }
        return pr
    };
    var MI = function (dW, ME, GC, bja, ck) {
        if (dW == null || dW.length == 0) {
            return GC
        }
        if (GC == null) {
            throw new Error("1004")
        }
        if (dW.length < ck) {
            throw new Error("1003")
        }
        for (var i = 0; i < ck; i++) {
            GC[bja + i] = dW[ME + i]
        }
        return GC
    };
    var biV = function (ck) {
        var cK = [];
        for (var i = 0; i < ck; i++) {
            cK[i] = 0
        }
        return cK
    };
    var biU = [82, 9, 106, -43, 48, 54, -91, 56, -65, 64, -93, -98, -127, -13, -41, -5, 124, -29, 57, -126, -101, 47, -1, -121, 52, -114, 67, 68, -60, -34, -23, -53, 84, 123, -108, 50, -90, -62, 35, 61, -18, 76, -107, 11, 66, -6, -61, 78, 8, 46, -95, 102, 40, -39, 36, -78, 118, 91, -94, 73, 109, -117, -47, 37, 114, -8, -10, 100, -122, 104, -104, 22, -44, -92, 92, -52, 93, 101, -74, -110, 108, 112, 72, 80, -3, -19, -71, -38, 94, 21, 70, 87, -89, -115, -99, -124, -112, -40, -85, 0, -116, -68, -45, 10, -9, -28, 88, 5, -72, -77, 69, 6, -48, 44, 30, -113, -54, 63, 15, 2, -63, -81, -67, 3, 1, 19, -118, 107, 58, -111, 17, 65, 79, 103, -36, -22, -105, -14, -49, -50, -16, -76, -26, 115, -106, -84, 116, 34, -25, -83, 53, -123, -30, -7, 55, -24, 28, 117, -33, 110, 71, -15, 26, 113, 29, 41, -59, -119, 111, -73, 98, 14, -86, 24, -66, 27, -4, 86, 62, 75, -58, -46, 121, 32, -102, -37, -64, -2, 120, -51, 90, -12, 31, -35, -88, 51, -120, 7, -57, 49, -79, 18, 16, 89, 39, -128, -20, 95, 96, 81, 127, -87, 25, -75, 74, 13, 45, -27, 122, -97, -109, -55, -100, -17, -96, -32, 59, 77, -82, 42, -11, -80, -56, -21, -69, 60, -125, 83, -103, 97, 23, 43, 4, 126, -70, 119, -42, 38, -31, 105, 20, 99, 85, 33, 12, 125];
    var wl = 64;
    var GQ = 64;
    var bdz = 4;
    var biS = function (lV) {
        var bdB = [];
        if (lV == null || lV == undefined || lV.length == 0) {
            return biV(GQ)
        }
        if (lV.length >= GQ) {
            return bjc(lV, 0, GQ)
        } else {
            for (var i = 0; i < GQ; i++) {
                bdB[i] = lV[i % lV.length]
            }
        }
        return bdB
    };
    var biQ = function (GV) {
        if (GV == null || GV.length % wl != 0) {
            throw new Error("1005")
        }
        var MZ = [];
        var cl = 0;
        var biC = GV.length / wl;
        for (var i = 0; i < biC; i++) {
            MZ[i] = [];
            for (var j = 0; j < wl; j++) {
                MZ[i][j] = GV[cl++]
            }
        }
        return MZ
    };
    var biA = function (bdV) {
        var ud = bdV >>> 4 & 15;
        var tY = bdV & 15;
        var cl = ud * 16 + tY;
        return biU[cl]
    };
    var bec = function (Ni) {
        if (Ni == null) {
            return null
        }
        var bed = [];
        for (var i = 0, ck = Ni.length; i < ck; i++) {
            bed[i] = biA(Ni[i])
        }
        return bed
    };
    var biq = function (vR, lV) {
        if (vR == null) {
            return null
        }
        if (vR.length == 0) {
            return []
        }
        if (vR.length % wl != 0) {
            throw new Error("1005")
        }
        lV = biS(lV);
        var Np = lV;
        var Nq = biQ(vR);
        var CR = [];
        var bip = Nq.length;
        for (var i = 0; i < bip; i++) {
            var Nw = bec(Nq[i]);
            Nw = bec(Nw);
            var Nx = bdh(Nw, Np);
            var bio = bjK(Nx, bjG(Np));
            Nx = bdh(bio, lV);
            MI(Nx, 0, CR, i * wl, wl);
            Np = Nq[i]
        }
        var bef = [];
        MI(CR, CR.length - bdz, bef, 0, bdz);
        var ck = bje(bef);
        if (ck > CR.length) {
            throw new Error("1006")
        }
        var lJ = [];
        MI(CR, 0, lJ, 0, ck);
        return lJ
    };
    var bii = function (Hg, bF) {
        if (Hg == null) {
            return null
        }
        var beo = new String(Hg);
        if (beo.length == 0) {
            return []
        }
        var vR = bdn(beo);
        if (bF == null || bF == undefined) {
            throw new Error("1007")
        }
        var lV = bjl(bF);
        return biq(vR, lV)
    };
    this.bhW = function (Hg, bF) {
        var bhU = bii(Hg, bF);
        var NH = new String(bjp(bhU));
        var Hi = [];
        var bhR = NH.length / 2;
        var cl = 0;
        for (var i = 0; i < bhR; i++) {
            Hi.push("%");
            Hi.push(NH.charAt(cl++));
            Hi.push(NH.charAt(cl++))
        }
        return Hi.join("")
    }
}

module.exports = (new bjQ).bhW;