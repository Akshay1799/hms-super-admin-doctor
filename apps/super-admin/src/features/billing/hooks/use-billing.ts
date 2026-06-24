import { useQuery } from '@tanstack/react-query';
import { billingService } from '../services/billing.service';

export const useRevenueMetrics = () => {
  return useQuery({
    queryKey: ['revenueMetrics'],
    queryFn: billingService.getRevenueMetrics,
  });
};

export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: billingService.getInvoices,
  });
};

export const useInvoiceDetails = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => billingService.getInvoiceById(id),
    enabled: !!id,
  });
};

export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: billingService.getPayments,
  });
};

export const useClaims = () => {
  return useQuery({
    queryKey: ['claims'],
    queryFn: billingService.getClaims,
  });
};

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: billingService.getSubscriptions,
  });
};

export const useRefunds = () => {
  return useQuery({
    queryKey: ['refunds'],
    queryFn: billingService.getRefunds,
  });
};

export const useRevenueChartData = () => {
  return useQuery({
    queryKey: ['revenueChartData'],
    queryFn: billingService.getRevenueChartData,
  });
};
