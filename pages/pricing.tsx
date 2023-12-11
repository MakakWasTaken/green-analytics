import TeamHeader from '@components/TeamHeader'
import { HeaderContext } from '@contexts/HeaderContext'
import { CheckCircle } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
  tabClasses,
} from '@mui/material'
import { User } from '@prisma/client'
import { api } from '@utils/network'
import { toTitleCase } from '@utils/utils'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/navigation'
import { FC, useContext, useMemo } from 'react'
import { toast } from 'sonner'
import Stripe from 'stripe'
import useSWR from 'swr'

// If using TypeScript, add the following snippet to your file as well.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
    }
  }
}

const PricingPage = () => {
  const {
    data: user,
    isLoading,
    mutate: setUser,
  } = useSWR<User>('/database/user/own')
  const { selectedTeam } = useContext(HeaderContext)

  const { data: plans, isLoading: plansLoading } = useSWR<{
    [key: string]: Stripe.Plan[]
  }>('database/plans')

  const router = useRouter()

  const currentPlanProductId = useMemo(() => {
    const subscription = selectedTeam?.subscription
    if (
      subscription?.status === 'active' ||
      subscription?.status === 'trialing'
    ) {
      return subscription.planProductId
    }
    if (!subscription) {
      // If it is not subscribed, find the free subscription plan
      const freePlan = plans?.month?.find((plan) => plan.amount === 0)
      if (freePlan) {
        return (freePlan.product as Stripe.Product).id
      }
    }
    return null
  }, [selectedTeam, plans])

  if (isLoading || plansLoading) {
    return <CircularProgress />
  }

  const handlePlanClick = (plan: Stripe.Plan) => {
    if (!user) {
      router.push('/api/auth/login?returnTo=/pricing')
      return
    }
    if (!selectedTeam) {
      toast.error('You need to select a team to continue')
      return
    }
    toast.promise(
      api.post<{
        ok: boolean
        message: string
        url?: string
      }>('stripe/checkout-session', {
        priceId: plan.id,
        selectedTeam: selectedTeam?.id,
      }),
      {
        loading: 'Creating Checkout Session..',
        error: (err) => err.message || err,
        success: (response) => {
          const data = response.data

          if (data.url) {
            // We have a Stripe Checkout URL, let's redirect.
            window.location.assign(data.url)
          } else {
            return 'Checkout Session Created, but url missing'
          }

          return 'Checkout Session Created, redirecting..'
        },
      },
    )
  }

  const CurrentPlanChip: FC<{ plan: Stripe.Plan }> = ({ plan }) => {
    if (currentPlanProductId === (plan.product as Stripe.Product | null)?.id) {
      return (
        <Chip color="primary" size="lg" variant="soft">
          Current Plan
        </Chip>
      )
    }
    return null
  }

  const DiscountChip: FC<{ plan: Stripe.Plan }> = ({ plan }) => {
    if (plans?.month && plan.interval === 'year') {
      const correspondingMonthlyPlan = plans.month.find(
        (monthlyPlan) =>
          (monthlyPlan.product as Stripe.Product | null)?.id ===
          (plan.product as Stripe.Product | null)?.id,
      )

      const discount =
        1 -
        (plan.amount ?? 0) /
          100 /
          12 /
          ((correspondingMonthlyPlan?.amount ?? 1) / 100)
      if (discount > 0) {
        return (
          <Chip size="lg" variant="soft">
            {`Save ${(discount * 100).toFixed(2)}%`}
          </Chip>
        )
      }
    }

    return null
  }

  return (
    <>
      <NextSeo
        title="Pricing"
        description="Pricing page for green analytics to find out the various products we offer."
      />
      <Box
        sx={{
          margin: '0 3vw',
          minHeight: 'calc(100vh - 75px)',
        }}
      >
        <TeamHeader />
        <Typography level="h1">Pricing</Typography>
        {plans && (
          <Tabs
            aria-label="Pricing plan"
            defaultValue={0}
            sx={{
              backgroundColor: 'transparent',
              borderRadius: 'lg',
              overflow: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <TabList
                disableUnderline
                tabFlex="auto"
                sx={{
                  p: 0.5,
                  gap: 0.5,
                  maxWidth: '250px',
                  borderRadius: 'xl',
                  bgcolor: 'background.level1',
                  [`& .${tabClasses.root}[aria-selected="true"]`]: {
                    boxShadow: 'sm',
                    bgcolor: 'background.surface',
                  },
                }}
              >
                {Object.keys(plans).map((interval) => (
                  <Tab disableIndicator>{`${toTitleCase(interval)}ly`}</Tab>
                ))}
              </TabList>
            </Box>
            {Object.keys(plans).map((interval, index) => (
              <TabPanel value={index}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: '10vw',
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                  }}
                >
                  {plans[interval]
                    .sort((a, b) => (a.amount ?? 0) - (b.amount ?? 0))
                    .map((plan) => (
                      <Card
                        sx={{
                          flex: 1.0 / plans[interval].length,
                          minHeight: '250px',
                          padding: 6,
                        }}
                        key={plan.id}
                      >
                        <CardContent>
                          <Box display="flex" gap={1}>
                            <Typography level="h3">
                              {(plan.product as Stripe.Product | null)?.name}
                            </Typography>
                            <DiscountChip plan={plan} />
                            <CurrentPlanChip plan={plan} />
                          </Box>
                          <Typography>
                            {
                              (plan.product as Stripe.Product | null)
                                ?.description
                            }
                          </Typography>
                          <Box sx={{ display: 'flex' }}>
                            <Typography
                              sx={{
                                fontSize: 50,
                                fontWeight: '900',
                                mr: 1,
                              }}
                            >
                              {plan.currency.toUpperCase()}{' '}
                              {(plan.amount ?? 0) / 100.0}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography>per</Typography>
                              <Typography>{plan.interval}</Typography>
                            </Box>
                          </Box>
                          <Button
                            sx={{ height: 50 }}
                            onClick={() => handlePlanClick(plan)}
                            disabled={
                              currentPlanProductId ===
                              (plan.product as Stripe.Product | null)?.id
                            }
                          >
                            {currentPlanProductId ===
                            (plan.product as Stripe.Product | null)?.id
                              ? 'Already Active'
                              : 'Subscribe'}
                          </Button>
                          <Typography>This includes:</Typography>
                          <List>
                            {(
                              plan.product as Stripe.Product | null
                            )?.features.map((feature) => (
                              <ListItem>
                                <CheckCircle />
                                <Typography>{feature.name}</Typography>
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    ))}
                </Box>
              </TabPanel>
            ))}
          </Tabs>
        )}
      </Box>
    </>
  )
}

export default PricingPage
