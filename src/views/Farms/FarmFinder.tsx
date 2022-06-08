import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, ChevronDownIcon, AddIcon, CardBody, Text, Heading } from '@pancakeswap-libs/uikit'
import { NotificationManager } from 'react-notifications';
import TranslatedText from 'components/TranslatedText'
import Page from 'components/layout/Page'
import { LightCard, AutoColumn, ColumnCenter, FindPoolTabs, BodyWrapper } from './components/FarmFinder'
import CurrencySearchModal, { Currency } from './components/FarmFinder/CurrencySearchModal'
import { fetchLPToken } from '../../state/farms/fetchFarms'


enum Fields {
    TOKEN0 = 0,
    TOKEN1 = 1
}

export default function PoolFinder() {
    const history = useHistory();

    const [showSearch, setShowSearch] = useState<boolean>(false)
    const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)

    const [currency0, setCurrency0] = useState<Currency | null>(null)
    const [currency1, setCurrency1] = useState<Currency | null>(null)

    const handleCurrencySelect = useCallback(
        (currency: Currency) => {
            if (activeField === Fields.TOKEN0) {
                setCurrency0(currency)
            } else {
                setCurrency1(currency)
            }
        },
        [activeField]
    )

    const handleFindLp = useCallback(async () => {
        try {
            if (!currency0 || !currency1) throw new Error("Invalid token");
            const lpAddress = await fetchLPToken(currency0.address, currency1.address);
            history.push(`/farms?lp=${lpAddress}`)
        } catch (err) {
            NotificationManager.error("invalid address", 'Find LP failed');
        }
    }, [fetchLPToken, currency0, currency1])

    const handleSearchDismiss = useCallback(() => {
        setShowSearch(false)
    }, [setShowSearch])

    return (
        <Page>
            <Heading as="h1" size="lg" color="primary" mb="50px" style={{ textAlign: 'center' }}>
                Stake LP Tokens To Earn Tokens
            </Heading>
            <Heading as="h1" size="lg" color="primary" mb="50px" style={{ textAlign: 'center' }}>
                Any Pair Created on BabylonSwap has a Farm where you can Earn Money
            </Heading>
            <BodyWrapper>
                <FindPoolTabs />
                <CardBody >
                    <AutoColumn gap="md">
                        <Button
                            onClick={() => {
                                setShowSearch(true)
                                setActiveField(Fields.TOKEN0)
                            }}
                            endIcon={<ChevronDownIcon width="24px" color="white" />}
                            fullWidth
                        >
                            {currency0 ? currency0.symbol : <TranslatedText translationId={82}>Select a Token</TranslatedText>}
                        </Button>

                        <ColumnCenter>
                            <AddIcon color="textSubtle" />
                        </ColumnCenter>

                        <Button
                            onClick={() => {
                                setShowSearch(true)
                                setActiveField(Fields.TOKEN1)
                            }}
                            endIcon={<ChevronDownIcon width="24px" color="white" />}
                            fullWidth
                        >
                            {currency1 ? currency1.symbol : <TranslatedText translationId={82}>Select a Token</TranslatedText>}
                        </Button>

                        <ColumnCenter
                            style={{ justifyItems: 'center', backgroundColor: '', padding: '12px 0px', borderRadius: '12px' }}
                        >
                            <Button onClick={handleFindLp}>
                                Find LP
                            </Button>
                        </ColumnCenter>
                    </AutoColumn>

                    <CurrencySearchModal
                        isOpen={showSearch}
                        onCurrencySelect={handleCurrencySelect}
                        onDismiss={handleSearchDismiss}
                        showCommonBases
                        selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
                    />
                </CardBody>
            </BodyWrapper>
        </Page>
    )
}
