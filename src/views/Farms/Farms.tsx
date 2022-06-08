import React, { useEffect, useCallback, useState } from 'react'
import { NotificationManager } from 'react-notifications';
import styled from 'styled-components'
import { Route, useRouteMatch, useLocation, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import BigNumber from 'bignumber.js'
import { useWallet } from '@binance-chain/bsc-use-wallet'
import { provider } from 'web3-core'
import { Image, Heading, Input, Button } from '@pancakeswap-libs/uikit'
import { BLOCKS_PER_YEAR, CAKE_PER_BLOCK, CAKE_POOL_PID } from 'config'
import FlexLayout from 'components/layout/Flex'
import Page from 'components/layout/Page'
import { useFarms, usePriceBnbBusd, usePriceCakeBusd } from 'state/hooks'
import useRefresh from 'hooks/useRefresh'
import { fetchFarmsPublicDataAsync, fetchFarmUserDataAsync, addFarmDatas } from 'state/actions'
import { QuoteToken } from 'config/constants/types'
import useI18n from 'hooks/useI18n'
import FarmCard, { FarmWithStakedValue } from './components/FarmCard/FarmCard'
import FarmTabButtons from './components/FarmTabButtons'
import Divider from './components/Divider'
import { fetchFarm, fetchFarmIndex } from '../../state/farms/fetchFarms'
import { setFarmsPublicData } from "../../state/farms"
import farms, { addFarms } from "../../config/constants/farms"

export interface FarmsProps {
    tokenMode?: boolean
}

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const Farms: React.FC<FarmsProps> = (farmsProps) => {
    const { path } = useRouteMatch()
    const query = useQuery();
    const history = useHistory();

    const TranslateString = useI18n()
    const farmsLP = useFarms()
    const cakePrice = usePriceCakeBusd()
    const bnbPrice = usePriceBnbBusd()
    const { account, ethereum }: { account: string; ethereum: provider } = useWallet()
    const { tokenMode } = farmsProps;

    const dispatch = useDispatch()
    const { fastRefresh } = useRefresh()
    useEffect(() => {
        if (account) {
            dispatch(fetchFarmUserDataAsync(account))
        }
    }, [account, dispatch, fastRefresh])

    const [lpAddress, setLpAddress] = useState("");
    const [stakedOnly, setStakedOnly] = useState(false)
    const [isPublic, setIsPublic] = useState(true)
    const [personalFarms, setPersonalFarms] = useState([]);

    const activeFarms = farmsLP.filter((farm) => !!farm.isTokenOnly === !!tokenMode && farm.multiplier !== '0X')
    const inactiveFarms = farmsLP.filter((farm) => !!farm.isTokenOnly === !!tokenMode && farm.multiplier === '0X')

    const stakedOnlyFarms = activeFarms.filter(
        (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
    )

    // /!\ This function will be removed soon
    // This function compute the APY for each farm and will be replaced when we have a reliable API
    // to retrieve assets prices against USD
    const farmsList = useCallback(
        (farmsToDisplay, removed: boolean) => {
            // const cakePriceVsBNB = new BigNumber(farmsLP.find((farm) => farm.pid === CAKE_POOL_PID)?.tokenPriceVsQuote || 0)
            const farmsToDisplayWithAPY: FarmWithStakedValue[] = farmsToDisplay.map((farm) => {
                // if (!farm.tokenAmount || !farm.lpTotalInQuoteToken || !farm.lpTotalInQuoteToken) {
                //   return farm
                // }
                const cakeRewardPerBlock = new BigNumber(farm.eggPerBlock || 1).times(new BigNumber(farm.poolWeight)).div(new BigNumber(10).pow(18))
                const cakeRewardPerYear = cakeRewardPerBlock.times(BLOCKS_PER_YEAR)

                let apy = cakePrice.times(cakeRewardPerYear);

                let totalValue = new BigNumber(farm.lpTotalInQuoteToken || 0);

                if (farm.quoteTokenSymbol === QuoteToken.BNB) {
                    totalValue = totalValue.times(bnbPrice);
                }

                if (totalValue.comparedTo(0) > 0) {
                    apy = apy.div(totalValue);
                }

                return { ...farm, apy }
            })
            return farmsToDisplayWithAPY.map((farm) => (
                <FarmCard
                    key={farm.pid}
                    farm={farm}
                    removed={removed}
                    bnbPrice={bnbPrice}
                    cakePrice={cakePrice}
                    ethereum={ethereum}
                    account={account}
                />
            ))
        },
        [bnbPrice, account, cakePrice, ethereum],
    )

    const handleFind = useCallback(async (LpAddress) => {
        let farmIndex;
        let farm;
        try {
            farmIndex = await fetchFarmIndex(LpAddress);
            dispatch(addFarmDatas(farmIndex));
            dispatch(fetchFarmsPublicDataAsync);
            dispatch(fetchFarmUserDataAsync(account));
            farm = await fetchFarm(farmIndex);
            setPersonalFarms([farm]);
        } catch (err: any) {
            console.log("handle find error", err.message);

            NotificationManager.error("invalid address", 'Find Farm failed');
        }
    }, [account, dispatch]);

    // native-farm, non native farm
    useEffect(() => {
        if (query.get("lp")) {
            setIsPublic(false);
            setLpAddress(query.get("lp"));
            handleFind(query.get("lp"));
        }
    }, [])

    return (
        <Page>
            <Heading as="h1" size="lg" color="primary" mb="20px" style={{ textAlign: 'center' }}>
                {
                    TranslateString(320, 'Stake LP Tokens To Earn Tokens')
                }
            </Heading>
            <Heading as="h1" size="lg" color="primary" mb="20px" style={{ textAlign: 'center' }}>
                Any Pair Created on BabylonSwap has a Farm where you can Earn Money
            </Heading>
            <FarmTabButtons stakedOnly={stakedOnly} setStakedOnly={setStakedOnly} isPublic={isPublic} setIsPublic={setIsPublic} />
            {isPublic ? (<div>
                <Divider />
                <FlexLayout>
                    <Route exact path={`${path}`}>
                        {stakedOnly ? farmsList(stakedOnlyFarms, false) : farmsList(activeFarms, false)}
                    </Route>
                </FlexLayout>
            </div>) : (
                <div>
                    <Divider />
                    <FlexLayout>
                        <Wrapper>
                            <Button style={{ height: "50px", marginLeft: "10px" }} onClick={() => {history.push("/farmfinder");}}>
                                Find Using Token Contract Address
                            </Button>
                        </Wrapper>
                    </FlexLayout>

                    <Heading as="h1" size="md" color="primary" mb="10px" style={{ textAlign: 'center' }}>
                        Or Enter LP Contract Address
                    </Heading>
                    <FlexLayout>
                        <Wrapper>
                            <Input value={lpAddress} onChange={(e) => setLpAddress(e.target.value)} />
                            <Button style={{ height: "50px", marginLeft: "10px" }} onClick={() => handleFind(lpAddress)}>
                                Find
                            </Button>
                        </Wrapper>
                    </FlexLayout>
                    <FlexLayout>
                        {farmsList(personalFarms, false)}
                    </FlexLayout>
                </div>
            )}
        </Page>
    )
}

export default Farms

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
`