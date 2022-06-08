import React, { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import styled, { keyframes } from 'styled-components'
import { Flex, Text, Skeleton } from '@pancakeswap-libs/uikit'
import { communityFarms } from 'config/constants'
import { Farm } from 'state/types'
import { provider } from 'web3-core'
import useI18n from 'hooks/useI18n'
import ExpandableSectionButton from 'components/ExpandableSectionButton'
import { QuoteToken } from 'config/constants/types'
import DetailsSection from './DetailsSection'
import CardHeading from './CardHeading'
import CardActionsContainer from './CardActionsContainer'
import ApyButton from './ApyButton'

export interface FarmWithStakedValue extends Farm {
    apy?: BigNumber
}

const RainbowLight = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

const StyledCardAccent = styled.div`
  background: linear-gradient(45deg,
  rgba(255, 255, 0, 1) 0%,
  rgba(255, 255, 255, 1) 10%,
  rgba(255, 0, 255, 1) 20%,
  rgba(255, 0, 0, 1) 30%,
  rgba(0, 255, 255, 1) 40%,
  rgba(0, 0, 255, 1) 50%,
  rgba(0, 255, 0, 1) 60%,
  rgba(255, 255, 0, 1) 70%,
  rgba(255, 255, 255, 1) 80%,
  rgba(255, 0, 255, 1) 90%,
  rgba(0, 0, 255, 1) 100%);
  background-size: 600% 600%;
  animation: ${RainbowLight} 5s linear infinite;
  border-radius: 16px;
  filter: blur(6px);
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  z-index: -1;
`

const FCard = styled.div`
  align-self: baseline;
  background: ${(props) => props.theme.card.background};
  border-radius: 32px;
  box-shadow: 0px 2px 12px -8px rgba(25, 19, 38, 0.1), 0px 1px 1px rgba(25, 19, 38, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 24px;
  position: relative;
  text-align: center;
`

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.borderColor};
  height: 1px;
  margin: 28px auto;
  width: 100%;
`

const ExpandingWrapper = styled.div<{ expanded: boolean }>`
  height: ${(props) => (props.expanded ? '100%' : '0px')};
`

interface FarmCardProps {
    farm: FarmWithStakedValue
    removed: boolean
    cakePrice?: BigNumber
    bnbPrice?: BigNumber
    ethereum?: provider
    account?: string
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, removed, cakePrice, bnbPrice, ethereum, account }) => {
    const TranslateString = useI18n()

    const [showExpandableSection, setShowExpandableSection] = useState(false)

    // const isCommunityFarm = communityFarms.includes(farm.tokenSymbol)
    // We assume the token name is coin pair + lp e.g. CAKE-BNB LP, LINK-BNB LP,
    // NAR-CAKE LP. The images should be cake-bnb.svg, link-bnb.svg, nar-cake.svg
    // const farmImage = farm.lpSymbol.split(' ')[0].toLocaleLowerCase()
    console.log("FarmCard",farm);
    const farmImage = farm.isTokenOnly ? farm.tokenSymbol.toLowerCase() : `${farm.tokenSymbol.toLowerCase()}-${farm.quoteTokenSymbol.toLowerCase()}`

    const totalValue: BigNumber = useMemo(() => {
        if (!farm.lpTotalInQuoteToken) {
            return null
        }
        if (farm.quoteTokenSymbol === QuoteToken.BNB) {
            return bnbPrice.times(farm.lpTotalInQuoteToken)
        }
        if (farm.quoteTokenSymbol === QuoteToken.CAKE) {
            return cakePrice.times(farm.lpTotalInQuoteToken)
        }
        return farm.lpTotalInQuoteToken
    }, [bnbPrice, cakePrice, farm.lpTotalInQuoteToken, farm.quoteTokenSymbol])

    const totalValueFormated = totalValue
        ? `$${Number(totalValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        : '-'

    const lpLabel = farm.lpSymbol
    const earnLabel = `${farm.tokenSymbol},${farm.quoteTokenSymbol}`;
    const farmAPY = farm.apy && farm.apy.times(new BigNumber(100)).toNumber().toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    const { quoteTokenAdresses, quoteTokenSymbol, tokenAddresses, risk } = farm

    return (
        <FCard style={{ overflow: "hidden" }}>
            {farm.tokenSymbol === 'XBT' && <StyledCardAccent />}
            <CardHeading
                lpLabel={lpLabel}
                multiplier={farm.multiplier}
                risk={risk}
                depositFee={farm.depositFeeBP}
                farmImage={farmImage}
                tokenSymbol={farm.tokenSymbol}
            />

            <Flex justifyContent='space-between'>
                <Text>{TranslateString(318, 'Earn')}:</Text>
                <Text bold>{earnLabel}</Text>
            </Flex>
            <Flex justifyContent='space-between'>
                <Text style={{ fontSize: '24px' }}>{TranslateString(10001, 'Deposit Fee')}:</Text>
                <Text bold style={{ fontSize: '24px' }}>{0}%</Text>
            </Flex>
            <CardActionsContainer farm={farm} ethereum={ethereum} account={account} />
            <Divider />
            <ExpandableSectionButton
                onClick={() => setShowExpandableSection(!showExpandableSection)}
                expanded={showExpandableSection}
            />
            <ExpandingWrapper expanded={showExpandableSection}>
                <DetailsSection
                    removed={removed}
                    isTokenOnly={farm.isTokenOnly}
                    bscScanAddress={
                        farm.isTokenOnly ?
                            `https://bscscan.com/token/${farm.tokenAddresses[process.env.REACT_APP_CHAIN_ID]}`
                            :
                            `https://bscscan.com/token/${farm.lpAddresses[process.env.REACT_APP_CHAIN_ID]}`
                    }
                    totalValueFormated={totalValueFormated}
                    lpLabel={lpLabel}
                    quoteTokenAdresses={quoteTokenAdresses}
                    quoteTokenSymbol={quoteTokenSymbol}
                    tokenAddresses={tokenAddresses}
                />
            </ExpandingWrapper>
        </FCard>
    )
}

export default FarmCard
