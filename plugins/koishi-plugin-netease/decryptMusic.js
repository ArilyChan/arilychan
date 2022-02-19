/* eslint-disable */
function bjQ () {
  const sy = function (iL) {
    if (iL < -128) {
      return sy(128 - (-128 - iL))
    } else if (iL >= -128 && iL <= 127) {
      return iL
    } else if (iL > 127) {
      return sy(-129 + iL - 127)
    } else {
      throw new Error('1001')
    }
  }
  const bjO = function (iL, cl) {
    return sy(iL + cl)
  }
  const bjK = function (Fy, LP) {
    if (Fy == null) {
      return null
    }
    if (LP == null) {
      return Fy
    }
    const lJ = []
    const bjJ = LP.length
    for (let i = 0, ck = Fy.length; i < ck; i++) {
      lJ[i] = bjO(Fy[i], LP[i % bjJ])
    }
    return lJ
  }
  const bjG = function (FF) {
    if (FF == null) {
      return FF
    }
    const lJ = []
    const bjF = FF.length
    for (let i = 0, ck = bjF; i < ck; i++) {
      lJ[i] = sy(0 - FF[i])
    }
    return lJ
  }
  const bjC = function (Mb, Cw) {
    Mb = sy(Mb)
    Cw = sy(Cw)
    return sy(Mb ^ Cw)
  }
  const bdh = function (CA, Mg) {
    if (CA == null || Mg == null || CA.length != Mg.length) {
      return CA
    }
    const lJ = []
    const bjz = CA.length
    for (let i = 0, ck = bjz; i < ck; i++) {
      lJ[i] = bjC(CA[i], Mg[i])
    }
    return lJ
  }
  const bdk = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
  const bjr = function (dE) {
    const wM = []
    wM.push(bdk[dE >>> 4 & 15])
    wM.push(bdk[dE & 15])
    return wM.join('')
  }
  const bjp = function (tO) {
    const ck = tO.length
    if (tO == null || ck < 0) {
      return new String('')
    }
    const wM = []
    for (let i = 0; i < ck; i++) {
      wM.push(bjr(tO[i]))
    }
    return wM.join('')
  }
  const bdn = function (Gl) {
    if (Gl == null || Gl.length == 0) {
      return Gl
    }
    const Mv = new String(Gl)
    const lJ = []
    const ck = Mv.length / 2
    let cl = 0
    for (let i = 0; i < ck; i++) {
      const ud = parseInt(Mv.charAt(cl++), 16) << 4
      const tY = parseInt(Mv.charAt(cl++), 16)
      lJ[i] = sy(ud + tY)
    }
    return lJ
  }
  const bjl = function (dL) {
    if (dL == null || dL == undefined) {
      return dL
    }
    const CE = encodeURIComponent(dL)
    const tO = []
    const bdq = CE.length
    for (let i = 0; i < bdq; i++) {
      if (CE.charAt(i) == '%') {
        if (i + 2 < bdq) {
          tO.push(bdn(CE.charAt(++i) + '' + CE.charAt(++i))[0])
        } else {
          throw new Error('1009')
        }
      } else {
        tO.push(CE.charCodeAt(i))
      }
    }
    return tO
  }
  const bje = function (po) {
    let cQ = 0
    cQ += (po[0] & 255) << 24
    cQ += (po[1] & 255) << 16
    cQ += (po[2] & 255) << 8
    cQ += po[3] & 255
    return cQ
  }
  const bzE = function (cQ) {
    const po = []
    po[0] = cQ >>> 24 & 255
    po[1] = cQ >>> 16 & 255
    po[2] = cQ >>> 8 & 255
    po[3] = cQ & 255
    return po
  }
  const bjc = function (dW, ME, ck) {
    const pr = []
    if (dW == null || dW.length == 0) {
      return pr
    }
    if (dW.length < ck) {
      throw new Error('1003')
    }
    for (let i = 0; i < ck; i++) {
      pr[i] = dW[ME + i]
    }
    return pr
  }
  const MI = function (dW, ME, GC, bja, ck) {
    if (dW == null || dW.length == 0) {
      return GC
    }
    if (GC == null) {
      throw new Error('1004')
    }
    if (dW.length < ck) {
      throw new Error('1003')
    }
    for (let i = 0; i < ck; i++) {
      GC[bja + i] = dW[ME + i]
    }
    return GC
  }
  const biV = function (ck) {
    const cK = []
    for (let i = 0; i < ck; i++) {
      cK[i] = 0
    }
    return cK
  }
  const biU = [82, 9, 106, -43, 48, 54, -91, 56, -65, 64, -93, -98, -127, -13, -41, -5, 124, -29, 57, -126, -101, 47, -1, -121, 52, -114, 67, 68, -60, -34, -23, -53, 84, 123, -108, 50, -90, -62, 35, 61, -18, 76, -107, 11, 66, -6, -61, 78, 8, 46, -95, 102, 40, -39, 36, -78, 118, 91, -94, 73, 109, -117, -47, 37, 114, -8, -10, 100, -122, 104, -104, 22, -44, -92, 92, -52, 93, 101, -74, -110, 108, 112, 72, 80, -3, -19, -71, -38, 94, 21, 70, 87, -89, -115, -99, -124, -112, -40, -85, 0, -116, -68, -45, 10, -9, -28, 88, 5, -72, -77, 69, 6, -48, 44, 30, -113, -54, 63, 15, 2, -63, -81, -67, 3, 1, 19, -118, 107, 58, -111, 17, 65, 79, 103, -36, -22, -105, -14, -49, -50, -16, -76, -26, 115, -106, -84, 116, 34, -25, -83, 53, -123, -30, -7, 55, -24, 28, 117, -33, 110, 71, -15, 26, 113, 29, 41, -59, -119, 111, -73, 98, 14, -86, 24, -66, 27, -4, 86, 62, 75, -58, -46, 121, 32, -102, -37, -64, -2, 120, -51, 90, -12, 31, -35, -88, 51, -120, 7, -57, 49, -79, 18, 16, 89, 39, -128, -20, 95, 96, 81, 127, -87, 25, -75, 74, 13, 45, -27, 122, -97, -109, -55, -100, -17, -96, -32, 59, 77, -82, 42, -11, -80, -56, -21, -69, 60, -125, 83, -103, 97, 23, 43, 4, 126, -70, 119, -42, 38, -31, 105, 20, 99, 85, 33, 12, 125]
  const wl = 64
  const GQ = 64
  const bdz = 4
  const biS = function (lV) {
    const bdB = []
    if (lV == null || lV == undefined || lV.length == 0) {
      return biV(GQ)
    }
    if (lV.length >= GQ) {
      return bjc(lV, 0, GQ)
    } else {
      for (let i = 0; i < GQ; i++) {
        bdB[i] = lV[i % lV.length]
      }
    }
    return bdB
  }
  const biQ = function (GV) {
    if (GV == null || GV.length % wl != 0) {
      throw new Error('1005')
    }
    const MZ = []
    let cl = 0
    const biC = GV.length / wl
    for (let i = 0; i < biC; i++) {
      MZ[i] = []
      for (let j = 0; j < wl; j++) {
        MZ[i][j] = GV[cl++]
      }
    }
    return MZ
  }
  const biA = function (bdV) {
    const ud = bdV >>> 4 & 15
    const tY = bdV & 15
    const cl = ud * 16 + tY
    return biU[cl]
  }
  const bec = function (Ni) {
    if (Ni == null) {
      return null
    }
    const bed = []
    for (let i = 0, ck = Ni.length; i < ck; i++) {
      bed[i] = biA(Ni[i])
    }
    return bed
  }
  const biq = function (vR, lV) {
    if (vR == null) {
      return null
    }
    if (vR.length == 0) {
      return []
    }
    if (vR.length % wl != 0) {
      throw new Error('1005')
    }
    lV = biS(lV)
    let Np = lV
    const Nq = biQ(vR)
    const CR = []
    const bip = Nq.length
    for (let i = 0; i < bip; i++) {
      let Nw = bec(Nq[i])
      Nw = bec(Nw)
      let Nx = bdh(Nw, Np)
      const bio = bjK(Nx, bjG(Np))
      Nx = bdh(bio, lV)
      MI(Nx, 0, CR, i * wl, wl)
      Np = Nq[i]
    }
    const bef = []
    MI(CR, CR.length - bdz, bef, 0, bdz)
    const ck = bje(bef)
    if (ck > CR.length) {
      throw new Error('1006')
    }
    const lJ = []
    MI(CR, 0, lJ, 0, ck)
    return lJ
  }
  const bii = function (Hg, bF) {
    if (Hg == null) {
      return null
    }
    const beo = new String(Hg)
    if (beo.length == 0) {
      return []
    }
    const vR = bdn(beo)
    if (bF == null || bF == undefined) {
      throw new Error('1007')
    }
    const lV = bjl(bF)
    return biq(vR, lV)
  }
  this.bhW = function (Hg, bF) {
    const bhU = bii(Hg, bF)
    const NH = new String(bjp(bhU))
    const Hi = []
    const bhR = NH.length / 2
    let cl = 0
    for (let i = 0; i < bhR; i++) {
      Hi.push('%')
      Hi.push(NH.charAt(cl++))
      Hi.push(NH.charAt(cl++))
    }
    return Hi.join('')
  }
}

module.exports = (new bjQ()).bhW
