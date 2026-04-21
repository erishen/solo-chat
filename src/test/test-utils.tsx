/* eslint-disable react-refresh/only-export-components */
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

interface WrapperProps {
  children: React.ReactNode
}

export function AllTheProviders({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

export function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
