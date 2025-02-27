import { schemas } from '@polar-sh/client'
import { StateCreator } from 'zustand'

export interface OnboardingState {
  onboardingDashboardSkip: boolean
  setOnboardingDashboardSkip: (skip: boolean) => void

  onboardingDashboardInstallChromeExtensionSkip: boolean
  setOnboardingDashboardInstallChromeExtensionSkip: (skip: boolean) => void

  onboardingMaintainerConnectRepositoriesSkip: boolean
  setOnboardingMaintainerConnectRepositories: (skip: boolean) => void
}

export interface LastPledgeState {
  latestPledge:
    | {
        pledge: schemas['Pledge']
        redirectStatus: string
      }
    | undefined
  latestPledgeShown: boolean
  setLatestPledge: (pledge: schemas['Pledge'], redirectStatus: string) => void
  setLatestPledgeShown: (shown: boolean) => void
}

export interface UserSlice extends OnboardingState, LastPledgeState {
  resetState: () => void
}

const emptyState = {
  authenticated: false,
  currentUser: undefined,
  onboardingDashboardSkip: false,
  onboardingDashboardInstallChromeExtensionSkip: false,
  onboardingMaintainerConnectRepositoriesSkip: false,
  latestPledge: undefined,
  latestPledgeShown: false,
}

export const createUserSlice: StateCreator<UserSlice> = (set, _get) => ({
  ...emptyState,
  setOnboardingDashboardSkip: (skip: boolean) => {
    set({
      onboardingDashboardSkip: skip,
    })
  },
  setOnboardingDashboardInstallChromeExtensionSkip: (skip: boolean) => {
    set({
      onboardingDashboardInstallChromeExtensionSkip: skip,
    })
  },
  setOnboardingMaintainerConnectRepositories: (skip: boolean) => {
    set({
      onboardingMaintainerConnectRepositoriesSkip: skip,
    })
  },
  setLatestPledge: (pledge: schemas['Pledge'], redirectStatus: string) => {
    set({
      latestPledge: {
        pledge: pledge,
        redirectStatus: redirectStatus,
      },
      latestPledgeShown: false,
    })
  },
  setLatestPledgeShown: (shown: boolean) => {
    set({
      latestPledgeShown: shown,
    })
  },
  resetState: () => {
    set({ ...emptyState })
  },
})
