import BigNumber from 'bignumber.js'
import erc20 from 'config/abi/erc20.json'
import factotyABI from 'config/abi/factory.json'
import LPAbi from 'config/abi/lp.json'
import masterchefABI from 'config/abi/masterchef.json'
import multicall from 'utils/multicall'
import { getMasterChefAddress, getFactoryAddress } from 'utils/addressHelpers'
import farmsConfig from 'config/constants/farms'
import { QuoteToken } from '../../config/constants/types'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

export const fetchToken = async (tokenAddress) => {
    const calls = [
        {
            address: tokenAddress,
            name: 'name'
        },
        {
            address: tokenAddress,
            name: 'symbol'
        },
        {
            address: tokenAddress,
            name: 'decimals'
        },
    ]

    const [
        name,
        symbol,
        decimals
    ] = await multicall(erc20, calls)

    return {
        name, symbol, decimals, address: tokenAddress
    }
}

export const fetchLPToken = async (tokenAddress1, tokenAddress2) => {

    const calls = [
        {
            address: getFactoryAddress(),
            name: 'getPair',
            params: [tokenAddress1, tokenAddress2],
        }
    ]

    const [
        lpAddress
    ] = await multicall(factotyABI, calls)

    if (lpAddress[0].toLowerCase() === "0x0000000000000000000000000000000000000000".toLowerCase()) throw new Error("Unregistered pair")
    return lpAddress[0]
}

export const fetchFarm = async (farmConfig) => {
    const lpAdress = farmConfig.lpAddresses[CHAIN_ID]
    const calls = [
        // Balance of token in the LP contract
        {
            address: farmConfig.tokenAddresses[CHAIN_ID],
            name: 'balanceOf',
            params: [lpAdress],
        },
        // Balance of quote token on LP contract
        {
            address: farmConfig.quoteTokenAdresses[CHAIN_ID],
            name: 'balanceOf',
            params: [lpAdress],
        },
        // Balance of LP tokens in the master chef contract
        {
            address: farmConfig.isTokenOnly ? farmConfig.tokenAddresses[CHAIN_ID] : lpAdress,
            name: 'balanceOf',
            params: [getMasterChefAddress()],
        },
        // Total supply of LP tokens
        {
            address: lpAdress,
            name: 'totalSupply',
        },
        // Token decimals
        {
            address: farmConfig.tokenAddresses[CHAIN_ID],
            name: 'decimals',
        },
        // Quote token decimals
        {
            address: farmConfig.quoteTokenAdresses[CHAIN_ID],
            name: 'decimals',
        },
    ]

    const [
        tokenBalanceLP,
        quoteTokenBlanceLP,
        lpTokenBalanceMC,
        lpTotalSupply,
        tokenDecimals,
        quoteTokenDecimals
    ] = await multicall(erc20, calls)

    let tokenAmount;
    let lpTotalInQuoteToken;
    let tokenPriceVsQuote;
    if (farmConfig.isTokenOnly) {
        tokenAmount = new BigNumber(lpTokenBalanceMC).div(new BigNumber(10).pow(tokenDecimals));
        if (farmConfig.tokenSymbol === QuoteToken.BUSD && farmConfig.quoteTokenSymbol === QuoteToken.BUSD) {
            tokenPriceVsQuote = new BigNumber(1);
        } else {
            tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP));
        }
        lpTotalInQuoteToken = tokenAmount.times(tokenPriceVsQuote);
    } else {
        // Ratio in % a LP tokens that are in staking, vs the total number in circulation
        const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))

        // Total value in staking in quote token value
        lpTotalInQuoteToken = new BigNumber(quoteTokenBlanceLP)
            .div(new BigNumber(10).pow(18))
            .times(new BigNumber(2))
            .times(lpTokenRatio)

        // Amount of token in the LP that are considered staking (i.e amount of token * lp ratio)
        tokenAmount = new BigNumber(tokenBalanceLP).div(new BigNumber(10).pow(tokenDecimals)).times(lpTokenRatio)
        const quoteTokenAmount = new BigNumber(quoteTokenBlanceLP)
            .div(new BigNumber(10).pow(quoteTokenDecimals))
            .times(lpTokenRatio)

        if (tokenAmount.comparedTo(0) > 0) {
            tokenPriceVsQuote = quoteTokenAmount.div(tokenAmount);
        } else {
            tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP));
        }
    }

    const [info] = await multicall(masterchefABI, [
        {
            address: getMasterChefAddress(),
            name: 'poolInfo',
            params: [farmConfig.pid],
        }
    ])
    //   const allocPoint = new BigNumber(info.allocPoint._hex)

    return {
        ...farmConfig,
        tokenAmount: tokenAmount.toJSON(),
        // quoteTokenAmount: quoteTokenAmount,
        lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
        tokenPriceVsQuote: tokenPriceVsQuote.toJSON(),
        // multiplier: `${allocPoint.div(100).toString()}X`,
        depositFeeBP: info.depositFeeBP
    }
}
const fetchFarms = async () => {
    const data = await Promise.all(
        farmsConfig.map((farmConfig) => fetchFarm(farmConfig)),
    )
    return data
}

export const fetchFarmIndex = async (lpAdress) => {
    const calls = [
        {
            address: lpAdress,
            name: 'token0',
        },
        {
            address: lpAdress,
            name: 'token1',
        }
    ]

    const [
        token0,
        token1
    ] = await multicall(LPAbi, calls);

    const [
        symbol1,
        symbol2
    ] = await multicall(LPAbi, [
        {
            address: token0[0],
            name: 'symbol',
        },
        {
            address: token1[0],
            name: 'symbol',
        }
    ]);

    const [lpIndex] = await multicall(masterchefABI, [{
        address: getMasterChefAddress(),
        name: 'lpIndex',
        params: [lpAdress]
    }])

    if (String(lpIndex) === "0" && lpAdress.toLowerCase() !== ("0xb91Fa8c37D24cbBDfc8670a9aa7c7042DA949276").toLowerCase()) {
        throw new Error("Invalid LP address");
    }

    return {
        pid: Number(lpIndex),
        lpSymbol: `${symbol1[0]}-${symbol2[0]} LP`,
        lpAddresses: {
            97: '',
            56: lpAdress
        },
        tokenSymbol: symbol1[0],
        tokenAddresses: {
            97: '',
            56: token0[0]
        },
        quoteTokenSymbol: symbol2[0],
        quoteTokenAdresses: {
            97: '',
            56: token1[0]
        },
    }
}
export default fetchFarms
