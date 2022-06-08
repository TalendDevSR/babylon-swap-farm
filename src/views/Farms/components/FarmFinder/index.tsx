import React from 'react'
import styled from 'styled-components'
import { NavLink, Link as HistoryLink } from 'react-router-dom'
import { Box } from 'rebass/styled-components'
import { ArrowLeft } from 'react-feather'

import { Card } from '@pancakeswap-libs/uikit'

export default Card

export const LightCard = styled(Card)`
  border: 1px solid #D0B49F;
`

// Column
export const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`
export const ColumnCenter = styled(Column)`
  width: 100%;
  align-items: center;
`

export const AutoColumn = styled.div<{
  gap?: 'sm' | 'md' | 'lg' | string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => (gap === 'sm' && '8px') || (gap === 'md' && '12px') || (gap === 'lg' && '24px') || gap};
  justify-items: ${({ justify }) => justify && justify};
`

// find tab


const Tabs = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

export const Row = styled(Box)<{ align?: string; padding?: string; border?: string; borderRadius?: string }>`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: ${({ align }) => (align || 'center')};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`

export const RowBetween = styled(Row)`
  justify-content: space-between;
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.colors.text};
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 20px;
`

export const BodyWrapper = styled(Card)`
  margin: auto;
  position: relative;
  max-width: 436px;
  width: 100%;
  z-index: 5;
  border-radius:20px;
`

export function FindPoolTabs() {
    return (
      <Tabs>
        <RowBetween style={{ padding: '1rem' }}>
          <HistoryLink to="/farms">
            <StyledArrowLeft />
          </HistoryLink>
          <ActiveText>Import Pool</ActiveText>
          <div></div>
          </RowBetween>
      </Tabs>
    )
  }