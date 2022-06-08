import React, { KeyboardEvent, RefObject, useCallback, useEffect, useState, useRef } from 'react'
import Modal from 'components/Modal'
import { Text, CloseIcon, Button } from '@pancakeswap-libs/uikit'
import styled from 'styled-components'
import { NotificationManager } from 'react-notifications';
import { fetchToken } from 'state/farms/fetchFarms'
import { Row, Column, ColumnCenter, RowBetween } from "./index"


export class Currency {
    readonly decimals: number;

    readonly symbol?: string;

    readonly name?: string;

    readonly address?: string;
}

const Heading = styled.div`
  padding: 10px;
`
const SearchInput = styled.input`
  position: relative;
  display: flex;
  padding: 16px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background: none;
  border: none;
  outline: none;
  border-radius: 20px;
  color: white;
  border-style: solid;
  border: 1px solid #D0B49F;
  -webkit-appearance: none;

  font-size: 18px;

  ::placeholder {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
  transition: border 100ms;
  :focus {
    border: 1px solid #D0B49F;
    outline: none;
  }
`

interface CurrencySearchModalProps {
    isOpen: boolean
    onDismiss: () => void
    selectedCurrency?: Currency | null
    onCurrencySelect: (currency: Currency) => void
    otherSelectedCurrency?: Currency | null
    // eslint-disable-next-line react/no-unused-prop-types
    showCommonBases?: boolean
}

export default function CurrencySearchModal({
    isOpen,
    onDismiss,
    onCurrencySelect,
    selectedCurrency,
    otherSelectedCurrency,
}: CurrencySearchModalProps) {
    const [listView, setListView] = useState<boolean>(false);
    const [searchQuery, SetSearchQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>()

    const handleSearchToken = useCallback(async (tokenAddress) => {
        let currency;
        try {
            currency = await fetchToken(tokenAddress);
            onCurrencySelect(currency)
            onDismiss()
        } catch (err) {
            NotificationManager.error("invalid address", 'Find Token failed');
        }
    }, [onCurrencySelect])

    const handleEnter = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                handleSearchToken(searchQuery);
            }
        },
        [handleSearchToken]
    )

    return (
        <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90} minHeight={0}>
            <Column style={{ width: '100%', flex: '1 1', padding: "10px" }}>
                <Heading>
                    <RowBetween>
                        <Text color="white">
                            Enter Token Contract Address
                        </Text>
                        <CloseIcon onClick={onDismiss} />
                    </RowBetween>
                </Heading>
                <SearchInput
                    type="text"
                    id="token-search-input"
                    placeholder='Enter Token Contract Address'
                    value={searchQuery}
                    ref={inputRef as RefObject<HTMLInputElement>}
                    onChange={(e) => { SetSearchQuery(e.target.value) }}
                    onKeyDown={handleEnter}
                />
                <Heading>
                    <ColumnCenter>
                        <Button onClick={() => { handleSearchToken(searchQuery) }}>
                            Find Token
                        </Button>
                    </ColumnCenter>
                </Heading>
            </Column>
        </Modal>
    )
}
