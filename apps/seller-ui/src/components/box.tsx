'use client'

import React from "react"
import styled from "styled-components"

type CSSVars = React.CSSProperties & {
  [key: string]: string | number | undefined
}

interface BoxProps {
  css?: CSSVars
}


export const Box = styled.div<BoxProps>`
  box-sizing: border-box;
`