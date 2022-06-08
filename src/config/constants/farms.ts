import contracts from './contracts'
import { FarmConfig, QuoteToken } from './types'

const farms: FarmConfig[] = [
    {
        pid: 1,
        risk: 5,
        lpSymbol: 'XBT-BNB LP',
        lpAddresses: {
            97: '',
            56: '0x4CEFa7F1B27E414768bb837661332E8603b58791',
        },
        tokenSymbol: 'XBT',
        tokenAddresses: {
            97: '',
            56: '0xe329102DA0E7E135656CD72CDc983c81f27CB5B6',
        },
        quoteTokenSymbol: QuoteToken.BNB,
        quoteTokenAdresses: contracts.wbnb,
        isNative : true
    },
    {
        pid: 2,
        risk: 1,
        lpSymbol: 'XBT-BUSD LP',
        lpAddresses: {
            97: '',
            56: '0x59Ad7323970682B609241Ac3819A6aD05BBC38a2',
        },
        tokenSymbol: 'XBT',
        tokenAddresses: {
            97: '',
            56: '0xe329102DA0E7E135656CD72CDc983c81f27CB5B6',
        },
        quoteTokenSymbol: QuoteToken.BUSD,
        quoteTokenAdresses: contracts.busd,
        isNative : true
    },
    {
        pid: 3,
        risk: 2,
        lpSymbol: 'BUSD-BNB LP',
        lpAddresses: {
            97: '',
            56: '0x0A87708015EAa2a35389867E1b94f3D33173eE72',
        },
        tokenSymbol: QuoteToken.BUSD,
        tokenAddresses: contracts.busd,
        quoteTokenSymbol: QuoteToken.BNB,
        quoteTokenAdresses: contracts.wbnb,
        isNative : true
    }
]

export const addFarms = (farm: FarmConfig) => {
    const inExist = farms.findIndex(_farm => _farm.pid === farm.pid);
    if (inExist === -1) {
        if (farms.length === 3)
            farms.push(farm)
        else farms[3] = farm;
        return true;
    }
    return false;
}

export default farms
