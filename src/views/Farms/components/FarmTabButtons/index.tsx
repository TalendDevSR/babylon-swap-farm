import React from 'react'
import styled from 'styled-components'
import { useRouteMatch, Link } from 'react-router-dom'
import { ButtonMenu, ButtonMenuItem, Text, Toggle, Button } from '@pancakeswap-libs/uikit'
import useI18n from 'hooks/useI18n'

const FarmTabButtons = ({ stakedOnly, setStakedOnly, isPublic, setIsPublic }) => {
    const { url, isExact } = useRouteMatch()
    const TranslateString = useI18n()

    return (
        <Wrapper>
            {/* <ToggleWrapper>
                <Toggle checked={stakedOnly} onChange={() => setStakedOnly(!stakedOnly)} />
                <Text> {TranslateString(699, 'Staked only')}</Text>
            </ToggleWrapper> */}
            <Button style={{ height: "50px" }} onClick={() => setIsPublic(true)}>
                {TranslateString(698, 'Native Farms')}
            </Button>
            <Button style={{ height: "50px" }} onClick={() => setIsPublic(false)}>
                {TranslateString(700, 'Non-Native Farms')}
            </Button>
        </Wrapper>
    )
}

export default FarmTabButtons

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
`

const ToggleWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 32px;

  ${Text} {
    margin-left: 8px;
  }
`